-- =====================================================
-- FIX PARIS STUDIOS DATA IN PRODUCTION DATABASE
-- Run this in pgAdmin connected to your Render database
-- =====================================================

-- 1. Show current problematic data
SELECT 
    id,
    title,
    address,
    city,
    state,
    zip_code,
    country,
    latitude,
    longitude
FROM studios 
WHERE 
    address = 'null' 
    OR city = 'null'
    OR country LIKE '750% Paris'
ORDER BY title;

-- 2. Fix the data by extracting postal codes and setting proper values
UPDATE studios 
SET 
    address = CASE 
        WHEN country LIKE '750% Paris' THEN 
            SUBSTRING(country FROM 1 FOR 5) || ' Paris, France'
        ELSE address
    END,
    city = CASE 
        WHEN city = 'null' OR city IS NULL THEN 'Paris'
        ELSE city
    END,
    zip_code = CASE 
        WHEN country LIKE '750% Paris' THEN 
            SUBSTRING(country FROM 1 FOR 5)
        ELSE zip_code
    END,
    country = CASE 
        WHEN country LIKE '750% Paris' THEN 'France'
        ELSE country
    END,
    updated_at = NOW()
WHERE 
    address = 'null' 
    OR city = 'null'
    OR country LIKE '750% Paris';

-- 3. Show the fixed data
SELECT 
    id,
    title,
    address,
    city,
    state,
    zip_code,
    country,
    latitude,
    longitude
FROM studios 
WHERE 
    country = 'France'
    AND city = 'Paris'
ORDER BY title;

-- 4. Check geocoding status after fix
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

-- 5. Show Paris studios that still need geocoding
SELECT 
    id,
    title,
    address,
    city,
    zip_code,
    country,
    latitude,
    longitude
FROM studios 
WHERE 
    is_active = true 
    AND (latitude IS NULL OR longitude IS NULL)
    AND country = 'France'
    AND city = 'Paris'
ORDER BY title;
