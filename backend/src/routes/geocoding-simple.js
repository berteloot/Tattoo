const express = require('express');
const { prisma } = require('../utils/prisma');
const crypto = require('crypto'); // Added for caching

const router = express.Router();

// Logging middleware for all geocoding routes
router.use((req, res, next) => {
  console.log(`🔍 [GEOCODING] ${req.method} ${req.path} - IP: ${req.ip}`);
  console.log(`🔍 [GEOCODING] Headers:`, req.headers);
  next();
});

// Get geocoding statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('🔍 [GEOCODING] GET /stats - Processing request');
    
    const totalStudios = await prisma.studio.count();
    console.log(`📊 Total studios found: ${totalStudios}`);
    
    const studiosWithCoords = await prisma.studio.count({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    console.log(`📍 Studios with coordinates: ${studiosWithCoords}`);
    
    const studiosNeedingGeocoding = totalStudios - studiosWithCoords;
    const cachedAddresses = await prisma.geocodeCache.count();
    
    const stats = {
      totalStudios,
      studiosWithCoords,
      studiosNeedingGeocoding,
      cachedAddresses,
      progress: totalStudios > 0 ? Math.round((studiosWithCoords / totalStudios) * 100) : 0
    };
    
    console.log(`📈 Stats calculated:`, stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error getting geocoding stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get geocoding statistics',
      details: error.message 
    });
  }
});

// Test endpoint to verify data structure
router.get('/test', async (req, res) => {
  try {
    const testStudio = await prisma.studio.findFirst({
      where: {
        latitude: { not: null },
        longitude: { not: null }
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
        longitude: true,
        phoneNumber: true,
        email: true,
        website: true,
        isVerified: true,
        isFeatured: true
      }
    });

    if (!testStudio) {
      return res.json({
        success: false,
        error: 'No studios with coordinates found'
      });
    }

    const processedStudio = {
      ...testStudio,
      fullAddress: [testStudio.address, testStudio.city, testStudio.state, testStudio.zipCode, testStudio.country]
        .filter(Boolean)
        .join(', '),
      hasCoordinates: testStudio.latitude !== null && testStudio.longitude !== null,
      _count: {
        artists: 0
      }
    };

    res.json({
      success: true,
      data: {
        original: testStudio,
        processed: processedStudio,
        message: 'Test studio data structure'
      }
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ success: false, error: 'Failed to get test data' });
  }
});

// Get studios that need geocoding
router.get('/pending', async (req, res) => {
  try {
    console.log('🔍 [GEOCODING] GET /pending - Processing request');
    const limit = parseInt(req.query.limit) || 10;
    console.log(`📋 Requested limit: ${limit}`);
    
    const studios = await prisma.studio.findMany({
      where: {
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
      take: limit
    });

    console.log(`📋 Found ${studios.length} studios needing geocoding`);

    res.json({
      success: true,
      data: studios.map(studio => ({
        ...studio,
        fullAddress: [studio.address, studio.city, studio.state, studio.zipCode, studio.country]
          .filter(Boolean)
          .join(', ')
      }))
    });
  } catch (error) {
    console.error('❌ Error getting pending studios:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get pending studios',
      details: error.message 
    });
  }
});

// Get all studios (for frontend display)
router.get('/studios', async (req, res) => {
  try {
    const studios = await prisma.studio.findMany({
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
        phoneNumber: true,
        email: true,
        website: true,
        isVerified: true,
        isFeatured: true
      }
    });

    res.json({
      success: true,
      data: studios.map(studio => ({
        ...studio,
        fullAddress: [studio.address, studio.city, studio.state, studio.zipCode, studio.country]
          .filter(Boolean)
          .join(', '),
        hasCoordinates: studio.latitude !== null && studio.longitude !== null,
        // Set default artist count since we can't easily count them without proper relationship
        _count: {
          artists: 0
        }
      }))
    });
  } catch (error) {
    console.error('Error getting studios:', error);
    res.status(500).json({ success: false, error: 'Failed to get studios' });
  }
});

// Save geocoding result (minimal version to test)
router.post('/save-result', async (req, res) => {
  console.log('🔍 [GEOCODING] POST /save-result - Processing request');
  console.log('📝 Request body:', req.body);
  
  const { studioId, latitude, longitude, address } = req.body;
  
  if (!studioId || latitude === undefined || longitude === undefined) {
    console.log('❌ Missing required fields:', { studioId, latitude, longitude });
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: studioId, latitude, longitude' 
    });
  }

  console.log(`🔄 Updating studio ${studioId} with coordinates: ${latitude}, ${longitude}`);
  
  // Update studio coordinates
  let updatedStudio;
  try {
    updatedStudio = await prisma.studio.update({
      where: { id: studioId },
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    });
    
    console.log(`✅ Studio updated successfully: ${updatedStudio.title}`);
  } catch (error) {
    console.error(`❌ Prisma error details:`, {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2025' || error.message.includes('Record to update not found')) {
      console.error(`❌ Studio not found: ${studioId}`);
      return res.status(404).json({
        success: false,
        error: `Studio not found: ${studioId}`
      });
    }
    console.error(`❌ Failed to update studio ${studioId}:`, error);
    return res.status(500).json({
      success: false,
      error: `Failed to update studio: ${error.message}`
    });
  }

  // Cache the geocoded address
  try {
    const addressHash = crypto.createHash('md5').update(address || `${latitude},${longitude}`).digest('hex');
    await prisma.geocodeCache.upsert({
      where: { address_hash: addressHash },
      update: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        updated_at: new Date()
      },
      create: {
        address_hash: addressHash,
        original_address: address || `${latitude},${longitude}`,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    });
    console.log(`💾 Address cached successfully: ${address || `${latitude},${longitude}`}`);
  } catch (cacheError) {
    console.warn(`⚠️ Failed to cache address:`, cacheError);
    // Don't fail the whole request if caching fails
  }

  res.json({
    success: true,
    data: {
      studioId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      message: `Successfully updated coordinates for ${updatedStudio.title}`
    }
  });
});

// Get cached geocoding results
router.get('/cache', async (req, res) => {
  try {
    const cache = await prisma.geocodeCache.findMany({
      orderBy: { updated_at: 'desc' },
      take: 100
    });

    res.json({
      success: true,
      data: cache
    });
  } catch (error) {
    console.error('Error getting geocoding cache:', error);
    res.status(500).json({ success: false, error: 'Failed to get geocoding cache' });
  }
});

// Clear geocoding cache
router.delete('/cache', async (req, res) => {
  try {
    await prisma.geocodeCache.deleteMany({});
    
    res.json({
      success: true,
      message: 'Geocoding cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing geocoding cache:', error);
    res.status(500).json({ success: false, error: 'Failed to clear geocoding cache' });
  }
});

module.exports = router;
