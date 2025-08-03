-- Add Sample Favorites Data for Testing
-- Run this after creating the favorites table to test the functionality

-- First, let's see what users and artists we have
SELECT 'Users:' as info;
SELECT id, email, "firstName", "lastName", role FROM users LIMIT 5;

SELECT 'Artists:' as info;
SELECT ap.id, u."firstName", u."lastName", ap."studioName" 
FROM artist_profiles ap 
JOIN users u ON ap."userId" = u.id 
LIMIT 5;

-- Add sample favorites (replace the IDs with actual IDs from your database)
-- Get a client user ID
DO $$
DECLARE
    client_id TEXT;
    artist_id TEXT;
BEGIN
    -- Get a client user
    SELECT id INTO client_id FROM users WHERE role = 'CLIENT' LIMIT 1;
    
    -- Get an artist profile
    SELECT ap.id INTO artist_id 
    FROM artist_profiles ap 
    JOIN users u ON ap."userId" = u.id 
    WHERE u.role = 'ARTIST' 
    LIMIT 1;
    
    -- Insert sample favorite if we found both
    IF client_id IS NOT NULL AND artist_id IS NOT NULL THEN
        INSERT INTO favorites (user_id, artist_id) 
        VALUES (client_id, artist_id)
        ON CONFLICT (user_id, artist_id) DO NOTHING;
        
        RAISE NOTICE 'Added sample favorite: Client % favorited Artist %', client_id, artist_id;
    ELSE
        RAISE NOTICE 'Could not find client or artist for sample data';
    END IF;
END $$;

-- Show the favorites we created
SELECT 
    f.id,
    u."firstName" || ' ' || u."lastName" as client_name,
    u.email as client_email,
    artist_user."firstName" || ' ' || artist_user."lastName" as artist_name,
    ap."studioName" as studio,
    f.created_at
FROM favorites f
JOIN users u ON f.user_id = u.id
JOIN artist_profiles ap ON f.artist_id = ap.id
JOIN users artist_user ON ap."userId" = artist_user.id;

-- Count total favorites
SELECT COUNT(*) as total_favorites FROM favorites; 