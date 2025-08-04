const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { 
  geocodeAddress, 
  batchGeocode, 
  getCacheStats, 
  clearCache 
} = require('../utils/geocodingService');

const prisma = new PrismaClient();

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

    const result = await geocodeAddress(address);
    res.json(result);

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

    if (addresses.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 addresses per batch'
      });
    }

    const results = await batchGeocode(addresses);
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

/**
 * @route   GET /api/geocoding/cache-stats
 * @desc    Get cache statistics
 * @access  Admin only
 */
router.get('/cache-stats', async (req, res) => {
  try {
    const stats = getCacheStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Cache stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cache statistics',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/geocoding/clear-cache
 * @desc    Clear all cache
 * @access  Admin only
 */
router.post('/clear-cache', async (req, res) => {
  try {
    await clearCache();
    res.json({
      success: true,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('❌ Clear cache error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
      details: error.message
    });
  }
});

module.exports = router; 