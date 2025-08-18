-- Migration: Baseline Production Schema
-- This migration ensures all required tables exist in production
-- Created: 2025-08-09 21:36:00

-- Create studio_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "studio_role" AS ENUM ('OWNER', 'MANAGER', 'ARTIST', 'GUEST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create studios table if it doesn't exist
CREATE TABLE IF NOT EXISTS "studios" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "website" TEXT,
    "phone_number" TEXT,
    "email" TEXT,
    "facebook_url" TEXT,
    "instagram_url" TEXT,
    "twitter_url" TEXT,
    "linkedin_url" TEXT,
    "youtube_url" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "country" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "is_verified" BOOLEAN DEFAULT false,
    "is_featured" BOOLEAN DEFAULT false,
    "verification_status" TEXT DEFAULT 'PENDING',
    "claimed_by" TEXT,
    "claimed_at" TIMESTAMP,
    "verified_by" TEXT,
    "verified_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create studio_artists table if it doesn't exist
CREATE TABLE IF NOT EXISTS "studio_artists" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "studio_id" TEXT NOT NULL,
    "artist_id" TEXT NOT NULL,
    "role" "studio_role" DEFAULT 'ARTIST',
    "is_active" BOOLEAN DEFAULT true,
    "joined_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP,
    CONSTRAINT "unique_studio_artist" UNIQUE ("studio_id", "artist_id")
);

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS "idx_studios_coordinates" ON "studios"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "idx_studios_slug" ON "studios"("slug");
CREATE INDEX IF NOT EXISTS "idx_studios_title" ON "studios"("title");
CREATE INDEX IF NOT EXISTS "idx_studio_artists_studio_id" ON "studio_artists"("studio_id");
CREATE INDEX IF NOT EXISTS "idx_studio_artists_artist_id" ON "studio_artists"("artist_id");

-- Ensure all required columns exist in artist_profiles
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "calendlyUrl" TEXT;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT DEFAULT 'PENDING';
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT false;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "lastViewedAt" TIMESTAMP(3);
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profileViews" INTEGER DEFAULT 0;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "pinterest" VARCHAR(255);
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureUrl" TEXT;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePicturePublicId" TEXT;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureWidth" INTEGER;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureHeight" INTEGER;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureFormat" TEXT;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureBytes" INTEGER;

-- Ensure all required columns exist in flash table
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imagePublicId" TEXT;
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageWidth" INTEGER;
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageHeight" INTEGER;
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageFormat" TEXT;
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageBytes" INTEGER;
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "basePrice" DOUBLE PRECISION;
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "complexity" TEXT DEFAULT 'MEDIUM';
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "timeEstimate" INTEGER;
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isRepeatable" BOOLEAN DEFAULT true;
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "sizePricing" JSONB;
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isAvailable" BOOLEAN DEFAULT true;
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN DEFAULT true;
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN DEFAULT false;
ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';

-- Ensure all required columns exist in users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationExpiry" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);

-- Create admin_actions table if it doesn't exist
CREATE TABLE IF NOT EXISTS "admin_actions" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "adminId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "admin" "users" NOT NULL
);

-- Create geocode_cache table if it doesn't exist
CREATE TABLE IF NOT EXISTS "geocode_cache" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "address_hash" TEXT UNIQUE NOT NULL,
    "original_address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tattoo_gallery table if it doesn't exist
CREATE TABLE IF NOT EXISTS "tattoo_gallery" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "artistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT,
    "imageWidth" INTEGER,
    "imageHeight" INTEGER,
    "imageFormat" TEXT,
    "imageBytes" INTEGER,
    "thumbnailUrl" TEXT,
    "tattooStyle" TEXT,
    "bodyLocation" TEXT,
    "tattooSize" TEXT,
    "colorType" TEXT,
    "sessionCount" INTEGER DEFAULT 1,
    "hoursSpent" INTEGER,
    "clientConsent" BOOLEAN DEFAULT false,
    "clientAnonymous" BOOLEAN DEFAULT true,
    "clientAgeVerified" BOOLEAN DEFAULT false,
    "isBeforeAfter" BOOLEAN DEFAULT false,
    "beforeImageUrl" TEXT,
    "beforeImagePublicId" TEXT,
    "afterImageUrl" TEXT,
    "afterImagePublicId" TEXT,
    "tags" TEXT[] DEFAULT '{}',
    "categories" TEXT[] DEFAULT '{}',
    "isApproved" BOOLEAN DEFAULT true,
    "isFeatured" BOOLEAN DEFAULT false,
    "isHidden" BOOLEAN DEFAULT false,
    "viewCount" INTEGER DEFAULT 0,
    "likeCount" INTEGER DEFAULT 0,
    "commentCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create tattoo_gallery_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS "tattoo_gallery_likes" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "galleryItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_gallery_like" UNIQUE ("galleryItemId", "userId")
);

-- Create tattoo_gallery_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS "tattoo_gallery_comments" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "galleryItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isApproved" BOOLEAN DEFAULT true,
    "isHidden" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create tattoo_gallery_views table if it doesn't exist
CREATE TABLE IF NOT EXISTS "tattoo_gallery_views" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "galleryItemId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS "favorites" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unique_user_artist_favorite" UNIQUE ("userId", "artistId")
);

-- Add foreign key constraints if they don't exist
DO $$ BEGIN
    ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tattoo_gallery" ADD CONSTRAINT "tattoo_gallery_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tattoo_gallery_likes" ADD CONSTRAINT "tattoo_gallery_likes_galleryItemId_fkey" FOREIGN KEY ("galleryItemId") REFERENCES "tattoo_gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tattoo_gallery_likes" ADD CONSTRAINT "tattoo_gallery_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tattoo_gallery_comments" ADD CONSTRAINT "tattoo_gallery_comments_galleryItemId_fkey" FOREIGN KEY ("galleryItemId") REFERENCES "tattoo_gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tattoo_gallery_comments" ADD CONSTRAINT "tattoo_gallery_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tattoo_gallery_views" ADD CONSTRAINT "tattoo_gallery_views_galleryItemId_fkey" FOREIGN KEY ("galleryItemId") REFERENCES "tattoo_gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "favorites" ADD CONSTRAINT "favorites_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_admin_actions_admin_id" ON "admin_actions"("adminId");
CREATE INDEX IF NOT EXISTS "idx_admin_actions_created_at" ON "admin_actions"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_artist_id" ON "tattoo_gallery"("artistId");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_created_at" ON "tattoo_gallery"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_is_approved" ON "tattoo_gallery"("isApproved");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_is_featured" ON "tattoo_gallery"("isFeatured");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_tags" ON "tattoo_gallery" USING GIN("tags");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_categories" ON "tattoo_gallery" USING GIN("categories");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_tattoo_style" ON "tattoo_gallery"("tattooStyle");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_body_location" ON "tattoo_gallery"("bodyLocation");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_is_hidden" ON "tattoo_gallery"("isHidden");
CREATE INDEX IF NOT EXISTS "idx_geocode_cache_address_hash" ON "geocode_cache"("address_hash");
CREATE INDEX IF NOT EXISTS "idx_geocode_cache_updated_at" ON "geocode_cache"("updated_at");
CREATE INDEX IF NOT EXISTS "idx_favorites_user_id" ON "favorites"("userId");
CREATE INDEX IF NOT EXISTS "idx_favorites_artist_id" ON "favorites"("artistId");
CREATE INDEX IF NOT EXISTS "idx_favorites_created_at" ON "favorites"("createdAt");
