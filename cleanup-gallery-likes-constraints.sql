-- Clean up duplicate constraints in tattoo_gallery_likes table

-- First, let's see what we're working with
SELECT 'Current constraints:' as info;
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'tattoo_gallery_likes'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Remove duplicate foreign key constraints
-- Keep the Prisma-generated ones and remove the manually created ones

-- Remove duplicate gallery foreign key (keep the Prisma one)
ALTER TABLE "tattoo_gallery_likes" DROP CONSTRAINT IF EXISTS "fk_tattoo_gallery_likes_item";

-- Remove duplicate user foreign key (keep the Prisma one)  
ALTER TABLE "tattoo_gallery_likes" DROP CONSTRAINT IF EXISTS "fk_tattoo_gallery_likes_user";

-- Remove duplicate unique constraint (keep the Prisma one)
ALTER TABLE "tattoo_gallery_likes" DROP CONSTRAINT IF EXISTS "unique_gallery_like";

-- Verify the cleanup
SELECT 'After cleanup:' as info;
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'tattoo_gallery_likes'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Test if we can insert a like now
-- First, get a gallery item and user ID for testing
SELECT 'Test data:' as info;
SELECT 'Gallery items:' as type, id, title FROM tattoo_gallery LIMIT 1;
SELECT 'Users:' as type, id, "firstName", "lastName" FROM users LIMIT 1;
