-- Create geocode_cache table for storing geocoding results
CREATE TABLE IF NOT EXISTS geocode_cache (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    address_hash TEXT UNIQUE NOT NULL,
    original_address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP(6) DEFAULT now(),
    updated_at TIMESTAMP(6) DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_geocode_cache_address_hash ON geocode_cache(address_hash);

-- Add comment to table
COMMENT ON TABLE geocode_cache IS 'Cache for geocoding results to avoid repeated API calls';

-- Verify table was created
SELECT 'Geocode cache table created successfully' as status; 