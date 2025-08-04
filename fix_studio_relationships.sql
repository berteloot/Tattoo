-- Quick fix for StudioArtist relationships
-- Run these commands in pgAdmin to enable studio-artist linking

-- Add foreign key constraints
ALTER TABLE studio_artists 
ADD CONSTRAINT fk_studio_artists_studio_id 
FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE;

ALTER TABLE studio_artists 
ADD CONSTRAINT fk_studio_artists_artist_id 
FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE;

-- Verify the constraints were added
SELECT 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS references_table
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'studio_artists' AND tc.constraint_type = 'FOREIGN KEY'; 