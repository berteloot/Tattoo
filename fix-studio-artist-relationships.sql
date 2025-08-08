-- Safe SQL to fix StudioArtist relationships without affecting existing functionality
-- This script only adds foreign key constraints and doesn't modify existing data

-- First, let's check if the constraints already exist to avoid errors
DO $$
BEGIN
    -- Add foreign key constraint for studio_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'studio_artists_studio_id_fkey' 
        AND table_name = 'studio_artists'
    ) THEN
        ALTER TABLE studio_artists 
        ADD CONSTRAINT studio_artists_studio_id_fkey 
        FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint: studio_artists_studio_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint studio_artists_studio_id_fkey already exists';
    END IF;

    -- Add foreign key constraint for artist_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'studio_artists_artist_id_fkey' 
        AND table_name = 'studio_artists'
    ) THEN
        ALTER TABLE studio_artists 
        ADD CONSTRAINT studio_artists_artist_id_fkey 
        FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint: studio_artists_artist_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint studio_artists_artist_id_fkey already exists';
    END IF;

END $$;

-- Verify the constraints were added successfully
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'studio_artists'
ORDER BY tc.constraint_name;

-- Test the studio artists endpoint by checking if we can query the relationships
SELECT 
    sa.id,
    sa.studio_id,
    sa.artist_id,
    s.title as studio_title,
    ap.id as artist_profile_id,
    u.first_name,
    u.last_name
FROM studio_artists sa
LEFT JOIN studios s ON sa.studio_id = s.id
LEFT JOIN artist_profiles ap ON sa.artist_id = ap.id
LEFT JOIN users u ON ap.user_id = u.id
WHERE sa.is_active = true
LIMIT 5;

-- Show summary of what was fixed
SELECT 
    'Studio Artists Relationships Fixed' as status,
    COUNT(*) as total_studio_artists,
    COUNT(DISTINCT studio_id) as unique_studios,
    COUNT(DISTINCT artist_id) as unique_artists
FROM studio_artists 
WHERE is_active = true;
