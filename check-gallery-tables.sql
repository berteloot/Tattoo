-- Check if tattoo_gallery table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tattoo_gallery'
) AS tattoo_gallery_exists;

-- Check if tattoo_gallery_likes table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tattoo_gallery_likes'
) AS tattoo_gallery_likes_exists;

-- Check if tattoo_gallery_comments table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tattoo_gallery_comments'
) AS tattoo_gallery_comments_exists;

-- Check if tattoo_gallery_views table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'tattoo_gallery_views'
) AS tattoo_gallery_views_exists;

-- List all tables that start with 'tattoo_gallery'
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'tattoo_gallery%'
ORDER BY table_name;

-- Check tattoo_gallery table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tattoo_gallery'
ORDER BY ordinal_position;

-- Check tattoo_gallery_likes table structure (if it exists)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tattoo_gallery_likes'
ORDER BY ordinal_position;

-- Check for any existing likes data
SELECT COUNT(*) as total_likes
FROM tattoo_gallery_likes;

-- Check for any existing gallery items
SELECT COUNT(*) as total_gallery_items
FROM tattoo_gallery;

-- Check sample gallery items
SELECT id, title, "artistId", "isApproved", "isHidden", "clientConsent"
FROM tattoo_gallery 
LIMIT 5;
