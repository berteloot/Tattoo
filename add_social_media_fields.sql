-- Migration: Add social media fields to artist_profiles table
-- Date: 2025-01-01
-- Description: Adds Facebook, Twitter, YouTube, and LinkedIn fields to artist profiles

-- Add social media fields to artist_profiles table
ALTER TABLE "artist_profiles" 
ADD COLUMN "facebook" TEXT,
ADD COLUMN "twitter" TEXT,
ADD COLUMN "youtube" TEXT,
ADD COLUMN "linkedin" TEXT;

-- Add comments for documentation
COMMENT ON COLUMN "artist_profiles"."facebook" IS 'Facebook profile URL or username';
COMMENT ON COLUMN "artist_profiles"."twitter" IS 'Twitter/X profile URL or username';
COMMENT ON COLUMN "artist_profiles"."youtube" IS 'YouTube channel URL or username';
COMMENT ON COLUMN "artist_profiles"."linkedin" IS 'LinkedIn profile URL or username';

-- Update the updatedAt timestamp
UPDATE "artist_profiles" SET "updatedAt" = NOW() WHERE "updatedAt" IS NOT NULL; 