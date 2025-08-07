const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all studios with coordinates for map display
router.get('/studios', async (req, res) => {
  try {
    const { lat_min, lat_max, lng_min, lng_max, limit = 100 } = req.query;
    
    // Build query with optional bounding box filter
    let whereClause = {
      isActive: true,
      latitude: { not: null },
      longitude: { not: null }
    };
    
    // Add bounding box filter if provided
    if (lat_min && lat_max && lng_min && lng_max) {
      whereClause.latitude = {
        gte: parseFloat(lat_min),
        lte: parseFloat(lat_max)
      };
      whereClause.longitude = {
        gte: parseFloat(lng_min),
        lte: parseFloat(lng_max)
      };
    }
    
    const studios = await prisma.studio.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        latitude: true,
        longitude: true,
        website: true,
        phoneNumber: true,
        email: true,
        isVerified: true,
        isFeatured: true
      },
      take: parseInt(limit)
    });
    
    // Convert to GeoJSON format
    const geojson = {
      type: 'FeatureCollection',
      features: studios.map(studio => ({
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
          website: studio.website,
          phoneNumber: studio.phoneNumber,
          email: studio.email,
          isVerified: studio.isVerified,
          isFeatured: studio.isFeatured
        }
      }))
    };
    
    res.json({
      success: true,
      data: geojson,
      count: studios.length
    });
    
  } catch (error) {
    console.error('Error fetching studios with geocoding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studios with geocoding'
    });
  }
});

// Get geocoding status
router.get('/status', async (req, res) => {
  try {
    const totalStudios = await prisma.studio.count({
      where: { isActive: true }
    });
    
    const geocodedStudios = await prisma.studio.count({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    const missingCoordinates = totalStudios - geocodedStudios;
    const percentageComplete = totalStudios > 0 ? (geocodedStudios / totalStudios) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        total_studios: totalStudios,
        geocoded_studios: geocodedStudios,
        missing_coordinates: missingCoordinates,
        percentage_complete: Math.round(percentageComplete * 100) / 100
      }
    });
    
  } catch (error) {
    console.error('Error fetching geocoding status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch geocoding status'
    });
  }
});

// Save geocoding result from frontend
router.post('/save-result', async (req, res) => {
  try {
    const { studioId, latitude, longitude, address } = req.body;
    
    if (!studioId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Studio ID, latitude, and longitude are required'
      });
    }
    
    // Update studio coordinates
    const updatedStudio = await prisma.studio.update({
      where: { id: studioId },
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        updatedAt: new Date()
      }
    });
    
    // Note: Geocode cache temporarily disabled due to database schema mismatch
    // TODO: Fix geocode_cache table structure in production
    console.log(`📝 Would cache: ${address} → ${latitude}, ${longitude}`);
    
    res.json({
      success: true,
      data: {
        studio: updatedStudio,
        message: 'Coordinates saved successfully'
      }
    });
    
  } catch (error) {
    console.error('Error saving geocoding result:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save geocoding result'
    });
  }
});

// Get studios that need geocoding
router.get('/pending', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const studios = await prisma.studio.findMany({
      where: {
        isActive: true,
        OR: [
          { latitude: null },
          { longitude: null }
        ],
        address: { not: null }
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
      take: parseInt(limit)
    });
    
    // Add full address for each studio
    const studiosWithAddress = studios.map(studio => ({
      ...studio,
      full_address: [
        studio.address,
        studio.city,
        studio.state,
        studio.zipCode,
        studio.country
      ].filter(Boolean).join(', ')
    }));
    
    res.json({
      success: true,
      data: studiosWithAddress,
      count: studiosWithAddress.length
    });
    
  } catch (error) {
    console.error('Error fetching pending studios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending studios'
    });
  }
});

// Get cached geocoding result
router.get('/cache/:addressHash', async (req, res) => {
  try {
    const { addressHash } = req.params;
    
    const cached = await prisma.geocodeCache.findUnique({
      where: { addressHash }
    });
    
    if (cached) {
      res.json({
        success: true,
        data: {
          latitude: cached.latitude,
          longitude: cached.longitude,
          original_address: cached.originalAddress,
          cached: true
        }
      });
    } else {
      res.json({
        success: false,
        data: null,
        message: 'No cached result found'
      });
    }
    
  } catch (error) {
    console.error('Error fetching cached result:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cached result'
    });
  }
});

// Clear geocoding cache
router.delete('/cache', async (req, res) => {
  try {
    // Clear cache older than 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const deleted = await prisma.geocodeCache.deleteMany({
      where: {
        updatedAt: {
          lt: sevenDaysAgo
        }
      }
    });
    
    res.json({
      success: true,
      data: {
        deleted_count: deleted.count,
        message: 'Cache cleared successfully'
      }
    });
    
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
});

// Get cache statistics
router.get('/cache-stats', async (req, res) => {
  try {
    const totalCache = await prisma.geocodeCache.count();
    const recentCache = await prisma.geocodeCache.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    
    res.json({
      success: true,
      data: {
        total_cached: totalCache,
        recent_cached: recentCache,
        cache_age_hours: 24
      }
    });
    
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cache statistics'
    });
  }
});

module.exports = router; 