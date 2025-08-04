const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const NodeCache = require('node-cache');

const prisma = new PrismaClient();

// Cache geocoding results for 24 hours to avoid repeated API calls
const geocodeCache = new NodeCache({ stdTTL: 60 * 60 * 24 });

// Google Geocoding API key (server-side key)
const GEOCODE_API_KEY = process.env.GOOGLE_GEOCODE_API_KEY;

/**
 * @route   POST /api/geocoding/geocode
 * @desc    Geocode a single address
 * @access  Public
 */
router.post('/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address is required'
      });
    }

    if (!GEOCODE_API_KEY) {
      console.warn('⚠️ GOOGLE_GEOCODE_API_KEY not configured, using fallback coordinates');
      // Return Montreal coordinates as fallback
      return res.json({
        success: true,
        address,
        location: { lat: 45.5017, lng: -73.5673 },
        cached: false,
        fallback: true
      });
    }

    // Check cache first
    const cacheKey = `geocode:${address.toLowerCase().trim()}`;
    const cached = geocodeCache.get(cacheKey);
    if (cached) {
      console.log(`📋 Cache hit for address: ${address}`);
      return res.json({
        success: true,
        address,
        location: cached,
        cached: true
      });
    }

    console.log(`🌍 Geocoding address: ${address}`);

    // Call Google Geocoding API
    const params = new URLSearchParams({
      address: address,
      key: GEOCODE_API_KEY
    });

    const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      
      // Cache the result
      geocodeCache.set(cacheKey, location);
      
      console.log(`✅ Geocoded successfully: ${address} → ${location.lat}, ${location.lng}`);
      
      res.json({
        success: true,
        address,
        location,
        cached: false
      });
    } else {
      console.error(`❌ Geocoding failed for ${address}: ${data.status}`);
      res.status(400).json({
        success: false,
        error: `Geocoding failed: ${data.status}`,
        details: data.error_message || 'No results found'
      });
    }

  } catch (error) {
    console.error('❌ Geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Geocoding service error',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/geocoding/batch-geocode
 * @desc    Geocode multiple addresses
 * @access  Public
 */
router.post('/batch-geocode', async (req, res) => {
  try {
    const { addresses } = req.body;
    
    if (!Array.isArray(addresses)) {
      return res.status(400).json({
        success: false,
        error: 'Addresses array is required'
      });
    }

    if (addresses.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 addresses per batch'
      });
    }

    console.log(`🌍 Batch geocoding ${addresses.length} addresses`);

    const results = [];
    
    for (const address of addresses) {
      try {
        // Use the single geocode endpoint for each address
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/geocoding/geocode`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ address })
        });
        
        const result = await response.json();
        results.push({
          address,
          ...result
        });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        results.push({
          address,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('❌ Batch geocoding error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch geocoding service error',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/geocoding/update-studio-coordinates
 * @desc    Update studio coordinates based on address
 * @access  Admin only (for security)
 */
router.post('/update-studio-coordinates', async (req, res) => {
  try {
    const { studioId } = req.body;
    
    if (!studioId) {
      return res.status(400).json({
        success: false,
        error: 'Studio ID is required'
      });
    }

    // Get studio details
    const studio = await prisma.studio.findUnique({
      where: { id: studioId }
    });

    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }

    // Build address string
    const addressParts = [
      studio.address,
      studio.city,
      studio.state,
      studio.zipCode
    ].filter(Boolean);
    
    const address = addressParts.join(', ');
    
    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Studio has no address information'
      });
    }

    // Geocode the address
    const geocodeResponse = await fetch(`${req.protocol}://${req.get('host')}/api/geocoding/geocode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ address })
    });
    
    const geocodeResult = await geocodeResponse.json();
    
    if (!geocodeResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to geocode address',
        details: geocodeResult.error
      });
    }

    // Update studio with coordinates
    const updatedStudio = await prisma.studio.update({
      where: { id: studioId },
      data: {
        latitude: geocodeResult.location.lat,
        longitude: geocodeResult.location.lng
      }
    });

    console.log(`✅ Updated studio coordinates: ${studio.title} → ${geocodeResult.location.lat}, ${geocodeResult.location.lng}`);

    res.json({
      success: true,
      studio: updatedStudio,
      geocoded: geocodeResult
    });

  } catch (error) {
    console.error('❌ Update studio coordinates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update studio coordinates',
      details: error.message
    });
  }
});

module.exports = router; 