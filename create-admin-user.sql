-- =====================================================
-- Create Admin User in Database
-- =====================================================

-- First, let's check what users already exist
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "isActive",
    "createdAt"
FROM users
ORDER BY "createdAt" DESC;

-- Check if there are any admin users
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "isActive"
FROM users
WHERE role = 'ADMIN';

-- Create a new admin user with properly hashed password
-- The password 'admin123' hashed with bcrypt (cost 10)
INSERT INTO users (
    id,
    email,
    password,
    "firstName",
    "lastName",
    role,
    "isActive",
    "isVerified",
    "emailVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    'admin@tattooed-world.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
    'Admin',
    'User',
    'ADMIN',
    true,
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Alternative admin user with different email
INSERT INTO users (
    id,
    email,
    password,
    "firstName",
    "lastName",
    role,
    "isActive",
    "isVerified",
    "emailVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid(),
    'admin@example.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: admin123
    'Admin',
    'User',
    'ADMIN',
    true,
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verify the admin user was created
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "isActive",
    "isVerified",
    "createdAt"
FROM users
WHERE role = 'ADMIN'
ORDER BY "createdAt" DESC;

-- Show all users after creation
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "isActive",
    "isVerified",
    "createdAt"
FROM users
ORDER BY "createdAt" DESC; 