-- Fix Tattoo Gallery Tables - Check and Fix Column Names
-- This script checks the existing tables and fixes any column name mismatches

-- First, let's check what columns actually exist in the tattoo_gallery table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'tattoo_gallery' 
ORDER BY ordinal_position;

-- Check if we need to rename columns
DO $$
BEGIN
    -- Check if artistId column exists, if not, try to find the correct column name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tattoo_gallery' AND column_name = 'artistId') THEN
        -- Try to find the correct column name
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tattoo_gallery' AND column_name = 'artist_id') THEN
            ALTER TABLE "tattoo_gallery" RENAME COLUMN "artist_id" TO "artistId";
            RAISE NOTICE 'Renamed artist_id to artistId';
        ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tattoo_gallery' AND column_name = 'artistprofileid') THEN
            ALTER TABLE "tattoo_gallery" RENAME COLUMN "artistprofileid" TO "artistId";
            RAISE NOTICE 'Renamed artistprofileid to artistId';
        ELSE
            RAISE NOTICE 'No artist column found, creating artistId column';
            ALTER TABLE "tattoo_gallery" ADD COLUMN "artistId" TEXT;
        END IF;
    END IF;
    
    -- Check and fix other column names if needed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tattoo_gallery' AND column_name = 'galleryItemId') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tattoo_gallery_likes' AND column_name = 'gallery_item_id') THEN
            ALTER TABLE "tattoo_gallery_likes" RENAME COLUMN "gallery_item_id" TO "galleryItemId";
            RAISE NOTICE 'Renamed gallery_item_id to galleryItemId in likes table';
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tattoo_gallery_likes' AND column_name = 'userId') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tattoo_gallery_likes' AND column_name = 'user_id') THEN
            ALTER TABLE "tattoo_gallery_likes" RENAME COLUMN "user_id" TO "userId";
            RAISE NOTICE 'Renamed user_id to userId in likes table';
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tattoo_gallery_comments' AND column_name = 'galleryItemId') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tattoo_gallery_comments' AND column_name = 'gallery_item_id') THEN
            ALTER TABLE "tattoo_gallery_comments" RENAME COLUMN "gallery_item_id" TO "galleryItemId";
            RAISE NOTICE 'Renamed gallery_item_id to galleryItemId in comments table';
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tattoo_gallery_comments' AND column_name = 'userId') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tattoo_gallery_comments' AND column_name = 'user_id') THEN
            ALTER TABLE "tattoo_gallery_comments" RENAME COLUMN "user_id" TO "userId";
            RAISE NOTICE 'Renamed user_id to userId in comments table';
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tattoo_gallery_views' AND column_name = 'galleryItemId') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tattoo_gallery_views' AND column_name = 'gallery_item_id') THEN
            ALTER TABLE "tattoo_gallery_views" RENAME COLUMN "gallery_item_id" TO "galleryItemId";
            RAISE NOTICE 'Renamed gallery_item_id to galleryItemId in views table';
        END IF;
    END IF;
END $$;

-- Now try to add the foreign key constraints again
DO $$
BEGIN
    -- Add foreign key for tattoo_gallery.artistId
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tattoo_gallery_artistId_fkey') THEN
        ALTER TABLE "tattoo_gallery" ADD CONSTRAINT "tattoo_gallery_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for tattoo_gallery.artistId';
    END IF;
    
    -- Add foreign keys for tattoo_gallery_likes
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tattoo_gallery_likes_galleryItemId_fkey') THEN
        ALTER TABLE "tattoo_gallery_likes" ADD CONSTRAINT "tattoo_gallery_likes_galleryItemId_fkey" FOREIGN KEY ("galleryItemId") REFERENCES "tattoo_gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for tattoo_gallery_likes.galleryItemId';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tattoo_gallery_likes_userId_fkey') THEN
        ALTER TABLE "tattoo_gallery_likes" ADD CONSTRAINT "tattoo_gallery_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for tattoo_gallery_likes.userId';
    END IF;
    
    -- Add foreign keys for tattoo_gallery_comments
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tattoo_gallery_comments_galleryItemId_fkey') THEN
        ALTER TABLE "tattoo_gallery_comments" ADD CONSTRAINT "tattoo_gallery_comments_galleryItemId_fkey" FOREIGN KEY ("galleryItemId") REFERENCES "tattoo_gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for tattoo_gallery_comments.galleryItemId';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tattoo_gallery_comments_userId_fkey') THEN
        ALTER TABLE "tattoo_gallery_comments" ADD CONSTRAINT "tattoo_gallery_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for tattoo_gallery_comments.userId';
    END IF;
    
    -- Add foreign key for tattoo_gallery_views
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tattoo_gallery_views_galleryItemId_fkey') THEN
        ALTER TABLE "tattoo_gallery_views" ADD CONSTRAINT "tattoo_gallery_views_galleryItemId_fkey" FOREIGN KEY ("galleryItemId") REFERENCES "tattoo_gallery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for tattoo_gallery_views.galleryItemId';
    END IF;
END $$;

-- Show the final table structure
SELECT 'Final tattoo_gallery table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tattoo_gallery' 
ORDER BY ordinal_position;

SELECT 'Foreign key constraints:' as info;
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage 
WHERE table_name LIKE 'tattoo_gallery%' 
AND constraint_name LIKE '%fkey'
ORDER BY table_name, column_name;

-- Success message
SELECT 'Tattoo gallery tables fixed successfully!' as status; 