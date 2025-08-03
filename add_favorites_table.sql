-- Add Favorites Table for Artist Favoriting Functionality
-- Run this in pgAdmin to enable heart/favorite icons for clients

-- Create the favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL,
    artist_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add foreign key constraints
    CONSTRAINT fk_favorites_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_favorites_artist_id FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE,
    
    -- Ensure unique combination of user and artist
    CONSTRAINT unique_user_artist_favorite UNIQUE (user_id, artist_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_artist_id ON favorites(artist_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at);

-- Add comments for documentation
COMMENT ON TABLE favorites IS 'Stores client favorites for artists - enables heart icon functionality';
COMMENT ON COLUMN favorites.id IS 'Unique identifier for the favorite record';
COMMENT ON COLUMN favorites.user_id IS 'ID of the client who favorited the artist';
COMMENT ON COLUMN favorites.artist_id IS 'ID of the artist being favorited';
COMMENT ON COLUMN favorites.created_at IS 'Timestamp when the artist was favorited';

-- Verify the table was created successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'favorites'
ORDER BY ordinal_position;

-- Show the table structure (run this separately in psql if needed)
-- \d favorites; 