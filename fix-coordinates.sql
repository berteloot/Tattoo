-- Fix Coordinates SQL Script
-- This script clears incorrect coordinates and prepares for proper geocoding

-- 1. Clear all incorrect coordinates (the Montreal fallback coordinates)
UPDATE studios 
SET 
    latitude = NULL,
    longitude = NULL,
    updated_at = NOW()
WHERE 
    latitude = 45.5017 
    AND longitude = -73.5673;

-- 2. Clear the geocode cache to start fresh
DELETE FROM geocode_cache;

-- 3. Show studios that need geocoding
SELECT 
    id,
    title,
    address,
    city,
    state,
    zip_code,
    country,
    CASE 
        WHEN latitude IS NULL OR longitude IS NULL THEN 'Needs Geocoding'
        ELSE 'Has Coordinates'
    END as status
FROM studios
WHERE is_active = true
ORDER BY 
    CASE WHEN latitude IS NULL OR longitude IS NULL THEN 0 ELSE 1 END,
    title;

-- 4. Count studios by status
SELECT 
    COUNT(*) as total_studios,
    COUNT(*) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL) as geocoded_studios,
    COUNT(*) FILTER (WHERE latitude IS NULL OR longitude IS NULL) as missing_coordinates,
    ROUND(
        (COUNT(*) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2
    ) as percentage_complete
FROM studios
WHERE is_active = true; 