-- Update Production Database with Profile Picture Fields
-- Run these commands in pgAdmin or your production database management tool

-- 1. Add profile picture fields to artist_profiles table
ALTER TABLE artist_profiles 
ADD COLUMN profile_picture_url VARCHAR(500),
ADD COLUMN profile_picture_public_id VARCHAR(255),
ADD COLUMN profile_picture_width INTEGER,
ADD COLUMN profile_picture_height INTEGER,
ADD COLUMN profile_picture_format VARCHAR(50),
ADD COLUMN profile_picture_bytes INTEGER;

-- 2. Add comments to document the new fields
COMMENT ON COLUMN artist_profiles.profile_picture_url IS 'URL of the artist profile picture (Cloudinary/S3)';
COMMENT ON COLUMN artist_profiles.profile_picture_public_id IS 'Public ID for the profile picture (for deletion/updates)';
COMMENT ON COLUMN artist_profiles.profile_picture_width IS 'Width of the profile picture in pixels';
COMMENT ON COLUMN artist_profiles.profile_picture_height IS 'Height of the profile picture in pixels';
COMMENT ON COLUMN artist_profiles.profile_picture_format IS 'Image format (jpeg, png, webp, etc.)';
COMMENT ON COLUMN artist_profiles.profile_picture_bytes IS 'File size in bytes';

-- 3. Create an index on profile_picture_url for faster queries
CREATE INDEX idx_artist_profiles_profile_picture_url ON artist_profiles(profile_picture_url);

-- 4. Add a constraint to ensure URL is valid (basic check)
ALTER TABLE artist_profiles 
ADD CONSTRAINT chk_profile_picture_url 
CHECK (profile_picture_url IS NULL OR profile_picture_url ~ '^https?://');

-- 5. Verify the columns were added correctly
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'artist_profiles' 
AND column_name LIKE 'profile_picture%'
ORDER BY column_name;

-- 6. Show the complete table structure for verification
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'artist_profiles' 
ORDER BY ordinal_position;
