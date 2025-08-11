const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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

    // Build full addresses
    const studiosWithAddress = studios.map(studio => {
      const addressParts = [
        studio.address,
        studio.city,
        studio.state,
        studio.zipCode,
        studio.country || 'United Kingdom'
      ].filter(part => part && part.trim().length > 0);

      return {
        ...studio,
        full_address: addressParts.join(', ')
      };
    });

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

// Save geocoding result - SIMPLE VERSION
router.post('/save-result', async (req, res) => {
  try {
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

    // Use raw SQL to avoid Prisma issues
    const updateResult = await prisma.$executeRaw`
      UPDATE studios 
      SET latitude = ${lat}, longitude = ${lng}
      WHERE id = ${studioId}
    `;

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
    
    res.status(500).json({
      success: false,
      error: 'Failed to save coordinates'
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
