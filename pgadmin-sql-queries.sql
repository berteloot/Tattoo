-- =====================================================
-- PgAdmin SQL Queries for Tattooed World Database
-- =====================================================

-- 1. Check all studios in the database
SELECT 
    id,
    title,
    slug,
    address,
    city,
    state,
    is_active,
    is_verified,
    is_featured,
    verification_status,
    created_at,
    updated_at
FROM studios
ORDER BY created_at DESC;

-- 2. Count studios by status
SELECT 
    verification_status,
    COUNT(*) as count
FROM studios
GROUP BY verification_status;

-- 3. Count studios by verification and featured status
SELECT 
    is_verified,
    is_featured,
    COUNT(*) as count
FROM studios
GROUP BY is_verified, is_featured;

-- 4. Check if there are any studios at all
SELECT COUNT(*) as total_studios FROM studios;

-- 5. Check active studios only
SELECT 
    id,
    title,
    address,
    city,
    state,
    is_verified,
    is_featured,
    verification_status
FROM studios
WHERE is_active = true
ORDER BY created_at DESC;

-- 6. Check users table for admin accounts
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_at
FROM users
WHERE role = 'ADMIN'
ORDER BY created_at DESC;

-- 7. Check all users to see what accounts exist
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_at
FROM users
ORDER BY created_at DESC;

-- 8. Insert a test studio if none exist
-- (Uncomment and run if you want to add a test studio)
/*
INSERT INTO studios (
    title,
    slug,
    website,
    phone_number,
    email,
    address,
    city,
    state,
    zip_code,
    country,
    is_active,
    is_verified,
    is_featured,
    verification_status,
    created_at,
    updated_at
) VALUES (
    'Test Studio',
    'test-studio',
    'https://teststudio.com',
    '555-123-4567',
    'test@studio.com',
    '123 Test Street',
    'Test City',
    'CA',
    '90210',
    'USA',
    true,
    false,
    false,
    'PENDING',
    NOW(),
    NOW()
);
*/

-- 9. Insert an admin user if none exist
-- (Uncomment and run if you need to create an admin account)
/*
INSERT INTO users (
    email,
    password_hash,
    first_name,
    last_name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'admin@tattooed-world.com',
    '$2b$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z',
    'Admin',
    'User',
    'ADMIN',
    true,
    NOW(),
    NOW()
);
*/

-- 10. Check studio_artists table to see if any studios have artists
SELECT 
    sa.id,
    sa.studio_id,
    s.title as studio_name,
    sa.artist_id,
    u.first_name,
    u.last_name,
    sa.is_active,
    sa.created_at
FROM studio_artists sa
JOIN studios s ON sa.studio_id = s.id
JOIN users u ON sa.artist_id = u.id
ORDER BY sa.created_at DESC;

-- 11. Count artists per studio
SELECT 
    s.id,
    s.title,
    COUNT(sa.id) as artist_count
FROM studios s
LEFT JOIN studio_artists sa ON s.id = sa.studio_id AND sa.is_active = true
GROUP BY s.id, s.title
ORDER BY artist_count DESC;

-- 12. Check database schema for studios table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'studios'
ORDER BY ordinal_position;

-- 13. Check for any recent studio activity
SELECT 
    'studios' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as latest_record
FROM studios
UNION ALL
SELECT 
    'studio_artists' as table_name,
    COUNT(*) as record_count,
    MAX(created_at) as latest_record
FROM studio_artists;

-- 14. Reset a studio to pending status (if needed)
-- (Uncomment and modify the studio ID as needed)
/*
UPDATE studios 
SET 
    is_verified = false,
    is_featured = false,
    verification_status = 'PENDING',
    verified_at = NULL,
    verified_by = NULL,
    updated_at = NOW()
WHERE id = 1;
*/

-- 15. Verify a studio (if needed)
-- (Uncomment and modify the studio ID as needed)
/*
UPDATE studios 
SET 
    is_verified = true,
    verification_status = 'APPROVED',
    verified_at = NOW(),
    verified_by = 1, -- admin user ID
    updated_at = NOW()
WHERE id = 1;
*/

-- =====================================================
-- Quick Diagnostic Queries
-- =====================================================

-- Quick check: How many studios exist?
SELECT 'Total Studios' as metric, COUNT(*) as value FROM studios
UNION ALL
SELECT 'Active Studios', COUNT(*) FROM studios WHERE is_active = true
UNION ALL
SELECT 'Verified Studios', COUNT(*) FROM studios WHERE is_verified = true
UNION ALL
SELECT 'Featured Studios', COUNT(*) FROM studios WHERE is_featured = true
UNION ALL
SELECT 'Pending Studios', COUNT(*) FROM studios WHERE verification_status = 'PENDING';

-- Quick check: How many users exist?
SELECT 'Total Users' as metric, COUNT(*) as value FROM users
UNION ALL
SELECT 'Admin Users', COUNT(*) FROM users WHERE role = 'ADMIN'
UNION ALL
SELECT 'Artist Users', COUNT(*) FROM users WHERE role = 'ARTIST'
UNION ALL
SELECT 'Client Users', COUNT(*) FROM users WHERE role = 'CLIENT';

-- =====================================================
-- Additional Useful Queries
-- =====================================================

-- Check the exact column names in users table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check the exact column names in studios table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'studios' 
ORDER BY ordinal_position;

-- Check the exact column names in studio_artists table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'studio_artists' 
ORDER BY ordinal_position; 