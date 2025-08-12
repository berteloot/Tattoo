const express = require('express');
const { prisma } = require('../utils/prisma');

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
        longitude: true
      }
    });

    res.json({
      success: true,
      data: studios.map(studio => ({
        ...studio,
        fullAddress: [studio.address, studio.city, studio.state, studio.zipCode, studio.country]
          .filter(Boolean)
          .join(', '),
        hasCoordinates: studio.latitude !== null && studio.longitude !== null
      }))
    });
  } catch (error) {
    console.error('Error getting studios:', error);
    res.status(500).json({ success: false, error: 'Failed to get studios' });
  }
});

// Save geocoding result (updated to use GeocodeCache)
router.post('/save-result', async (req, res) => {
  try {
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

    // Update the studio with coordinates
    const updatedStudio = await prisma.studio.update({
      where: { id: studioId },
      data: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
        // Temporarily removed updatedAt to avoid triggering legacy functions
      }
    });

    console.log(`✅ Studio updated successfully: ${updatedStudio.title}`);

    // If address is provided, cache it in GeocodeCache
    if (address) {
      const addressHash = Buffer.from(address.toLowerCase().trim()).toString('base64');
      
      await prisma.geocodeCache.upsert({
        where: { address_hash: addressHash },
        update: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          updated_at: new Date()
        },
        create: {
          address_hash: addressHash,
          original_address: address,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      });
      
      console.log(`💾 Address cached successfully: ${address}`);
    }

    console.log(`✅ Updated coordinates for ${updatedStudio.title}: ${latitude}, ${longitude}`);

    res.json({
      success: true,
      data: {
        studioId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        message: `Successfully updated coordinates for ${updatedStudio.title}`
      }
    });

  } catch (error) {
    console.error('❌ Error saving geocoding result:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to save geocoding result',
      details: error.message 
    });
  }
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
