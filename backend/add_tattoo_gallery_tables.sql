-- Add Tattoo Gallery Tables to Production Database
-- This script adds the missing tattoo gallery tables that are referenced in the Prisma schema

-- Create tattoo_gallery table
CREATE TABLE IF NOT EXISTS "tattoo_gallery" (
    "id" TEXT NOT NULL,
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
    "clientConsent" BOOLEAN NOT NULL DEFAULT false,
    "clientAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "clientAgeVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBeforeAfter" BOOLEAN NOT NULL DEFAULT false,
    "beforeImageUrl" TEXT,
    "beforeImagePublicId" TEXT,
    "afterImageUrl" TEXT,
    "afterImagePublicId" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT '{}',
    "categories" TEXT[] DEFAULT '{}',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tattoo_gallery_pkey" PRIMARY KEY ("id")
);

-- Create tattoo_gallery_likes table
CREATE TABLE IF NOT EXISTS "tattoo_gallery_likes" (
    "id" TEXT NOT NULL,
    "galleryItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tattoo_gallery_likes_pkey" PRIMARY KEY ("id")
);

-- Create tattoo_gallery_comments table
CREATE TABLE IF NOT EXISTS "tattoo_gallery_comments" (
    "id" TEXT NOT NULL,
    "galleryItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tattoo_gallery_comments_pkey" PRIMARY KEY ("id")
);

-- Create tattoo_gallery_views table
CREATE TABLE IF NOT EXISTS "tattoo_gallery_views" (
    "id" TEXT NOT NULL,
    "galleryItemId" TEXT NOT NULL,
    "viewerIp" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tattoo_gallery_views_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "tattoo_gallery" ADD CONSTRAINT "tattoo_gallery_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tattoo_gallery_likes" ADD CONSTRAINT "tattoo_gallery_likes_galleryItemId_fkey" FOREIGN KEY ("galleryItemId") REFERENCES "tattoo_gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tattoo_gallery_likes" ADD CONSTRAINT "tattoo_gallery_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tattoo_gallery_comments" ADD CONSTRAINT "tattoo_gallery_comments_galleryItemId_fkey" FOREIGN KEY ("galleryItemId") REFERENCES "tattoo_gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tattoo_gallery_comments" ADD CONSTRAINT "tattoo_gallery_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tattoo_gallery_views" ADD CONSTRAINT "tattoo_gallery_views_galleryItemId_fkey" FOREIGN KEY ("galleryItemId") REFERENCES "tattoo_gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_artist_id" ON "tattoo_gallery"("artistId");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_style" ON "tattoo_gallery"("tattooStyle");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_location" ON "tattoo_gallery"("bodyLocation");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_featured" ON "tattoo_gallery"("isFeatured");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_approved" ON "tattoo_gallery"("isApproved");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_created_at" ON "tattoo_gallery"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_tags" ON "tattoo_gallery" USING GIN("tags");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_categories" ON "tattoo_gallery" USING GIN("categories");

CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_likes_item" ON "tattoo_gallery_likes"("galleryItemId");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_likes_user" ON "tattoo_gallery_likes"("userId");

CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_comments_item" ON "tattoo_gallery_comments"("galleryItemId");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_comments_user" ON "tattoo_gallery_comments"("userId");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_comments_approved" ON "tattoo_gallery_comments"("isApproved");

CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_views_item" ON "tattoo_gallery_views"("galleryItemId");
CREATE INDEX IF NOT EXISTS "idx_tattoo_gallery_views_date" ON "tattoo_gallery_views"("viewedAt");

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "tattoo_gallery_likes_galleryItemId_userId_key" ON "tattoo_gallery_likes"("galleryItemId", "userId");

-- Add profile picture fields to artist_profiles table if they don't exist
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureUrl" TEXT;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePicturePublicId" TEXT;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureWidth" INTEGER;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureHeight" INTEGER;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureFormat" TEXT;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureBytes" INTEGER;

-- Create function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_tattoo_gallery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updatedAt
DROP TRIGGER IF EXISTS trigger_tattoo_gallery_updated_at ON "tattoo_gallery";
CREATE TRIGGER trigger_tattoo_gallery_updated_at
    BEFORE UPDATE ON "tattoo_gallery"
    FOR EACH ROW
    EXECUTE FUNCTION update_tattoo_gallery_updated_at();

-- Create trigger for tattoo_gallery_comments updatedAt
DROP TRIGGER IF EXISTS trigger_tattoo_gallery_comments_updated_at ON "tattoo_gallery_comments";
CREATE TRIGGER trigger_tattoo_gallery_comments_updated_at
    BEFORE UPDATE ON "tattoo_gallery_comments"
    FOR EACH ROW
    EXECUTE FUNCTION update_tattoo_gallery_updated_at();

-- Helper functions for counts
CREATE OR REPLACE FUNCTION get_tattoo_gallery_likes_count(gallery_item_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM "tattoo_gallery_likes" WHERE "galleryItemId" = gallery_item_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_tattoo_gallery_views_count(gallery_item_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM "tattoo_gallery_views" WHERE "galleryItemId" = gallery_item_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_tattoo_gallery_comments_count(gallery_item_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM "tattoo_gallery_comments" WHERE "galleryItemId" = gallery_item_id AND "isApproved" = true AND "isHidden" = false);
END;
$$ LANGUAGE plpgsql;

-- Create views for easier querying
CREATE OR REPLACE VIEW public_tattoo_gallery AS
SELECT 
    tg.*,
    get_tattoo_gallery_likes_count(tg.id) as likes_count,
    get_tattoo_gallery_views_count(tg.id) as views_count,
    get_tattoo_gallery_comments_count(tg.id) as comments_count
FROM "tattoo_gallery" tg
WHERE tg."isApproved" = true AND tg."isHidden" = false AND tg."clientConsent" = true;

CREATE OR REPLACE VIEW artist_gallery_stats AS
SELECT 
    ap.id as artist_id,
    COUNT(tg.id) as total_items,
    COUNT(CASE WHEN tg."isFeatured" = true THEN 1 END) as featured_items,
    COUNT(CASE WHEN tg."isBeforeAfter" = true THEN 1 END) as before_after_items,
    AVG(tg."hoursSpent") as avg_hours_per_piece,
    SUM(tg."hoursSpent") as total_hours_worked
FROM "artist_profiles" ap
LEFT JOIN "tattoo_gallery" tg ON ap.id = tg."artistId"
WHERE tg."isApproved" = true AND tg."isHidden" = false
GROUP BY ap.id;

-- Insert some sample tattoo styles into specialties if they don't exist
INSERT INTO "specialties" ("id", "name", "category", "description", "isActive", "createdAt", "updatedAt")
VALUES 
    ('tattoo-style-traditional', 'Traditional American', 'Tattoo Style', 'Classic American traditional tattoo style with bold outlines and limited color palette', true, NOW(), NOW()),
    ('tattoo-style-japanese', 'Japanese (Irezumi)', 'Tattoo Style', 'Traditional Japanese tattoo art with intricate designs and vibrant colors', true, NOW(), NOW()),
    ('tattoo-style-black-grey', 'Black & Grey', 'Tattoo Style', 'Monochrome tattoos using only black and grey ink for realistic shading', true, NOW(), NOW()),
    ('tattoo-style-realistic', 'Realistic', 'Tattoo Style', 'Photorealistic tattoos that look like photographs or paintings', true, NOW(), NOW()),
    ('tattoo-style-neo-traditional', 'Neo-Traditional', 'Tattoo Style', 'Modern take on traditional American style with more colors and details', true, NOW(), NOW()),
    ('tattoo-style-watercolor', 'Watercolor', 'Tattoo Style', 'Soft, painterly tattoos that mimic watercolor paintings', true, NOW(), NOW()),
    ('tattoo-style-geometric', 'Geometric', 'Tattoo Style', 'Clean, precise geometric shapes and patterns', true, NOW(), NOW()),
    ('tattoo-style-minimalist', 'Minimalist', 'Tattoo Style', 'Simple, clean designs with minimal detail', true, NOW(), NOW()),
    ('tattoo-style-tribal', 'Tribal', 'Tattoo Style', 'Bold, black tribal patterns inspired by indigenous cultures', true, NOW(), NOW()),
    ('tattoo-style-new-school', 'New School', 'Tattoo Style', 'Modern, cartoon-like style with bright colors and exaggerated proportions', true, NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;

-- Success message
SELECT 'Tattoo gallery tables created successfully!' as status; 