const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');

// Debug middleware to log all requests to geocoding routes
router.use((req, res, next) => {
  console.log(`🔍 [GEOCODING] ${req.method} ${req.path} - IP: ${req.ip}`);
  console.log(`🔍 [GEOCODING] Headers:`, req.headers);
  next();
});

const prisma = new PrismaClient();

// Create a direct PostgreSQL connection pool to bypass Prisma schema issues
console.log('🔧 Initializing PostgreSQL pool...');
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('🔧 DATABASE_URL length:', process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test the pool connection
pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL pool connected successfully');
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Failed to connect to PostgreSQL:', err.message);
  } else {
    console.log('✅ PostgreSQL connection test successful');
  }
});

// Database health check endpoint
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 Health check requested');
    console.log('🏥 Pool status:', {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    });
    
    // Test pool connection
    const result = await pool.query('SELECT NOW() as timestamp, version() as version');
    
    res.json({
      success: true,
      data: {
        timestamp: result.rows[0].timestamp,
        version: result.rows[0].version,
        pool: {
          totalCount: pool.totalCount,
          idleCount: pool.idleCount,
          waitingCount: pool.waitingCount
        }
      }
    });
  } catch (error) {
    console.error('🏥 Health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database health check failed',
      details: error.message
    });
  }
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
    console.log('📝 Received geocoding request');
    console.log('📝 Request headers:', req.headers);
    console.log('📝 Request body:', req.body);
    console.log('📝 Request method:', req.method);
    console.log('📝 Request URL:', req.url);
    console.log('📝 Request IP:', req.ip);
    
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
    
    // Test pool connection first
    if (!pool.totalCount && !pool.idleCount) {
      throw new Error('PostgreSQL pool not connected');
    }
    
    // Use direct PostgreSQL query to avoid Prisma schema validation
    const query = 'UPDATE studios SET latitude = $1, longitude = $2 WHERE id = $3';
    const values = [lat, lng, studioId];
    
    console.log(`🔍 Executing query: ${query} with values: [${values.join(', ')}]`);
    
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
    
    // Try Prisma as fallback if pool fails
    if (error.message && (error.message.includes('pool not connected') || error.message.includes('ECONNREFUSED'))) {
      console.log('🔄 Pool failed, trying Prisma fallback...');
      try {
        const fallbackResult = await prisma.studio.update({
          where: { id: studioId },
          data: { latitude: lat, longitude: lng }
        });
        console.log('✅ Prisma fallback successful:', fallbackResult.id);
        return res.json({
          success: true,
          data: {
            studio: {
              id: studioId,
              title: existingStudio.title,
              latitude: lat,
              longitude: lng
            },
            message: 'Coordinates saved successfully (Prisma fallback)'
          }
        });
      } catch (fallbackError) {
        console.error('❌ Prisma fallback also failed:', fallbackError);
        error = fallbackError; // Use the fallback error for the main error handling
      }
    }
    
    // Provide more specific error messages
    let errorMessage = 'Failed to save coordinates';
    
    if (error.code === 'P2025') {
      errorMessage = 'Studio not found';
    } else if (error.code === 'P2002') {
      errorMessage = 'Database constraint violation';
    } else if (error.message && error.message.includes('column')) {
      errorMessage = 'Database schema error';
    } else if (error.message && error.message.includes('pool')) {
      errorMessage = 'Database connection error';
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
