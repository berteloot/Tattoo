-- Add Profile Picture Fields to Production Database
-- Run these commands in pgAdmin

-- 1. Check if fields already exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'artist_profiles' 
AND column_name LIKE 'profile_picture%'
ORDER BY column_name;

-- 2. Add profile picture fields (run this if no fields exist)
ALTER TABLE artist_profiles 
ADD COLUMN profile_picture_url VARCHAR(500),
ADD COLUMN profile_picture_public_id VARCHAR(255),
ADD COLUMN profile_picture_width INTEGER,
ADD COLUMN profile_picture_height INTEGER,
ADD COLUMN profile_picture_format VARCHAR(50),
ADD COLUMN profile_picture_bytes INTEGER;

-- 3. Add field comments
COMMENT ON COLUMN artist_profiles.profile_picture_url IS 'URL of the artist profile picture (Cloudinary/S3)';
COMMENT ON COLUMN artist_profiles.profile_picture_public_id IS 'Public ID for the profile picture (for deletion/updates)';
COMMENT ON COLUMN artist_profiles.profile_picture_width IS 'Width of the profile picture in pixels';
COMMENT ON COLUMN artist_profiles.profile_picture_height IS 'Height of the profile picture in pixels';
COMMENT ON COLUMN artist_profiles.profile_picture_format IS 'Image format (jpeg, png, webp, etc.)';
COMMENT ON COLUMN artist_profiles.profile_picture_bytes IS 'File size in bytes';

-- 4. Create index for performance
CREATE INDEX idx_artist_profiles_profile_picture_url 
ON artist_profiles(profile_picture_url);

-- 5. Add URL validation constraint
ALTER TABLE artist_profiles 
ADD CONSTRAINT chk_profile_picture_url 
CHECK (profile_picture_url IS NULL OR profile_picture_url ~ '^https?://');

-- 6. Verify the fields were added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'artist_profiles' 
AND column_name LIKE 'profile_picture%'
ORDER BY column_name;
