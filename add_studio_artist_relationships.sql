-- Add StudioArtist relationships to Studio and ArtistProfile tables
-- Run these commands in pgAdmin to fix the missing relationships

-- 1. First, let's check the current structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('studios', 'artist_profiles', 'studio_artists')
ORDER BY table_name, ordinal_position;

-- 2. Add foreign key constraint for studio_artists.studio_id -> studios.id
ALTER TABLE studio_artists 
ADD CONSTRAINT fk_studio_artists_studio_id 
FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE;

-- 3. Add foreign key constraint for studio_artists.artist_id -> artist_profiles.id
ALTER TABLE studio_artists 
ADD CONSTRAINT fk_studio_artists_artist_id 
FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE;

-- 4. Verify the constraints were added
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
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'studio_artists' 
    AND tc.constraint_type = 'FOREIGN KEY';

-- 5. Test the relationships by checking if there are any existing studio_artists records
SELECT 
    sa.id,
    sa.studio_id,
    sa.artist_id,
    sa.role,
    sa.is_active,
    s.title as studio_title,
    ap.id as artist_profile_id,
    u.first_name,
    u.last_name
FROM studio_artists sa
LEFT JOIN studios s ON sa.studio_id = s.id
LEFT JOIN artist_profiles ap ON sa.artist_id = ap.id
LEFT JOIN users u ON ap.user_id = u.id
LIMIT 10;

-- 6. If you want to add some test data (optional)
-- First, get some existing studios and artists
SELECT 'Available Studios:' as info;
SELECT id, title FROM studios LIMIT 5;

SELECT 'Available Artist Profiles:' as info;
SELECT ap.id, u.first_name, u.last_name 
FROM artist_profiles ap 
JOIN users u ON ap.user_id = u.id 
LIMIT 5;

-- 7. Insert test studio-artist relationships (replace with actual IDs from step 6)
-- Example (uncomment and modify with actual IDs):
/*
INSERT INTO studio_artists (studio_id, artist_id, role, is_active, joined_at)
VALUES 
    ('studio_id_here', 'artist_profile_id_here', 'ARTIST', true, NOW()),
    ('another_studio_id', 'another_artist_id', 'OWNER', true, NOW());
*/

-- 8. Verify the test data
SELECT 
    sa.id,
    s.title as studio_name,
    u.first_name || ' ' || u.last_name as artist_name,
    sa.role,
    sa.joined_at
FROM studio_artists sa
JOIN studios s ON sa.studio_id = s.id
JOIN artist_profiles ap ON sa.artist_id = ap.id
JOIN users u ON ap.user_id = u.id
WHERE sa.is_active = true
ORDER BY sa.joined_at DESC; 