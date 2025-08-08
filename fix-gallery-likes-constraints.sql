-- Check current table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tattoo_gallery_likes'
ORDER BY ordinal_position;

-- Check existing constraints
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'tattoo_gallery_likes'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Check if unique constraint exists
SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'tattoo_gallery_likes' 
    AND constraint_type = 'UNIQUE'
    AND constraint_name = 'tattoo_gallery_likes_galleryItemId_userId_key'
) AS unique_constraint_exists;

-- Check if foreign key constraints exist
SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'tattoo_gallery_likes' 
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name = 'tattoo_gallery_likes_galleryItemId_fkey'
) AS fk_gallery_exists;

SELECT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'tattoo_gallery_likes' 
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name = 'tattoo_gallery_likes_userId_fkey'
) AS fk_user_exists;

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'tattoo_gallery_likes';

-- Test if we can insert a like (this will help identify the issue)
-- First, let's see what gallery items exist
SELECT id, title FROM tattoo_gallery LIMIT 3;

-- And what users exist
SELECT id, "firstName", "lastName" FROM users LIMIT 3;
