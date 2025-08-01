-- Fix production database by adding missing calendlyUrl column
-- This script should be run on the production database

-- Add calendlyUrl column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'artist_profiles' 
        AND column_name = 'calendlyUrl'
    ) THEN
        ALTER TABLE "artist_profiles" ADD COLUMN "calendlyUrl" TEXT;
        RAISE NOTICE 'Added calendlyUrl column to artist_profiles table';
    ELSE
        RAISE NOTICE 'calendlyUrl column already exists in artist_profiles table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'artist_profiles' 
AND column_name = 'calendlyUrl'; 