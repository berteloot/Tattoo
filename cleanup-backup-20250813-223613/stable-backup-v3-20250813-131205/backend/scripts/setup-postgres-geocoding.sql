-- 🚀 POSTGRESQL-BASED GEOCODING SYSTEM
-- This moves geocoding entirely into PostgreSQL - no more frontend API calls!

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;              -- for geometry types  
CREATE EXTENSION IF NOT EXISTS http_fdw;             -- for HTTP foreign data wrapper

-- Create the HTTP foreign server for Google Geocoding API
CREATE SERVER IF NOT EXISTS geocode_svr
  FOREIGN DATA WRAPPER http_fdw
  OPTIONS (host 'maps.googleapis.com', port '443');

-- Create foreign table mapping the Google Geocoding API
CREATE FOREIGN TABLE IF NOT EXISTS google_geocode (
  request text,                      -- echoed request
  status  text, 
  results jsonb
)
  SERVER geocode_svr
  OPTIONS (
    uri '/maps/api/geocode/json?address=${full_addr}&key=YOUR_API_KEY',
    format 'json_array'
  );

-- Create a view that builds the full address and extracts lat/lng
CREATE OR REPLACE VIEW studio_locations AS
SELECT
  s.id,
  s.name,
  s.address,
  s.city,
  s.state,
  s.zipcode,
  s.country,
  g.status,
  (g.results->0->'geometry'->'location'->>'lat')::double precision AS latitude,
  (g.results->0->'geometry'->'location'->>'lng')::double precision AS longitude,
  ST_SetSRID(
    ST_MakePoint(
      (g.results->0->'geometry'->'location'->>'lng')::double precision,
      (g.results->0->'geometry'->'location'->>'lat')::double precision
    ), 4326
  ) AS geom
FROM studios s
LEFT JOIN google_geocode g
  ON (s.address || ', ' || s.city || ', ' || s.state || ' ' || s.zipcode || ', ' || s.country)
     = g.request
WHERE s.latitude IS NULL OR s.longitude IS NULL;

-- Create a function to update studio coordinates from the view
CREATE OR REPLACE FUNCTION update_studio_coordinates()
RETURNS void AS $$
BEGIN
  UPDATE studios 
  SET 
    latitude = sl.latitude,
    longitude = sl.longitude,
    updated_at = NOW()
  FROM studio_locations sl
  WHERE studios.id = sl.id 
    AND sl.status = 'OK'
    AND sl.latitude IS NOT NULL 
    AND sl.longitude IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get studios as GeoJSON
CREATE OR REPLACE FUNCTION get_studios_geojson()
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'features', json_agg(
        json_build_object(
          'type', 'Feature',
          'geometry', ST_AsGeoJSON(geom)::json,
          'properties', json_build_object(
            'id', id,
            'name', name,
            'address', address,
            'city', city,
            'state', state,
            'zipcode', zipcode,
            'country', country
          )
        )
      )
    )
    FROM studio_locations
    WHERE status = 'OK' AND geom IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON studio_locations TO PUBLIC;
GRANT EXECUTE ON FUNCTION update_studio_coordinates() TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_studios_geojson() TO PUBLIC;

-- Display setup status
SELECT 'PostgreSQL Geocoding System Setup Complete!' as status;
SELECT 'Extensions:' as info;
SELECT extname, extversion FROM pg_extension WHERE extname IN ('postgis', 'http_fdw');
SELECT 'Foreign Tables:' as info;
SELECT schemaname, tablename FROM pg_tables WHERE tablename = 'google_geocode'; 