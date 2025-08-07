-- =====================================================
-- RENDER PRODUCTION GEOCODING SETUP (FIXED)
-- Run these commands in pgAdmin connected to your Render database
-- =====================================================

-- 1. Create the geocode cache table (already exists, but safe to run)
CREATE TABLE IF NOT EXISTS geocode_cache (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    address_hash TEXT UNIQUE NOT NULL,
    original_address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for performance (already exist, but safe to run)
CREATE INDEX IF NOT EXISTS idx_geocode_cache_address_hash ON geocode_cache(address_hash);
CREATE INDEX IF NOT EXISTS idx_geocode_cache_updated_at ON geocode_cache(updated_at);

-- 3. Clear incorrect Montreal coordinates (fallback coordinates)
UPDATE studios 
SET 
    latitude = NULL,
    longitude = NULL,
    updated_at = NOW()
WHERE 
    latitude = 45.5017 
    AND longitude = -73.5673;

-- 4. Show current geocoding status (FIXED ROUND function)
SELECT 
    COUNT(*) as total_studios,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as geocoded_studios,
    COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) as missing_coordinates,
    ROUND(
        (COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END)::numeric / COUNT(*)::numeric) * 100, 
        2
    ) as completion_percentage
FROM studios 
WHERE is_active = true;

-- 5. Show studios that need geocoding
SELECT 
    id,
    title,
    address,
    city,
    state,
    zip_code,
    country,
    CONCAT(
        COALESCE(address, ''),
        CASE WHEN address IS NOT NULL AND city IS NOT NULL THEN ', ' ELSE '' END,
        COALESCE(city, ''),
        CASE WHEN city IS NOT NULL AND state IS NOT NULL THEN ', ' ELSE '' END,
        COALESCE(state, ''),
        CASE WHEN state IS NOT NULL AND zip_code IS NOT NULL THEN ' ' ELSE '' END,
        COALESCE(zip_code, ''),
        CASE WHEN zip_code IS NOT NULL AND country IS NOT NULL THEN ', ' ELSE '' END,
        COALESCE(country, '')
    ) as full_address
FROM studios 
WHERE 
    is_active = true 
    AND (latitude IS NULL OR longitude IS NULL)
ORDER BY title;

-- 6. Show geocoded studios
SELECT 
    id,
    title,
    latitude,
    longitude,
    CONCAT(
        COALESCE(address, ''),
        CASE WHEN address IS NOT NULL AND city IS NOT NULL THEN ', ' ELSE '' END,
        COALESCE(city, ''),
        CASE WHEN city IS NOT NULL AND state IS NOT NULL THEN ', ' ELSE '' END,
        COALESCE(state, ''),
        CASE WHEN state IS NOT NULL AND zip_code IS NOT NULL THEN ' ' ELSE '' END,
        COALESCE(zip_code, ''),
        CASE WHEN zip_code IS NOT NULL AND country IS NOT NULL THEN ', ' ELSE '' END,
        COALESCE(country, '')
    ) as full_address
FROM studios 
WHERE 
    is_active = true 
    AND latitude IS NOT NULL 
    AND longitude IS NOT NULL
ORDER BY title;

-- 7. Check geocode cache table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'geocode_cache' 
ORDER BY ordinal_position;

-- 8. Show cache statistics
SELECT 
    COUNT(*) as total_cached_addresses,
    COUNT(DISTINCT address_hash) as unique_addresses,
    MIN(created_at) as oldest_cache_entry,
    MAX(created_at) as newest_cache_entry
FROM geocode_cache;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify the setup worked
SELECT 'Geocode Cache Table' as check_item, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'geocode_cache') 
            THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'Address Hash Index' as check_item,
       CASE WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_geocode_cache_address_hash') 
            THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'Updated At Index' as check_item,
       CASE WHEN EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_geocode_cache_updated_at') 
            THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 'Montreal Coordinates Cleared' as check_item,
       CASE WHEN NOT EXISTS (SELECT 1 FROM studios WHERE latitude = 45.5017 AND longitude = -73.5673) 
            THEN '✅ CLEARED' ELSE '❌ STILL EXISTS' END as status; 