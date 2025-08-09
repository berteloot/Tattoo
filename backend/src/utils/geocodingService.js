const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Cache for geocoding results
const geocodeCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Geocode a single address using Google Maps API
 * @param {string} address - The address to geocode
 * @returns {Promise<Object>} - Geocoding result
 */
async function geocodeAddress(address) {
    try {
        // Check cache first
        const cacheKey = address.toLowerCase().trim();
        const cachedResult = geocodeCache.get(cacheKey);
        
        if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_DURATION) {
            console.log(`📍 Using cached geocoding result for: ${address}`);
            return cachedResult.data;
        }

        // Check database cache
        const dbCache = await checkDatabaseCache(address);
        if (dbCache) {
            console.log(`📍 Using database cached result for: ${address}`);
            // Update memory cache
            geocodeCache.set(cacheKey, {
                data: dbCache,
                timestamp: Date.now()
            });
            return dbCache;
        }

        console.log(`🌍 Geocoding address: ${address}`);

        // Get API key from environment - fail fast if missing
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            throw new Error('GOOGLE_MAPS_API_KEY environment variable not set');
        }

        // Make request to Google Maps Geocoding API
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: apiKey
            },
            timeout: 10000 // 10 second timeout
        });

        const data = response.data;

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            const result = data.results[0];
            const location = result.geometry.location;
            
            const geocodeResult = {
                success: true,
                location: {
                    lat: location.lat,
                    lng: location.lng
                },
                formatted_address: result.formatted_address,
                address_components: result.address_components,
                original_address: address
            };

            // Cache the result
            geocodeCache.set(cacheKey, {
                data: geocodeResult,
                timestamp: Date.now()
            });

            // Save to database cache
            await saveToDatabaseCache(address, geocodeResult);

            console.log(`✅ Successfully geocoded: ${address} → ${location.lat}, ${location.lng}`);
            return geocodeResult;

        } else {
            const errorMessage = data.error_message || data.status || 'Unknown error';
            console.log(`❌ Geocoding failed for: ${address} - ${errorMessage}`);
            
            const errorResult = {
                success: false,
                error: errorMessage,
                original_address: address
            };

            // Cache error result for a shorter time to avoid repeated failures
            geocodeCache.set(cacheKey, {
                data: errorResult,
                timestamp: Date.now()
            });

            return errorResult;
        }

    } catch (error) {
        console.error(`❌ Geocoding error for ${address}:`, error.message);
        
        const errorResult = {
            success: false,
            error: error.message,
            original_address: address
        };

        return errorResult;
    }
}

/**
 * Check if geocoding result exists in database cache
 */
async function checkDatabaseCache(address) {
    try {
        const addressHash = createAddressHash(address);
        const cached = await prisma.geocodeCache.findUnique({
            where: { addressHash }
        });

        if (cached && (Date.now() - new Date(cached.updatedAt).getTime()) < CACHE_DURATION) {
            return {
                success: true,
                location: {
                    lat: cached.latitude,
                    lng: cached.longitude
                },
                original_address: cached.originalAddress
            };
        }

        return null;
    } catch (error) {
        console.error('Error checking database cache:', error);
        return null;
    }
}

/**
 * Save geocoding result to database cache
 */
async function saveToDatabaseCache(address, result) {
    try {
        if (!result.success) return;

        const addressHash = createAddressHash(address);
        
        await prisma.geocodeCache.upsert({
            where: { addressHash },
            update: {
                latitude: result.location.lat,
                longitude: result.location.lng
                // No manual updatedAt - let Prisma/DB handle it
            },
            create: {
                addressHash,
                originalAddress: address,
                latitude: result.location.lat,
                longitude: result.location.lng
            }
        });
    } catch (error) {
        console.error('Error saving to database cache:', error);
    }
}

/**
 * Create a hash for the address to use as cache key
 */
function createAddressHash(address) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(address.toLowerCase().trim()).digest('hex');
}

/**
 * Batch geocode multiple addresses with rate limiting
 * @param {Array<string>} addresses - Array of addresses to geocode
 * @returns {Promise<Array>} - Array of geocoding results
 */
async function batchGeocode(addresses) {
    const results = [];
    const delay = 1000; // 1 second delay between requests

    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        console.log(`🌍 [${i + 1}/${addresses.length}] Processing: ${address}`);
        
        try {
            const result = await geocodeAddress(address);
            results.push({
                address,
                ...result
            });

            // Add delay between requests to respect rate limits
            if (i < addresses.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }

        } catch (error) {
            console.error(`❌ Error geocoding ${address}:`, error.message);
            results.push({
                address,
                success: false,
                error: error.message
            });
        }
    }

    return results;
}

/**
 * Update studio coordinates using geocoding
 * @param {string} studioId - Studio ID to update
 * @returns {Promise<Object>} - Update result
 */
async function updateStudioCoordinates(studioId) {
    try {
        // Get studio information
        const studio = await prisma.studio.findUnique({
            where: { id: studioId }
        });

        if (!studio) {
            return {
                success: false,
                error: 'Studio not found'
            };
        }

        // Build address string
        const addressParts = [
            studio.address,
            studio.city,
            studio.state,
            studio.zipCode,
            studio.country
        ].filter(Boolean);

        const address = addressParts.join(', ');

        if (!address) {
            return {
                success: false,
                error: 'Studio has no address information'
            };
        }

        // Geocode the address
        const geocodeResult = await geocodeAddress(address);

        if (geocodeResult.success) {
            // Update studio with coordinates - back to Prisma (no manual updatedAt)
            const updatedStudio = await prisma.studio.update({
                where: { id: studioId },
                data: {
                    latitude: geocodeResult.location.lat,
                    longitude: geocodeResult.location.lng
                    // updatedAt handled automatically by @updatedAt in schema
                }
            });

            console.log(`✅ Updated studio coordinates: ${studio.title} → ${geocodeResult.location.lat}, ${geocodeResult.location.lng}`);

            return {
                success: true,
                studio: updatedStudio,
                geocoded: geocodeResult
            };
        } else {
            return {
                success: false,
                error: 'Failed to geocode address',
                details: geocodeResult.error
            };
        }

    } catch (error) {
        console.error('❌ Update studio coordinates error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Batch update all studios without coordinates
 * @returns {Promise<Array>} - Array of update results
 */
async function batchUpdateStudioCoordinates() {
    try {
        // Get all studios without coordinates
        const studios = await prisma.studio.findMany({
            where: {
                isActive: true,
                OR: [
                    { latitude: null },
                    { longitude: null }
                ]
            }
        });

        console.log(`🔄 Found ${studios.length} studios needing geocoding`);

        const results = [];
        const delay = 2000; // 2 second delay between requests

        for (let i = 0; i < studios.length; i++) {
            const studio = studios[i];
            console.log(`🌍 [${i + 1}/${studios.length}] Processing: ${studio.title}`);
            
            try {
                const result = await updateStudioCoordinates(studio.id);
                results.push({
                    studioId: studio.id,
                    studioName: studio.title,
                    ...result
                });

                // Add delay between requests
                if (i < studios.length - 1) {
                    console.log(`⏳ Waiting ${delay/1000}s before next request...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

            } catch (error) {
                console.error(`❌ Error updating ${studio.title}:`, error.message);
                results.push({
                    studioId: studio.id,
                    studioName: studio.title,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;

    } catch (error) {
        console.error('❌ Batch update error:', error);
        throw error;
    }
}

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
function getCacheStats() {
    const now = Date.now();
    const validEntries = Array.from(geocodeCache.values()).filter(
        entry => (now - entry.timestamp) < CACHE_DURATION
    );

    return {
        totalEntries: geocodeCache.size,
        validEntries: validEntries.length,
        expiredEntries: geocodeCache.size - validEntries.length,
        cacheDuration: CACHE_DURATION
    };
}

/**
 * Clear all cache
 */
async function clearCache() {
    geocodeCache.clear();
    
    try {
        // Clear database cache older than 7 days
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        await prisma.geocodeCache.deleteMany({
            where: {
                updatedAt: {
                    lt: sevenDaysAgo
                }
            }
        });
        
        console.log('✅ Cache cleared successfully');
    } catch (error) {
        console.error('❌ Error clearing database cache:', error);
    }
}

module.exports = {
    geocodeAddress,
    batchGeocode,
    updateStudioCoordinates,
    batchUpdateStudioCoordinates,
    getCacheStats,
    clearCache
}; 