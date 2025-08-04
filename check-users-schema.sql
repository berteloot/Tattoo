-- =====================================================
-- Check Users Table Schema
-- =====================================================

-- Check the exact column names in users table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check if there are any users at all
SELECT COUNT(*) as total_users FROM users;

-- Show a sample user (if any exist)
SELECT * FROM users LIMIT 1; 