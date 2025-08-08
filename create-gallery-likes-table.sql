-- Create tattoo_gallery_likes table
CREATE TABLE IF NOT EXISTS "tattoo_gallery_likes" (
    "id" TEXT NOT NULL,
    "galleryItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tattoo_gallery_likes_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "tattoo_gallery_likes" ADD CONSTRAINT "tattoo_gallery_likes_galleryItemId_fkey" 
    FOREIGN KEY ("galleryItemId") REFERENCES "tattoo_gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tattoo_gallery_likes" ADD CONSTRAINT "tattoo_gallery_likes_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraint to prevent duplicate likes
ALTER TABLE "tattoo_gallery_likes" ADD CONSTRAINT "tattoo_gallery_likes_galleryItemId_userId_key" 
    UNIQUE ("galleryItemId", "userId");

-- Create indexes for better performance
CREATE INDEX "tattoo_gallery_likes_galleryItemId_idx" ON "tattoo_gallery_likes"("galleryItemId");
CREATE INDEX "tattoo_gallery_likes_userId_idx" ON "tattoo_gallery_likes"("userId");

-- Verify the table was created
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tattoo_gallery_likes'
) AS tattoo_gallery_likes_created;

-- Show table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tattoo_gallery_likes'
ORDER BY ordinal_position;
