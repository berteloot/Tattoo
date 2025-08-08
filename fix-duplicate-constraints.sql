-- Comprehensive fix for duplicate constraints in tattoo_gallery_likes table

-- Step 1: Show current state
SELECT 'BEFORE CLEANUP - Current constraints:' as info;
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'tattoo_gallery_likes'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Step 2: Remove ALL duplicate constraints
-- Remove the manually created foreign keys (keep Prisma ones)
ALTER TABLE "tattoo_gallery_likes" DROP CONSTRAINT IF EXISTS "fk_tattoo_gallery_likes_item";
ALTER TABLE "tattoo_gallery_likes" DROP CONSTRAINT IF EXISTS "fk_tattoo_gallery_likes_user";

-- Remove the manually created unique constraint (keep Prisma one)
ALTER TABLE "tattoo_gallery_likes" DROP CONSTRAINT IF EXISTS "unique_gallery_like";

-- Step 3: Verify cleanup
SELECT 'AFTER CLEANUP - Remaining constraints:' as info;
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'tattoo_gallery_likes'
ORDER BY tc.constraint_type, tc.constraint_name;

-- Step 4: Test the like functionality
-- Get test data
SELECT 'Test data for like functionality:' as info;
SELECT 'Gallery item:' as type, id, title FROM tattoo_gallery LIMIT 1;
SELECT 'User:' as type, id, "firstName", "lastName" FROM users LIMIT 1;

-- Step 5: Try to insert a test like (this will verify the constraints work)
-- Uncomment the lines below to test (replace with actual IDs from step 4)
/*
INSERT INTO "tattoo_gallery_likes" ("id", "galleryItemId", "userId", "createdAt")
VALUES (
    gen_random_uuid()::text,
    'REPLACE_WITH_GALLERY_ITEM_ID',
    'REPLACE_WITH_USER_ID',
    NOW()
);
*/
