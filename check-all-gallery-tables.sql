-- Check all gallery-related tables
SELECT 'Checking all gallery tables:' as info;

-- Check if all required tables exist
SELECT 
    table_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = t.table_name
    ) AS exists
FROM (VALUES 
    ('tattoo_gallery'),
    ('tattoo_gallery_likes'),
    ('tattoo_gallery_comments'),
    ('tattoo_gallery_views')
) AS t(table_name);

-- Check tattoo_gallery_comments table structure
SELECT 'tattoo_gallery_comments structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tattoo_gallery_comments'
ORDER BY ordinal_position;

-- Check tattoo_gallery_views table structure
SELECT 'tattoo_gallery_views structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tattoo_gallery_views'
ORDER BY ordinal_position;

-- Check for any existing data in gallery tables
SELECT 'Gallery data counts:' as info;
SELECT 'tattoo_gallery' as table_name, COUNT(*) as count FROM tattoo_gallery
UNION ALL
SELECT 'tattoo_gallery_likes' as table_name, COUNT(*) as count FROM tattoo_gallery_likes
UNION ALL
SELECT 'tattoo_gallery_comments' as table_name, COUNT(*) as count FROM tattoo_gallery_comments
UNION ALL
SELECT 'tattoo_gallery_views' as table_name, COUNT(*) as count FROM tattoo_gallery_views;

-- Check if there are any foreign key issues
SELECT 'Foreign key issues:' as info;
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name LIKE 'tattoo_gallery%'
ORDER BY tc.table_name, tc.constraint_name;
