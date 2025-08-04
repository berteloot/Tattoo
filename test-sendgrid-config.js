-- View for studios with artist count
CREATE VIEW studios_with_artist_count AS
SELECT 
    s.*,
    COUNT(sa.artist_id) as artist_count,
    COUNT(CASE WHEN sa.role = 'OWNER' THEN 1 END) as owner_count
FROM studios s
LEFT JOIN studio_artists sa ON s.id = sa.studio_id AND sa.is_active = true
GROUP BY s.id;

-- View for artists with their studios
CREATE VIEW artists_with_studios AS
SELECT 
    ap.*,
    u.first_name,
    u.last_name,
    u.email,
    s.title as studio_title,
    s.id as studio_id,
    sa.role as studio_role
FROM artist_profiles ap
JOIN users u ON ap.user_id = u.id
LEFT JOIN studio_artists sa ON ap.id = sa.artist_id AND sa.is_active = true
LEFT JOIN studios s ON sa.studio_id = s.id; 