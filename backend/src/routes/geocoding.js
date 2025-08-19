const express = require('express');
const { prisma } = require('../utils/prisma');
const router = express.Router();

// Input validation for geocoding
const validateGeocodeUpdate = (data) => {
  const { studioId, latitude, longitude, address } = data;
  
  if (!studioId || typeof studioId !== 'string' || studioId.trim().length === 0) {
    throw new Error('Studio ID is required and must be a non-empty string');
  }
  
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || lat < -90 || lat > 90) {
    throw new Error('Latitude must be a valid number between -90 and 90');
  }
  
  if (isNaN(lng) || lng < -180 || lng > 180) {
    throw new Error('Longitude must be a valid number between -180 and 180');
  }
  
  return {
    studioId: studioId.trim(),
    latitude: lat,
    longitude: lng,
    address: address ? String(address).trim() : undefined
  };
};

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
    
    // Add verified filter (removed to allow all studios)
    // if (verified === 'true') {
    //   whereClause.isVerified = true;
    // }
    
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
    // Validate and sanitize input
    const validatedData = validateGeocodeUpdate(req.body);
    const { studioId, latitude, longitude, address } = validatedData;
    
    // Check if studio exists first
    const existingStudio = await prisma.studio.findUnique({
      where: { id: studioId },
      select: { id: true, title: true, isActive: true }
    });
    
    if (!existingStudio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }
    
    if (!existingStudio.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update coordinates for inactive studio'
      });
    }
    
    // Update studio coordinates using Prisma with explicit field whitelisting
    // Use raw SQL as fallback if Prisma fails
    let updatedStudio;
    try {
      updatedStudio = await prisma.studio.update({
        where: { id: studioId },
        data: {
          latitude: latitude,
          longitude: longitude
        },
        select: {
          id: true,
          title: true,
          latitude: true,
          longitude: true
        }
      });
    } catch (prismaError) {
      console.log('⚠️ Prisma update failed, trying raw SQL...', prismaError.message);
      
      // Fallback to raw SQL if Prisma fails
      const result = await prisma.$executeRaw`
        UPDATE studios 
        SET latitude = ${latitude}, longitude = ${longitude}
        WHERE id = ${studioId}
      `;
      
      if (result === 1) {
        // Fetch the updated studio
        updatedStudio = await prisma.studio.findUnique({
          where: { id: studioId },
          select: {
            id: true,
            title: true,
            latitude: true,
            longitude: true
          }
        });
      } else {
        throw new Error('Failed to update studio coordinates');
      }
    }
    
    // Note: Geocode cache temporarily disabled due to database schema mismatch
    // TODO: Fix geocode_cache table structure in production
    console.log(`📝 Successfully saved coordinates: ${existingStudio.title} → ${latitude}, ${longitude}`);
    if (address) {
      console.log(`📍 Address: ${address}`);
    }
    
    res.json({
      success: true,
      data: {
        studio: updatedStudio,
        message: 'Coordinates saved successfully'
      }
    });
    
  } catch (error) {
    console.error('Error saving geocoding result:', error);
    
    // Handle validation errors specifically
    if (error.message.includes('Latitude') || error.message.includes('Longitude') || error.message.includes('Studio ID')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    // Handle Prisma errors
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }
    
    // Handle the specific "column 'new' does not exist" error
    if (error.message && error.message.includes("column 'new' does not exist")) {
      console.error('🚨 Critical Prisma error - column "new" does not exist');
      console.error('This suggests a Prisma client or schema mismatch issue');
      return res.status(500).json({
        success: false,
        error: 'Database schema error - please contact support'
      });
    }
    
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
        // Ensure studio has at least some address information
        address: {
          not: null,
          not: '',
          notIn: ['null', 'undefined', 'N/A', 'n/a']
        }
      },
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        latitude: true,
        longitude: true
      },
      take: parseInt(limit),
      orderBy: {
        createdAt: 'asc' // Process older studios first
      }
    });
    
    // Filter and add full address for each studio
    const studiosWithAddress = studios
      .filter(studio => {
        // Additional filtering to ensure we have meaningful address data
        const hasAddress = studio.address && studio.address.trim().length > 0;
        const hasCity = studio.city && studio.city.trim().length > 0;
        return hasAddress || hasCity; // Need at least address or city
      })
      .map(studio => {
        // Build full address with fallbacks
        const addressParts = [
          studio.address?.trim(),
          studio.city?.trim(),
          studio.state?.trim(),
          studio.zipCode?.trim(),
          studio.country?.trim() || 'Canada' // Default to Canada if no country
        ].filter(part => part && part.length > 0);
        
        return {
          ...studio,
          full_address: addressParts.join(', '),
          hasPartialCoordinates: (studio.latitude && !studio.longitude) || (!studio.latitude && studio.longitude)
        };
      });
    
    console.log(`📋 Found ${studiosWithAddress.length} studios needing geocoding (filtered from ${studios.length} raw results)`);
    
    res.json({
      success: true,
      data: studiosWithAddress,
      count: studiosWithAddress.length,
      rawCount: studios.length
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

// Get geocoding statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total studios count
    const totalStudios = await prisma.studio.count({
      where: { isActive: true }
    });

    // Get studios with coordinates
    const studiosWithCoordinates = await prisma.studio.count({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null }
      }
    });

    // Get studios without coordinates
    const studiosWithoutCoordinates = await prisma.studio.count({
      where: {
        isActive: true,
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    });

    res.json({
      success: true,
      data: {
        total: totalStudios,
        withCoordinates: studiosWithCoordinates,
        withoutCoordinates: studiosWithoutCoordinates,
        percentage: totalStudios > 0 ? Math.round((studiosWithCoordinates / totalStudios) * 100) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching geocoding stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch geocoding statistics'
    });
  }
});

module.exports = router; // Force complete rebuild 1754773676
