-- =====================================================
-- Studio Geocoding Results - Direct Database Update
-- =====================================================
-- This script updates studio coordinates directly in the database
-- Run this script on your production database to apply geocoding results
-- 
-- WARNING: Always backup your database before running this script!
-- =====================================================

-- Start transaction for safety
BEGIN;

-- Create a temporary table to hold the geocoding results
CREATE TEMP TABLE temp_geocoding_results (
    studio_id TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    formatted_address TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert your geocoding results here
-- Replace the example values with your actual results
-- You can copy-paste the results from the frontend tool

INSERT INTO temp_geocoding_results (studio_id, latitude, longitude, formatted_address) VALUES
-- Example format (replace with your actual results):
-- ('studio-id-1', 51.5074, -0.1278, '123 Main St, London, UK'),
-- ('studio-id-2', 48.8566, 2.3522, '456 Oak Ave, Paris, France'),
-- Add more rows as needed...

-- Update the studios table with the new coordinates
UPDATE studios 
SET 
    latitude = tgr.latitude,
    longitude = tgr.longitude,
    updated_at = NOW()
FROM temp_geocoding_results tgr
WHERE studios.id = tgr.studio_id;

-- Verify the updates
SELECT 
    s.id,
    s.title,
    s.latitude,
    s.longitude,
    s.address,
    s.city,
    s.state,
    tgr.formatted_address as geocoded_address
FROM studios s
JOIN temp_geocoding_results tgr ON s.id = tgr.studio_id
WHERE s.latitude IS NOT NULL AND s.longitude IS NOT NULL
ORDER BY s.title;

-- Count how many studios were updated
SELECT 
    COUNT(*) as studios_updated,
    COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as with_coordinates,
    COUNT(CASE WHEN latitude IS NULL OR longitude IS NULL THEN 1 END) as without_coordinates
FROM studios 
WHERE is_active = true;

-- Clean up temporary table
DROP TABLE temp_geocoding_results;

-- Commit the transaction
COMMIT;

-- =====================================================
-- Alternative: Update specific studios by ID
-- =====================================================
-- If you prefer to update specific studios, you can use this format instead:

/*
UPDATE studios 
SET 
    latitude = 51.5074,
    longitude = -0.1278,
    updated_at = NOW()
WHERE id = 'your-studio-id-here';

UPDATE studios 
SET 
    latitude = 48.8566,
    longitude = 2.3522,
    updated_at = NOW()
WHERE id = 'another-studio-id-here';
*/

-- =====================================================
-- Rollback command (uncomment if you need to undo changes)
-- =====================================================
-- ROLLBACK;
