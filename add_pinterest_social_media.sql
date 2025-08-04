-- Add Pinterest social media field to artist_profiles table
-- This migration adds a pinterest field to store Pinterest profile URLs

ALTER TABLE artist_profiles 
ADD COLUMN pinterest VARCHAR(255);

-- Add a comment to document the field
COMMENT ON COLUMN artist_profiles.pinterest IS 'Pinterest profile URL for the artist';

-- Optional: Add an index for better query performance if you plan to search by Pinterest
-- CREATE INDEX idx_artist_profiles_pinterest ON artist_profiles(pinterest) WHERE pinterest IS NOT NULL; 