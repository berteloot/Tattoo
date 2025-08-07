-- PostgreSQL HTTP Foreign Data Wrapper Setup for Google Geocoding API
-- This script sets up a system where geocoding happens directly in PostgreSQL
-- No external ETL processes or application-side loops needed

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS http_fdw;

-- 2. Create the HTTP foreign server for Google Maps API
DROP SERVER IF EXISTS google_geocode_svr CASCADE;
CREATE SERVER google_geocode_svr
  FOREIGN DATA WRAPPER http_fdw
  OPTIONS (
    host 'maps.googleapis.com',
    port '443',
    ssl 'true'
  );

-- 3. Create a function to build the full address string
CREATE OR REPLACE FUNCTION build_full_address(
  p_address TEXT,
  p_city TEXT,
  p_state TEXT,
  p_zipcode TEXT,
  p_country TEXT
) RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(p_address, '') || 
         CASE WHEN p_city IS NOT NULL AND p_city != '' THEN ', ' || p_city ELSE '' END ||
         CASE WHEN p_state IS NOT NULL AND p_state != '' THEN ', ' || p_state ELSE '' END ||
         CASE WHEN p_zipcode IS NOT NULL AND p_zipcode != '' THEN ' ' || p_zipcode ELSE '' END ||
         CASE WHEN p_country IS NOT NULL AND p_country != '' THEN ', ' || p_country ELSE '' END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4. Create a function to URL encode the address
CREATE OR REPLACE FUNCTION url_encode(text) RETURNS text AS $$
BEGIN
  RETURN replace(replace(replace($1, ' ', '%20'), ',', '%2C'), '#', '%23');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Create a function to make geocoding requests
CREATE OR REPLACE FUNCTION geocode_address(
  p_address TEXT,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_zipcode TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  full_addr TEXT;
  encoded_addr TEXT;
  api_key TEXT;
  api_url TEXT;
  response JSONB;
  result JSONB;
BEGIN
  -- Get API key from environment (you'll need to set this)
  api_key := current_setting('app.google_maps_api_key', true);
  
  IF api_key IS NULL THEN
    RAISE EXCEPTION 'Google Maps API key not configured. Set app.google_maps_api_key';
  END IF;
  
  -- Build full address
  full_addr := build_full_address(p_address, p_city, p_state, p_zipcode, p_country);
  
  IF full_addr = '' THEN
    RETURN jsonb_build_object('status', 'ZERO_RESULTS', 'error', 'Empty address');
  END IF;
  
  -- URL encode the address
  encoded_addr := url_encode(full_addr);
  
  -- Build API URL
  api_url := '/maps/api/geocode/json?address=' || encoded_addr || '&key=' || api_key;
  
  -- Make HTTP request
  SELECT content::jsonb INTO response
  FROM http((
    'GET',
    api_url,
    ARRAY[http_header('User-Agent', 'PostgreSQL/Geocoding')],
    NULL,
    NULL
  )::http_request);
  
  -- Check if request was successful
  IF response->>'status' = 'OK' AND jsonb_array_length(response->'results') > 0 THEN
    result := response->'results'->0;
    RETURN jsonb_build_object(
      'status', 'OK',
      'latitude', (result->'geometry'->'location'->>'lat')::float,
      'longitude', (result->'geometry'->'location'->>'lng')::float,
      'formatted_address', result->>'formatted_address',
      'full_address', full_addr
    );
  ELSE
    RETURN jsonb_build_object(
      'status', COALESCE(response->>'status', 'UNKNOWN_ERROR'),
      'error', COALESCE(response->>'error_message', 'Geocoding failed'),
      'full_address', full_addr
    );
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'status', 'ERROR',
      'error', SQLERRM,
      'full_address', full_addr
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Create a view for studio locations with geocoding
CREATE OR REPLACE VIEW studio_locations AS
SELECT
  s.id,
  s.title AS name,
  s.address,
  s.city,
  s.state,
  s.zip_code,
  s.country,
  s.latitude,
  s.longitude,
  s.is_active,
  s.is_verified,
  s.is_featured,
  build_full_address(s.address, s.city, s.state, s.zip_code, s.country) AS full_address,
  CASE 
    WHEN s.latitude IS NOT NULL AND s.longitude IS NOT NULL THEN
      jsonb_build_object(
        'status', 'CACHED',
        'latitude', s.latitude,
        'longitude', s.longitude,
        'source', 'database'
      )
    ELSE
      geocode_address(s.address, s.city, s.state, s.zip_code, s.country)
  END AS geocoding_result,
  ST_SetSRID(
    ST_MakePoint(
      COALESCE(s.longitude, (geocode_address(s.address, s.city, s.state, s.zip_code, s.country)->>'longitude')::float),
      COALESCE(s.latitude, (geocode_address(s.address, s.city, s.state, s.zip_code, s.country)->>'latitude')::float)
    ), 4326
  ) AS geom
FROM studios s
WHERE s.is_active = true;

-- 7. Create a function to update studio coordinates from geocoding
CREATE OR REPLACE FUNCTION update_studio_coordinates(p_studio_id TEXT) RETURNS JSONB AS $$
DECLARE
  studio_record RECORD;
  geocoding_result JSONB;
BEGIN
  -- Get studio information
  SELECT * INTO studio_record
  FROM studios
  WHERE id = p_studio_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'ERROR', 'error', 'Studio not found');
  END IF;
  
  -- Geocode the address
  geocoding_result := geocode_address(
    studio_record.address,
    studio_record.city,
    studio_record.state,
    studio_record.zip_code,
    studio_record.country
  );
  
  -- Update studio coordinates if geocoding was successful
  IF geocoding_result->>'status' = 'OK' THEN
    UPDATE studios
    SET 
      latitude = (geocoding_result->>'latitude')::float,
      longitude = (geocoding_result->>'longitude')::float,
      updated_at = NOW()
    WHERE id = p_studio_id;
    
    RETURN jsonb_build_object(
      'status', 'SUCCESS',
      'studio_id', p_studio_id,
      'latitude', geocoding_result->>'latitude',
      'longitude', geocoding_result->>'longitude',
      'formatted_address', geocoding_result->>'formatted_address'
    );
  ELSE
    RETURN jsonb_build_object(
      'status', 'ERROR',
      'studio_id', p_studio_id,
      'geocoding_error', geocoding_result->>'error'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 8. Create a function to batch update all studios without coordinates
CREATE OR REPLACE FUNCTION batch_update_studio_coordinates() RETURNS TABLE(
  studio_id TEXT,
  status TEXT,
  latitude FLOAT,
  longitude FLOAT,
  error TEXT
) AS $$
DECLARE
  studio_record RECORD;
  geocoding_result JSONB;
  delay_seconds INTEGER := 1; -- Rate limiting delay
BEGIN
  FOR studio_record IN 
    SELECT id, address, city, state, zip_code, country
    FROM studios
    WHERE (latitude IS NULL OR longitude IS NULL)
      AND is_active = true
      AND address IS NOT NULL
      AND address != ''
  LOOP
    -- Add delay for rate limiting
    PERFORM pg_sleep(delay_seconds);
    
    -- Geocode the address
    geocoding_result := geocode_address(
      studio_record.address,
      studio_record.city,
      studio_record.state,
      studio_record.zip_code,
      studio_record.country
    );
    
    -- Update studio coordinates if geocoding was successful
    IF geocoding_result->>'status' = 'OK' THEN
      UPDATE studios
      SET 
        latitude = (geocoding_result->>'latitude')::float,
        longitude = (geocoding_result->>'longitude')::float,
        updated_at = NOW()
      WHERE id = studio_record.id;
      
      studio_id := studio_record.id;
      status := 'SUCCESS';
      latitude := (geocoding_result->>'latitude')::float;
      longitude := (geocoding_result->>'longitude')::float;
      error := NULL;
    ELSE
      studio_id := studio_record.id;
      status := 'ERROR';
      latitude := NULL;
      longitude := NULL;
      error := geocoding_result->>'error';
    END IF;
    
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 9. Create a function to get GeoJSON for map display
CREATE OR REPLACE FUNCTION get_studios_geojson(
  p_lat_min FLOAT DEFAULT NULL,
  p_lat_max FLOAT DEFAULT NULL,
  p_lng_min FLOAT DEFAULT NULL,
  p_lng_max FLOAT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  bbox_filter TEXT := '';
  geojson JSONB;
BEGIN
  -- Build bounding box filter if coordinates provided
  IF p_lat_min IS NOT NULL AND p_lat_max IS NOT NULL AND p_lng_min IS NOT NULL AND p_lng_max IS NOT NULL THEN
    bbox_filter := ' AND ST_Within(geom, ST_MakeEnvelope(' || 
                   p_lng_min || ', ' || p_lat_min || ', ' || p_lng_max || ', ' || p_lat_max || ', 4326))';
  END IF;
  
  -- Build GeoJSON collection
  SELECT jsonb_build_object(
    'type', 'FeatureCollection',
    'features', jsonb_agg(
      jsonb_build_object(
        'type', 'Feature',
        'geometry', ST_AsGeoJSON(geom)::jsonb,
        'properties', jsonb_build_object(
          'id', id,
          'name', name,
          'address', address,
          'city', city,
          'state', state,
          'zip_code', zip_code,
          'country', country,
          'is_verified', is_verified,
          'is_featured', is_featured,
          'full_address', full_address
        )
      )
    )
  ) INTO geojson
  FROM studio_locations
  WHERE geom IS NOT NULL
    AND geocoding_result->>'status' IN ('OK', 'CACHED')
    AND bbox_filter = '' OR bbox_filter;
  
  RETURN COALESCE(geojson, jsonb_build_object('type', 'FeatureCollection', 'features', '[]'::jsonb));
END;
$$ LANGUAGE plpgsql;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_studios_coordinates ON studios(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_studios_active ON studios(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_studios_geom ON studios USING GIST(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326));

-- 11. Create a function to set the API key
CREATE OR REPLACE FUNCTION set_google_maps_api_key(p_api_key TEXT) RETURNS TEXT AS $$
BEGIN
  PERFORM set_config('app.google_maps_api_key', p_api_key, false);
  RETURN 'API key set successfully';
END;
$$ LANGUAGE plpgsql;

-- 12. Create a function to check geocoding status
CREATE OR REPLACE FUNCTION get_geocoding_status() RETURNS TABLE(
  total_studios INTEGER,
  geocoded_studios INTEGER,
  missing_coordinates INTEGER,
  percentage_complete NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_studios,
    COUNT(*) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL)::INTEGER as geocoded_studios,
    COUNT(*) FILTER (WHERE latitude IS NULL OR longitude IS NULL)::INTEGER as missing_coordinates,
    ROUND(
      (COUNT(*) FILTER (WHERE latitude IS NOT NULL AND longitude IS NOT NULL)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2
    ) as percentage_complete
  FROM studios
  WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO PUBLIC;
GRANT SELECT ON studio_locations TO PUBLIC;
GRANT SELECT ON studios TO PUBLIC;

-- Create a comment explaining the setup
COMMENT ON SCHEMA public IS 'PostgreSQL HTTP Foreign Data Wrapper setup for Google Geocoding API integration. This system allows geocoding to happen directly in PostgreSQL without external ETL processes.'; 