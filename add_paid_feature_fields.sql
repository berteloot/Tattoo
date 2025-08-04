-- Add fields to support paid featuring functionality
-- Run this in pgAdmin or your PostgreSQL client

-- Add timestamp fields for featuring
ALTER TABLE artist_profiles 
ADD COLUMN IF NOT EXISTS featured_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP,
ADD COLUMN IF NOT EXISTS featured_reason TEXT;

-- Add index for better performance on featured queries
CREATE INDEX IF NOT EXISTS idx_artist_profiles_featured 
ON artist_profiles(isFeatured, featured_until) 
WHERE isFeatured = true;

-- Create feature tiers table for paid features
CREATE TABLE IF NOT EXISTS feature_tiers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  duration_days INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create artist features table for tracking paid features
CREATE TABLE IF NOT EXISTS artist_features (
  id SERIAL PRIMARY KEY,
  artist_id VARCHAR(255) NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  tier_id INTEGER REFERENCES feature_tiers(id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_amount DECIMAL(10,2),
  payment_method VARCHAR(100),
  transaction_id VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_artist_features_artist_id 
ON artist_features(artist_id);

CREATE INDEX IF NOT EXISTS idx_artist_features_dates 
ON artist_features(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_artist_features_payment_status 
ON artist_features(payment_status);

-- Insert some default feature tiers
INSERT INTO feature_tiers (name, duration_days, price, description) VALUES
('Basic Feature', 30, 29.99, '30-day featured placement'),
('Premium Feature', 90, 79.99, '90-day featured placement with priority'),
('Annual Feature', 365, 299.99, 'Full year of featured placement')
ON CONFLICT DO NOTHING;

-- Add a trigger to update featured_at when isFeatured changes
CREATE OR REPLACE FUNCTION update_featured_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.isFeatured = true AND OLD.isFeatured = false THEN
    NEW.featured_at = NOW();
  ELSIF NEW.isFeatured = false AND OLD.isFeatured = true THEN
    NEW.featured_at = NULL;
    NEW.featured_until = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_featured_timestamp ON artist_profiles;
CREATE TRIGGER trigger_update_featured_timestamp
  BEFORE UPDATE ON artist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_featured_timestamp();

-- Add a function to check if featured artists are still valid
CREATE OR REPLACE FUNCTION get_valid_featured_artists()
RETURNS TABLE (
  id VARCHAR(255),
  user_id VARCHAR(255),
  studio_name VARCHAR(255),
  featured_at TIMESTAMP,
  featured_until TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ap.id,
    ap.userId,
    ap.studioName,
    ap.featured_at,
    ap.featured_until
  FROM artist_profiles ap
  WHERE ap.isFeatured = true
    AND (ap.featured_until IS NULL OR ap.featured_until > NOW())
    AND ap.isVerified = true
    AND ap.verificationStatus = 'APPROVED';
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy querying of featured artists
CREATE OR REPLACE VIEW featured_artists_view AS
SELECT 
  ap.id,
  ap.userId,
  u.firstName,
  u.lastName,
  u.email,
  ap.studioName,
  ap.bio,
  ap.city,
  ap.state,
  ap.country,
  ap.latitude,
  ap.longitude,
  ap.isFeatured,
  ap.featured_at,
  ap.featured_until,
  ap.verificationStatus,
  ap.isVerified,
  ap.createdAt,
  ap.updatedAt
FROM artist_profiles ap
JOIN users u ON ap.userId = u.id
WHERE ap.isFeatured = true
  AND (ap.featured_until IS NULL OR ap.featured_until > NOW())
  AND ap.isVerified = true
  AND ap.verificationStatus = 'APPROVED'
  AND u.isActive = true;

-- Add comments for documentation
COMMENT ON TABLE feature_tiers IS 'Defines different tiers of paid featuring options';
COMMENT ON TABLE artist_features IS 'Tracks paid featuring subscriptions for artists';
COMMENT ON COLUMN artist_profiles.featured_at IS 'Timestamp when artist was first featured';
COMMENT ON COLUMN artist_profiles.featured_until IS 'Expiration date for featuring (NULL = permanent)';
COMMENT ON COLUMN artist_profiles.featured_reason IS 'Admin notes for why artist was featured';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT ON featured_artists_view TO your_app_user;
-- GRANT ALL ON feature_tiers TO your_app_user;
-- GRANT ALL ON artist_features TO your_app_user;

-- Verify the changes
SELECT 'Database schema updated successfully for paid featuring functionality' as status; 