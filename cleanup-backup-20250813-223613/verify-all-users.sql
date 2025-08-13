-- SQL to mark all users as verified
-- This will disable email verification for all existing users

UPDATE users 
SET 
    "emailVerified" = true,
    "isActive" = true,
    "emailVerificationToken" = NULL,
    "emailVerificationExpiry" = NULL
WHERE "emailVerified" = false OR "emailVerificationToken" IS NOT NULL;

-- Verify the changes
SELECT 
    id,
    email,
    "firstName",
    "lastName",
    role,
    "emailVerified",
    "isActive",
    "emailVerificationToken",
    "emailVerificationExpiry"
FROM users
ORDER BY "createdAt" DESC; 