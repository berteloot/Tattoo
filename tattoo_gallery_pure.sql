-- Tattoo Gallery System - Pure SQL Commands
-- Copy and paste ONLY this content into pgAdmin Query Tool

CREATE TABLE IF NOT EXISTS tattoo_gallery (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    artist_id TEXT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    image_public_id TEXT,
    image_width INTEGER,
    image_height INTEGER,
    image_format VARCHAR(10),
    image_bytes INTEGER,
    thumbnail_url TEXT,
    tattoo_style VARCHAR(100),
    body_location VARCHAR(100),
    tattoo_size VARCHAR(50),
    color_type VARCHAR(50),
    session_count INTEGER DEFAULT 1,
    hours_spent INTEGER,
    client_consent BOOLEAN DEFAULT false,
    client_anonymous BOOLEAN DEFAULT true,
    client_age_verified BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false,
    is_before_after BOOLEAN DEFAULT false,
    before_image_url TEXT,
    before_image_public_id TEXT,
    after_image_url TEXT,
    after_image_public_id TEXT,
    tags TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    created_at TIMESTAMP(6) DEFAULT NOW(),
    updated_at TIMESTAMP(6) DEFAULT NOW(),
    completed_at TIMESTAMP(6),
    CONSTRAINT fk_tattoo_gallery_artist 
        FOREIGN KEY (artist_id) 
        REFERENCES artist_profiles(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_artist_id ON tattoo_gallery(artist_id);
CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_style ON tattoo_gallery(tattoo_style);
CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_location ON tattoo_gallery(body_location);
CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_featured ON tattoo_gallery(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_approved ON tattoo_gallery(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_created_at ON tattoo_gallery(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_tags ON tattoo_gallery USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_categories ON tattoo_gallery USING GIN(categories);

CREATE OR REPLACE VIEW public_tattoo_gallery AS
SELECT 
    id,
    artist_id,
    title,
    description,
    image_url,
    thumbnail_url,
    tattoo_style,
    body_location,
    tattoo_size,
    color_type,
    session_count,
    hours_spent,
    is_featured,
    tags,
    categories,
    created_at,
    completed_at
FROM tattoo_gallery 
WHERE is_approved = true 
  AND is_hidden = false 
  AND client_consent = true;

CREATE TABLE IF NOT EXISTS tattoo_gallery_likes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    gallery_item_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP(6) DEFAULT NOW(),
    CONSTRAINT fk_tattoo_gallery_likes_item 
        FOREIGN KEY (gallery_item_id) 
        REFERENCES tattoo_gallery(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_tattoo_gallery_likes_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT unique_gallery_like UNIQUE(gallery_item_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_likes_item ON tattoo_gallery_likes(gallery_item_id);
CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_likes_user ON tattoo_gallery_likes(user_id);

CREATE TABLE IF NOT EXISTS tattoo_gallery_comments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    gallery_item_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMP(6) DEFAULT NOW(),
    updated_at TIMESTAMP(6) DEFAULT NOW(),
    CONSTRAINT fk_tattoo_gallery_comments_item 
        FOREIGN KEY (gallery_item_id) 
        REFERENCES tattoo_gallery(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_tattoo_gallery_comments_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_comments_item ON tattoo_gallery_comments(gallery_item_id);
CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_comments_user ON tattoo_gallery_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_comments_approved ON tattoo_gallery_comments(is_approved) WHERE is_approved = true;

CREATE TABLE IF NOT EXISTS tattoo_gallery_views (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    gallery_item_id TEXT NOT NULL,
    viewer_ip VARCHAR(45),
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP(6) DEFAULT NOW(),
    CONSTRAINT fk_tattoo_gallery_views_item 
        FOREIGN KEY (gallery_item_id) 
        REFERENCES tattoo_gallery(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_views_item ON tattoo_gallery_views(gallery_item_id);
CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_views_date ON tattoo_gallery_views(viewed_at);

CREATE OR REPLACE FUNCTION update_tattoo_gallery_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tattoo_gallery_updated_at
    BEFORE UPDATE ON tattoo_gallery
    FOR EACH ROW
    EXECUTE FUNCTION update_tattoo_gallery_updated_at();

CREATE OR REPLACE FUNCTION get_tattoo_gallery_likes_count(gallery_item_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM tattoo_gallery_likes 
        WHERE gallery_item_id = $1
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_tattoo_gallery_views_count(gallery_item_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM tattoo_gallery_views 
        WHERE gallery_item_id = $1
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_tattoo_gallery_comments_count(gallery_item_id TEXT)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM tattoo_gallery_comments 
        WHERE gallery_item_id = $1 
          AND is_approved = true 
          AND is_hidden = false
    );
END;
$$ LANGUAGE plpgsql;

INSERT INTO specialties (id, name, category, description, "isActive") VALUES
    (gen_random_uuid()::text, 'Traditional American', 'Tattoo Style', 'Classic American traditional tattoos with bold outlines and limited color palette', true),
    (gen_random_uuid()::text, 'Japanese (Irezumi)', 'Tattoo Style', 'Traditional Japanese tattoo art with detailed designs and vibrant colors', true),
    (gen_random_uuid()::text, 'Black & Grey', 'Tattoo Style', 'Monochrome tattoos using only black and grey ink', true),
    (gen_random_uuid()::text, 'Realistic', 'Tattoo Style', 'Photorealistic tattoos that look like photographs', true),
    (gen_random_uuid()::text, 'Neo-Traditional', 'Tattoo Style', 'Modern take on traditional American style with more detail and color', true),
    (gen_random_uuid()::text, 'Watercolor', 'Tattoo Style', 'Soft, painterly style that mimics watercolor paintings', true),
    (gen_random_uuid()::text, 'Geometric', 'Tattoo Style', 'Clean lines and geometric shapes', true),
    (gen_random_uuid()::text, 'Minimalist', 'Tattoo Style', 'Simple, clean designs with minimal detail', true),
    (gen_random_uuid()::text, 'Tribal', 'Tattoo Style', 'Traditional tribal patterns and designs', true),
    (gen_random_uuid()::text, 'New School', 'Tattoo Style', 'Cartoon-like style with bold colors and exaggerated features', true)
ON CONFLICT (name) DO NOTHING;

CREATE OR REPLACE VIEW artist_gallery_stats AS
SELECT 
    artist_id,
    COUNT(*) as total_gallery_items,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_items,
    COUNT(*) FILTER (WHERE is_before_after = true) as before_after_items,
    AVG(hours_spent) as avg_hours_per_piece,
    SUM(hours_spent) as total_hours_worked,
    COUNT(DISTINCT tattoo_style) as unique_styles,
    COUNT(DISTINCT body_location) as unique_locations
FROM tattoo_gallery 
WHERE is_approved = true 
  AND is_hidden = false
GROUP BY artist_id;

SELECT 'Tattoo Gallery System successfully created!' as status; 