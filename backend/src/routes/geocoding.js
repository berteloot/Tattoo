const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all studios with coordinates for map display
router.get('/studios', async (req, res) => {
  try {
    const { lat_min, lat_max, lng_min, lng_max, limit = 100, search, verified, featured } = req.query;
    
    // Build query with optional filters
    let whereClause = {
      isActive: true
    };
    
    // Add search filter
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Add verified filter
    if (verified === 'true') {
      whereClause.isVerified = true;
    }
    
    // Add featured filter
    if (featured === 'true') {
      whereClause.isFeatured = true;
    }
    
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
    
    // Convert to GeoJSON format, including studios without coordinates
    const geojson = {
      type: 'FeatureCollection',
      features: studios.map(studio => {
        const hasCoordinates = studio.latitude && studio.longitude;
        
        return {
          type: 'Feature',
          geometry: hasCoordinates ? {
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
            website: studio.website,
            phoneNumber: studio.phoneNumber,
            email: studio.email,
            isVerified: studio.isVerified,
            isFeatured: studio.isFeatured,
            hasCoordinates: hasCoordinates,
            needsGeocoding: !hasCoordinates
          }
        };
      })
    };
    
    res.json({
      success: true,
      data: geojson,
      count: studios.length,
      withCoordinates: studios.filter(s => s.latitude && s.longitude).length,
      withoutCoordinates: studios.filter(s => !s.latitude || !s.longitude).length
    });
    
  } catch (error) {
    console.error('Error fetching studios with geocoding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studios with geocoding'
    });
  }
});

// Get a specific studio for map focusing
router.get('/studios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const studio = await prisma.studio.findUnique({
      where: { id },
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
      }
    });
    
    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }
    
    const hasCoordinates = studio.latitude && studio.longitude;
    
    const geojson = {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: hasCoordinates ? {
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
          website: studio.website,
          phoneNumber: studio.phoneNumber,
          email: studio.email,
          isVerified: studio.isVerified,
          isFeatured: studio.isFeatured,
          hasCoordinates: hasCoordinates,
          needsGeocoding: !hasCoordinates
        }
      }]
    };
    
    res.json({
      success: true,
      data: geojson,
      studio: studio,
      hasCoordinates: hasCoordinates
    });
    
  } catch (error) {
    console.error('Error fetching studio for map:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studio for map'
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
    
    // Update studio coordinates using Prisma with explicit field whitelisting
    const updatedStudio = await prisma.studio.update({
      where: { id: studioId },
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
        // Explicitly omit updatedAt - let Prisma handle it via @updatedAt
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
        AND: [
          { address: { not: null } },
          { address: { not: '' } },
          { address: { not: 'null' } }
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

// Get cached geocoding result (temporarily disabled)
router.get('/cache/:addressHash', async (req, res) => {
  res.json({
    success: false,
    data: null,
    message: 'Cache temporarily disabled - geocode_cache table needs to be fixed'
  });
});

// Clear geocoding cache (temporarily disabled)
router.delete('/cache', async (req, res) => {
  res.json({
    success: true,
    data: {
      deleted_count: 0,
      message: 'Cache temporarily disabled - no cache to clear'
    }
  });
});

// Get cache statistics (temporarily disabled)
router.get('/cache-stats', async (req, res) => {
  res.json({
    success: true,
    data: {
      total_cached: 0,
      recent_cached: 0,
      cache_age_hours: 24
    }
  });
});

module.exports = router; 