-- Check current schema of artist_profiles table
-- This will show all columns and their data types

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'artist_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if the social media columns exist
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'artist_profiles' 
AND table_schema = 'public'
AND column_name IN ('facebook', 'twitter', 'youtube', 'linkedin')
ORDER BY column_name; 