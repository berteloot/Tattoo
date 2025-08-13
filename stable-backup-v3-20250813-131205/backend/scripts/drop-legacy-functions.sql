-- Drop legacy PostgreSQL functions that conflict with new geocoding system
-- Run this script directly in your database

-- Drop the problematic functions
DROP FUNCTION IF EXISTS update_studio_coordinates(text);
DROP FUNCTION IF EXISTS batch_update_studio_coordinates(text, text, text, text, text);
DROP FUNCTION IF EXISTS get_studios_geojson(double precision, double precision, double precision, double precision);
DROP FUNCTION IF EXISTS get_geocoding_status();

-- Also drop any other geocoding-related functions that might cause issues
DROP FUNCTION IF EXISTS geocode_address(text, text, text, text, text);

-- Check what functions remain
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
AND routine_name LIKE '%geocod%';

SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
AND routine_name LIKE '%studio%';
