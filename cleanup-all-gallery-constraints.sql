-- Comprehensive cleanup of duplicate constraints in all gallery tables

-- Step 1: Show current state
SELECT 'BEFORE CLEANUP - Current foreign key constraints:' as info;
SELECT 
    tc.table_name,
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
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name LIKE 'tattoo_gallery%'
ORDER BY tc.table_name, tc.constraint_name;

-- Step 2: Remove duplicate constraints from all gallery tables

-- Clean up tattoo_gallery table
ALTER TABLE "tattoo_gallery" DROP CONSTRAINT IF EXISTS "fk_tattoo_gallery_artist";

-- Clean up tattoo_gallery_comments table
ALTER TABLE "tattoo_gallery_comments" DROP CONSTRAINT IF EXISTS "fk_tattoo_gallery_comments_item";
ALTER TABLE "tattoo_gallery_comments" DROP CONSTRAINT IF EXISTS "fk_tattoo_gallery_comments_user";

-- Clean up tattoo_gallery_views table
ALTER TABLE "tattoo_gallery_views" DROP CONSTRAINT IF EXISTS "fk_tattoo_gallery_views_item";

-- Step 3: Verify cleanup
SELECT 'AFTER CLEANUP - Remaining foreign key constraints:' as info;
SELECT 
    tc.table_name,
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
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name LIKE 'tattoo_gallery%'
ORDER BY tc.table_name, tc.constraint_name;

-- Step 4: Check for any remaining duplicate constraints
SELECT 'Checking for any remaining duplicate constraints:' as info;
SELECT 
    table_name,
    column_name,
    COUNT(*) as constraint_count
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name LIKE 'tattoo_gallery%'
GROUP BY table_name, column_name
HAVING COUNT(*) > 1
ORDER BY table_name, column_name;
