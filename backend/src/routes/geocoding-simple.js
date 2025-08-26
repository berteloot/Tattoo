const express = require('express');
const { prisma } = require('../utils/prisma');
const crypto = require('crypto'); // Added for caching
const logger = require('../utils/logger');

const router = express.Router();

// Logging middleware for all geocoding routes
router.use((req, res, next) => {
  // Development-only logging - never in production
  logger.request(req.method, req.path, req.ip, {
    'user-agent': req.get('user-agent'),
    'x-request-id': req.get('x-request-id'),
    'content-type': req.get('content-type'),
    'accept': req.get('accept')
  });
  next();
});

// Get geocoding statistics
router.get('/stats', async (req, res) => {
  try {
    logger.geocoding('GET /stats - Processing request');
    
    const totalStudios = await prisma.studio.count();
    logger.database('Total studios found', { count: totalStudios });
    
    const studiosWithCoords = await prisma.studio.count({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    logger.database('Studios with coordinates', { count: studiosWithCoords });
    
    const studiosNeedingGeocoding = totalStudios - studiosWithCoords;
    const cachedAddresses = await prisma.geocodeCache.count();
    
    const stats = {
      totalStudios,
      studiosWithCoords,
      studiosNeedingGeocoding,
      cachedAddresses,
      progress: totalStudios > 0 ? Math.round((studiosWithCoords / totalStudios) * 100) : 0
    };
    
    logger.geocoding('Stats calculated', stats);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    // Always log errors (development and production)
    logger.error('Error getting geocoding stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get geocoding statistics',
      details: error.message 
    });
  }
});

// Test endpoint to verify data structure (development only)
router.get('/test', async (req, res) => {
  // Block this endpoint in production for security
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });
  }

  try {
    logger.geocoding('GET /test - Processing request');
    
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
    // Always log errors (development and production)
    logger.error('Error in test endpoint:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get test data',
      details: error.message 
    });
  }
});

// Simple count endpoint to test database connection
router.get('/count', async (req, res) => {
  try {
    logger.geocoding('GET /count - Processing request');
    
    const totalCount = await prisma.studio.count();
    const withCoordsCount = await prisma.studio.count({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    logger.database('Count results', { total: totalCount, withCoords: withCoordsCount });
    
    res.json({
      success: true,
      data: {
        total: totalCount,
        withCoordinates: withCoordsCount,
        withoutCoordinates: totalCount - withCoordsCount
      }
    });
  } catch (error) {
    // Always log errors (development and production)
    logger.error('Error in count endpoint:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get count',
      details: error.message 
    });
  }
});

// Debug endpoint to check artist verification status (development only)
router.get('/debug-artists', async (req, res) => {
  // Block this endpoint in production for security
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });
  }

  try {
    logger.geocoding('GET /debug-artists - Processing request');
    
    // Get all users with ARTIST role
    const artistUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ARTIST', 'ARTIST_ADMIN']
        }
      },
      include: {
        artistProfile: true
      }
    });

    // Get all artist profiles
    const artistProfiles = await prisma.artistProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Get verification stats
    const verificationStats = await prisma.artistProfile.groupBy({
      by: ['isVerified', 'verificationStatus'],
      _count: true
    });

    res.json({
      success: true,
      data: {
        artistUsers: artistUsers.map(user => ({
          id: user.id,
          email: user.email,
          role: user.role,
          hasArtistProfile: !!user.artistProfile,
          artistProfileId: user.artistProfile?.id || null
        })),
        artistProfiles: artistProfiles.map(profile => ({
          id: profile.id,
          userId: profile.userId,
          userEmail: profile.user.email,
          userRole: profile.user.role,
          isVerified: profile.isVerified,
          verificationStatus: profile.verificationStatus,
          isFeatured: profile.isFeatured
        })),
        verificationStats,
        summary: {
          totalArtistUsers: artistUsers.length,
          totalArtistProfiles: artistProfiles.length,
          verifiedProfiles: artistProfiles.filter(p => p.isVerified).length,
          unverifiedProfiles: artistProfiles.filter(p => !p.isVerified).length
        }
      }
    });
  } catch (error) {
    // Always log errors (development and production)
    logger.error('Error in debug-artists endpoint:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      error: 'Error debugging artists',
      details: error.message 
    });
  }
});

// Debug endpoint to check what studios exist in the database (development only)
router.get('/debug-studios', async (req, res) => {
  // Block this endpoint in production for security
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });
  }

  try {
    logger.geocoding('GET /debug-studios - Processing request');
    
    // Get all studios with basic info
    const allStudios = await prisma.studio.findMany({
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
        isActive: true,

      }
    });

    // Count studios with and without coordinates
    const withCoordinates = allStudios.filter(s => s.latitude !== null && s.longitude !== null);
    const withoutCoordinates = allStudios.filter(s => s.latitude === null || s.longitude === null);

    logger.database('Studio counts', { total: allStudios.length, withCoords: withCoordinates.length, withoutCoords: withoutCoordinates.length });

    res.json({
      success: true,
      data: {
        total: allStudios.length,
        withCoordinates: withCoordinates.length,
        withoutCoordinates: withoutCoordinates.length,
        studios: allStudios.slice(0, 5) // Show first 5 for debugging
      }
    });
  } catch (error) {
    // Always log errors (development and production)
    logger.error('Error in debug-studios endpoint:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error debugging studios',
      details: error.message 
    });
  }
});

// Get studios that need geocoding
router.get('/pending', async (req, res) => {
  try {
    logger.geocoding('GET /pending - Processing request');
    const limit = parseInt(req.query.limit) || 10;
    logger.geocoding('Requested limit', { limit });
    
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

    logger.geocoding('Found studios needing geocoding', { count: studios.length });

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
    // Always log errors (development and production)
    logger.error('Error getting pending studios:', error);
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
    logger.geocoding('GET /studios - Processing request');
    
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

        isFeatured: true
      }
    });

    logger.database('Found studios total', { count: studios.length });

    const processedStudios = studios.map(studio => ({
      ...studio,
      fullAddress: [studio.address, studio.city, studio.state, studio.zipCode, studio.country]
        .filter(Boolean)
        .join(', '),
      hasCoordinates: studio.latitude !== null && studio.longitude !== null,
      // Set default artist count since we can't easily count them without proper relationship
      _count: {
        artists: 0
      }
    }));

    logger.geocoding('Successfully processed studios', { count: processedStudios.length });

    res.json({
      success: true,
      data: processedStudios
    });
  } catch (error) {
    // Always log errors (development and production)
    logger.error('Error getting studios:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get studios',
      details: error.message 
    });
  }
});

// Save geocoding result (minimal version to test)
router.post('/save-result', async (req, res) => {
  logger.geocoding('POST /save-result - Processing request');
  logger.requestBody('Request body', req.body);
  
  const { studioId, latitude, longitude, address } = req.body;
  
  if (!studioId || latitude === undefined || longitude === undefined) {
    logger.error('Missing required fields', { studioId, latitude, longitude });
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: studioId, latitude, longitude' 
    });
  }

  logger.geocoding('Updating studio coordinates', { studioId, latitude, longitude });
  
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
    
    logger.geocoding('Studio updated successfully', { studioId: updatedStudio.id });
  } catch (error) {
    // Always log errors (development and production)
    logger.error('Prisma error details', {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    
    if (error.code === 'P2025' || error.message.includes('Record to update not found')) {
      logger.error('Studio not found', { studioId });
      return res.status(404).json({
        success: false,
        error: `Studio not found: ${studioId}`
      });
    }
    logger.error('Failed to update studio', { studioId, error });
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
    logger.geocoding('Address cached successfully', { address: address || `${latitude},${longitude}` });
  } catch (cacheError) {
    // Always log warnings (development and production)
    logger.warn('Failed to cache address', { error: cacheError });
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
    // Always log errors (development and production)
    logger.error('Error getting geocoding cache', { error });
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
    // Always log errors (development and production)
    logger.error('Error clearing geocoding cache', { error });
    res.status(500).json({ success: false, error: 'Failed to clear geocoding cache' });
  }
});

module.exports = router;
