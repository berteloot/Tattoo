const PQueue = require('p-queue');
const { PrismaClient } = require('@prisma/client');
const NodeCache = require('node-cache');

const prisma = new PrismaClient();

// In-memory cache for fast lookups (24 hour TTL)
const memoryCache = new NodeCache({ stdTTL: 60 * 60 * 24 });

// Rate-limited queue: max 10 requests per second
const geocodeQueue = new PQueue({ 
  interval: 1000, 
  intervalCap: 10,
  timeout: 30000 // 30 second timeout
});

// Google Geocoding API key (server-side key)
const GEOCODE_API_KEY = process.env.GOOGLE_GEOCODE_API_KEY;

/**
 * Normalize address for consistent cache keying
 */
function normalizeAddress(address) {
  return address
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s,.-]/g, '') // Remove special characters except commas, dots, hyphens
    .replace(/\s*,\s*/g, ', ') // Normalize comma spacing
    .replace(/\s*\.\s*/g, '. ') // Normalize dot spacing
    .replace(/\s*-\s*/g, '-'); // Normalize hyphen spacing
}

/**
 * Generate cache key for address
 */
function getCacheKey(address) {
  return `geocode:${normalizeAddress(address)}`;
}

/**
 * Check cache for geocoding result
 */
async function getFromCache(address) {
  const cacheKey = getCacheKey(address);
  
  // Check memory cache first (fastest)
  const memoryResult = memoryCache.get(cacheKey);
  if (memoryResult) {
    console.log(`📋 Memory cache hit for: ${address}`);
    return memoryResult;
  }
  
  // Check database cache
  try {
    const dbResult = await prisma.geocodeCache.findUnique({
      where: { addressHash: cacheKey }
    });
    
    if (dbResult) {
      const result = {
        lat: dbResult.latitude,
        lng: dbResult.longitude,
        cached: true,
        source: 'database'
      };
      
      // Store in memory cache for future fast access
      memoryCache.set(cacheKey, result);
      console.log(`📋 Database cache hit for: ${address}`);
      return result;
    }
  } catch (error) {
    console.error('Error checking database cache:', error);
  }
  
  return null;
}

/**
 * Store geocoding result in cache
 */
async function storeInCache(address, lat, lng) {
  const cacheKey = getCacheKey(address);
  
  // Store in memory cache
  const result = { lat, lng, cached: false, source: 'api' };
  memoryCache.set(cacheKey, result);
  
  // Store in database cache
  try {
    await prisma.geocodeCache.upsert({
      where: { addressHash: cacheKey },
      update: {
        latitude: lat,
        longitude: lng,
        updatedAt: new Date()
      },
      create: {
        addressHash: cacheKey,
        originalAddress: address,
        latitude: lat,
        longitude: lng,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    console.log(`💾 Cached geocoding result for: ${address}`);
  } catch (error) {
    console.error('Error storing in database cache:', error);
  }
  
  return result;
}

/**
 * Call Google Geocoding API
 */
async function callGeocodeAPI(address) {
  if (!GEOCODE_API_KEY) {
    console.warn('⚠️ GOOGLE_GEOCODE_API_KEY not configured, using fallback coordinates');
    return { lat: 45.5017, lng: -73.5673, fallback: true };
  }

  try {
    console.log(`🌍 Calling Google Geocoding API for: ${address}`);
    
    const params = new URLSearchParams({
      address: address,
      key: GEOCODE_API_KEY
    });

    const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log(`✅ Geocoded successfully: ${address} → ${location.lat}, ${location.lng}`);
      return { lat: location.lat, lng: location.lng };
    } else {
      console.error(`❌ Geocoding failed for ${address}: ${data.status}`);
      throw new Error(`Geocoding failed: ${data.status}`);
    }
  } catch (error) {
    console.error(`❌ Geocoding API error for ${address}:`, error.message);
    throw error;
  }
}

/**
 * Main geocoding function with caching and rate limiting
 */
async function geocodeAddress(address) {
  if (!address || typeof address !== 'string') {
    throw new Error('Valid address string is required');
  }

  // Check cache first
  const cachedResult = await getFromCache(address);
  if (cachedResult) {
    return {
      success: true,
      address,
      location: { lat: cachedResult.lat, lng: cachedResult.lng },
      cached: cachedResult.cached,
      source: cachedResult.source
    };
  }

  // If not in cache, add to rate-limited queue
  try {
    const result = await geocodeQueue.add(() => callGeocodeAPI(address));
    
    // Store successful result in cache
    await storeInCache(address, result.lat, result.lng);
    
    return {
      success: true,
      address,
      location: { lat: result.lat, lng: result.lng },
      cached: false,
      fallback: result.fallback || false
    };
  } catch (error) {
    console.error(`❌ Geocoding failed for ${address}:`, error.message);
    return {
      success: false,
      address,
      error: error.message
    };
  }
}

/**
 * Batch geocode addresses with proper rate limiting
 */
async function batchGeocode(addresses) {
  if (!Array.isArray(addresses)) {
    throw new Error('Addresses must be an array');
  }

  if (addresses.length > 50) {
    throw new Error('Maximum 50 addresses per batch');
  }

  console.log(`🌍 Batch geocoding ${addresses.length} addresses`);

  const results = [];
  
  // Process addresses in smaller chunks to avoid overwhelming the queue
  const chunkSize = 10;
  for (let i = 0; i < addresses.length; i += chunkSize) {
    const chunk = addresses.slice(i, i + chunkSize);
    
    const chunkPromises = chunk.map(async (address) => {
      try {
        return await geocodeAddress(address);
      } catch (error) {
        return {
          success: false,
          address,
          error: error.message
        };
      }
    });
    
    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
    
    // Small delay between chunks
    if (i + chunkSize < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  const memoryStats = memoryCache.getStats();
  return {
    memory: {
      hits: memoryStats.hits,
      misses: memoryStats.misses,
      keys: memoryStats.keys,
      ksize: memoryStats.ksize,
      vsize: memoryStats.vsize
    },
    queue: {
      size: geocodeQueue.size,
      pending: geocodeQueue.pending
    }
  };
}

/**
 * Clear cache (for testing/admin purposes)
 */
async function clearCache() {
  memoryCache.flushAll();
  
  try {
    await prisma.geocodeCache.deleteMany({});
    console.log('🗑️ Cache cleared successfully');
  } catch (error) {
    console.error('Error clearing database cache:', error);
  }
}

module.exports = {
  geocodeAddress,
  batchGeocode,
  getCacheStats,
  clearCache,
  normalizeAddress
}; 