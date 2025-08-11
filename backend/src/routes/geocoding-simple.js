const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');

const prisma = new PrismaClient();

// Create a direct PostgreSQL connection pool to bypass Prisma schema issues
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Simple geocoding status endpoint
router.get('/status', async (req, res) => {
  try {
    // Get basic counts
    const totalStudios = await prisma.studio.count({ where: { isActive: true } });
    const withCoordinates = await prisma.studio.count({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    const withoutCoordinates = totalStudios - withCoordinates;

    res.json({
      success: true,
      data: {
        total: totalStudios,
        withCoordinates,
        withoutCoordinates,
        percentage: totalStudios > 0 ? Math.round((withCoordinates / totalStudios) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error getting geocoding status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get geocoding status'
    });
  }
});

// Get studios that need geocoding
router.get('/pending', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    // Simple query - just get studios without coordinates
    const studios = await prisma.studio.findMany({
      where: {
        isActive: true,
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      },
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true
      },
      take: parseInt(limit) || 50,
      orderBy: { createdAt: 'asc' }
    });

    // Build full addresses with better formatting
    const studiosWithAddress = studios.map(studio => {
      // Clean and validate each address component
      const cleanAddress = studio.address ? studio.address.trim().replace(/[,\s]+/g, ' ').trim() : '';
      const cleanCity = studio.city ? studio.city.trim().replace(/[,\s]+/g, ' ').trim() : '';
      const cleanState = studio.state ? studio.state.trim().replace(/[,\s]+/g, ' ').trim() : '';
      const cleanZipCode = studio.zipCode ? studio.zipCode.trim().replace(/[,\s]+/g, ' ').trim() : '';
      const cleanCountry = studio.country ? studio.country.trim().replace(/[,\s]+/g, ' ').trim() : 'United Kingdom';
      
      // Build address parts, filtering out empty or invalid values
      const addressParts = [
        cleanAddress,
        cleanCity,
        cleanState,
        cleanZipCode,
        cleanCountry
      ].filter(part => part && part.length > 0 && part !== 'null' && part !== 'undefined' && part !== 'N/A' && part !== 'n/a');
      
      // Create the full address
      const full_address = addressParts.join(', ');
      
      // Log problematic addresses for debugging
      if (addressParts.length < 2) {
        console.log(`⚠️ Studio "${studio.title}" has insufficient address data:`, {
          address: studio.address,
          city: studio.city,
          state: studio.state,
          zipCode: studio.zipCode,
          country: studio.country,
          full_address
        });
      }
      
      return {
        ...studio,
        full_address,
        address_quality: addressParts.length // Number of valid address components
      };
    });

    // Filter out studios with insufficient address data
    const validStudios = studiosWithAddress.filter(studio => studio.address_quality >= 2);
    const invalidStudios = studiosWithAddress.filter(studio => studio.address_quality < 2);
    
    if (invalidStudios.length > 0) {
      console.log(`⚠️ Found ${invalidStudios.length} studios with insufficient address data:`, 
        invalidStudios.map(s => `${s.title} (${s.address_quality} parts)`)
      );
    }
    
    res.json({
      success: true,
      data: validStudios,
      count: validStudios.length,
      total: studiosWithAddress.length,
      invalid: invalidStudios.length,
      address_quality_summary: {
        excellent: validStudios.filter(s => s.address_quality >= 4).length,
        good: validStudios.filter(s => s.address_quality === 3).length,
        minimal: validStudios.filter(s => s.address_quality === 2).length,
        insufficient: invalidStudios.length
      }
    });

  } catch (error) {
    console.error('Error fetching pending studios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending studios'
    });
  }
});

// Save geocoding result - SIMPLE VERSION
router.post('/save-result', async (req, res) => {
  try {
    console.log('📝 Received geocoding request:', req.body);
    const { studioId, latitude, longitude } = req.body;

    // Basic validation
    if (!studioId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: studioId, latitude, longitude'
      });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        error: 'Invalid latitude'
      });
    }
    
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        error: 'Invalid longitude'
      });
    }

    // Check if studio exists
    const existingStudio = await prisma.studio.findUnique({
      where: { id: studioId },
      select: { id: true, title: true }
    });

    if (!existingStudio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }

    // Use direct PostgreSQL connection to bypass Prisma schema issues
    console.log(`🔄 Updating studio ${studioId} with coordinates: ${lat}, ${lng}`);
    
    // Use direct PostgreSQL query to avoid Prisma schema validation
    const query = 'UPDATE studios SET latitude = $1, longitude = $2 WHERE id = $3';
    const values = [lat, lng, studioId];
    
    const result = await pool.query(query, values);
    console.log(`📊 Update result:`, result.rowCount);
    
    const updateResult = result.rowCount;

    if (updateResult === 1) {
      console.log(`✅ Updated coordinates for ${existingStudio.title}: ${lat}, ${lng}`);
      
      res.json({
        success: true,
        data: {
          studio: {
            id: studioId,
            title: existingStudio.title,
            latitude: lat,
            longitude: lng
          },
          message: 'Coordinates saved successfully'
        }
      });
    } else {
      throw new Error('Update failed - no rows affected');
    }

  } catch (error) {
    console.error('Error saving geocoding result:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
      stack: error.stack
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to save coordinates';
    
    if (error.code === 'P2025') {
      errorMessage = 'Studio not found';
    } else if (error.code === 'P2002') {
      errorMessage = 'Database constraint violation';
    } else if (error.message && error.message.includes('column')) {
      errorMessage = 'Database schema error';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all studios for map display
router.get('/studios', async (req, res) => {
  try {
    const studios = await prisma.studio.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true
      }
    });

    // Convert to GeoJSON format
    const geoJson = {
      type: 'FeatureCollection',
      features: studios
        .filter(studio => studio.latitude && studio.longitude)
        .map(studio => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [studio.longitude, studio.latitude]
          },
          properties: {
            id: studio.id,
            title: studio.title,
            address: studio.address,
            city: studio.city,
            state: studio.state,
            zipCode: studio.zipCode,
            country: studio.country,
            hasCoordinates: true
          }
        }))
    };

    res.json({
      success: true,
      data: geoJson,
      count: geoJson.features.length,
      total: studios.length
    });

  } catch (error) {
    console.error('Error fetching studios for map:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studios'
    });
  }
});

// Get single studio by ID
router.get('/studios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const studio = await prisma.studio.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true
      }
    });

    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }

    // Convert to GeoJSON
    const geoJson = {
      type: 'Feature',
      geometry: studio.latitude && studio.longitude ? {
        type: 'Point',
        coordinates: [studio.longitude, studio.latitude]
      } : null,
      properties: {
        id: studio.id,
        title: studio.title,
        address: studio.address,
        city: studio.city,
        state: studio.state,
        zipCode: studio.zipCode,
        country: studio.country,
        hasCoordinates: !!(studio.latitude && studio.longitude)
      }
    };

    res.json({
      success: true,
      data: geoJson
    });

  } catch (error) {
    console.error('Error fetching studio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studio'
    });
  }
});

module.exports = router;
