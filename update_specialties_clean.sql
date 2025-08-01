-- Update Specialties Table with Detailed Tattoo Styles
-- Run this in pgAdmin to replace existing specialties with the new comprehensive list

-- First, add the category column if it doesn't exist
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS category VARCHAR(255);

-- Remove the icon column if it exists (no longer needed)
ALTER TABLE specialties DROP COLUMN IF EXISTS icon;

-- Clear existing specialties
DELETE FROM specialties;

-- Insert new comprehensive specialty list organized by categories

-- 1. Traditional & Regional
INSERT INTO specialties (id, name, category, description, "isActive", "createdAt", "updatedAt") VALUES
('spec_trad_001', 'American Traditional', 'Traditional & Regional', 'Classic American traditional tattoos with bold outlines and limited color palette', true, NOW(), NOW()),
('spec_trad_002', 'Neo-Traditional', 'Traditional & Regional', 'Modern take on traditional style with more colors and detailed shading', true, NOW(), NOW()),
('spec_trad_003', 'Japanese Traditional (Irezumi / Tebori)', 'Traditional & Regional', 'Traditional Japanese tattooing with hand-carved tools and cultural motifs', true, NOW(), NOW()),
('spec_trad_004', 'Tribal (Polynesian, Maori, Borneo)', 'Traditional & Regional', 'Indigenous tribal designs from Pacific and Southeast Asian cultures', true, NOW(), NOW()),
('spec_trad_005', 'Thai Sak Yant', 'Traditional & Regional', 'Traditional Thai sacred tattoos with Buddhist and animist symbols', true, NOW(), NOW()),
('spec_trad_006', 'Inuit Kakiniit', 'Traditional & Regional', 'Traditional Inuit facial and body markings', true, NOW(), NOW()),
('spec_trad_007', 'Chicano', 'Traditional & Regional', 'Mexican-American prison and street culture tattoo style', true, NOW(), NOW()),
('spec_trad_008', 'Russian Criminal', 'Traditional & Regional', 'Traditional Russian prison and criminal tattoo culture', true, NOW(), NOW());

-- 2. Blackwork & Line-Based
INSERT INTO specialties (id, name, category, description, "isActive", "createdAt", "updatedAt") VALUES
('spec_black_001', 'Blackwork', 'Blackwork & Line-Based', 'Bold black designs with solid fills and strong contrast', true, NOW(), NOW()),
('spec_black_002', 'Dotwork', 'Blackwork & Line-Based', 'Tattoos created entirely with dots for shading and texture', true, NOW(), NOW()),
('spec_black_003', 'Geometric', 'Blackwork & Line-Based', 'Precise geometric shapes and patterns', true, NOW(), NOW()),
('spec_black_004', 'Ornamental (Mandalas, Lace)', 'Blackwork & Line-Based', 'Intricate ornamental designs including mandalas and lace patterns', true, NOW(), NOW()),
('spec_black_005', 'Fine Line', 'Blackwork & Line-Based', 'Delicate, thin line work with minimal shading', true, NOW(), NOW()),
('spec_black_006', 'Single Needle', 'Blackwork & Line-Based', 'Ultra-fine line work using single needle technique', true, NOW(), NOW()),
('spec_black_007', 'Stick and Poke', 'Blackwork & Line-Based', 'Hand-poked tattoos using manual technique', true, NOW(), NOW());

-- 3. Realism & Detail-Oriented
INSERT INTO specialties (id, name, category, description, "isActive", "createdAt", "updatedAt") VALUES
('spec_real_001', 'Realism', 'Realism & Detail-Oriented', 'Photorealistic tattoos that look like photographs', true, NOW(), NOW()),
('spec_real_002', 'Portraiture', 'Realism & Detail-Oriented', 'Realistic portraits of people and faces', true, NOW(), NOW()),
('spec_real_003', 'Microrealism', 'Realism & Detail-Oriented', 'Extremely detailed small-scale realistic tattoos', true, NOW(), NOW()),
('spec_real_004', 'Black and Grey', 'Realism & Detail-Oriented', 'Realistic tattoos using only black and grey ink', true, NOW(), NOW()),
('spec_real_005', 'Hyperrealism', 'Realism & Detail-Oriented', 'Ultra-detailed realistic tattoos with extreme attention to detail', true, NOW(), NOW()),
('spec_real_006', 'Sculptural / Embossed', 'Realism & Detail-Oriented', 'Tattoos that create 3D sculptural or embossed effects', true, NOW(), NOW());

-- 4. Color & Painterly
INSERT INTO specialties (id, name, category, description, "isActive", "createdAt", "updatedAt") VALUES
('spec_color_001', 'Watercolor', 'Color & Painterly', 'Soft, flowing designs that mimic watercolor paintings', true, NOW(), NOW()),
('spec_color_002', 'New School', 'Color & Painterly', 'Modern, cartoon-like style with bright colors and exaggerated features', true, NOW(), NOW()),
('spec_color_003', 'Pop Art / Comic', 'Color & Painterly', 'Pop art and comic book inspired designs', true, NOW(), NOW()),
('spec_color_004', 'Embroidery / Patch / Sticker', 'Color & Painterly', 'Tattoos that mimic embroidered patches or stickers', true, NOW(), NOW()),
('spec_color_005', 'Mambo (Destrutturato)', 'Color & Painterly', 'Italian style with bold colors and abstract elements', true, NOW(), NOW());

-- 5. Abstract & Experimental
INSERT INTO specialties (id, name, category, description, "isActive", "createdAt", "updatedAt") VALUES
('spec_abst_001', 'Abstract', 'Abstract & Experimental', 'Non-representational designs and patterns', true, NOW(), NOW()),
('spec_abst_002', 'Trash Polka', 'Abstract & Experimental', 'Bold black and red designs with chaotic, abstract elements', true, NOW(), NOW()),
('spec_abst_003', 'Ignorant / Naïve', 'Abstract & Experimental', 'Deliberately crude, childlike drawing style', true, NOW(), NOW()),
('spec_abst_004', 'Cyber Sigilism', 'Abstract & Experimental', 'Futuristic sigil designs with cyberpunk aesthetics', true, NOW(), NOW()),
('spec_abst_005', 'Glitch / Pixel', 'Abstract & Experimental', 'Digital glitch and pixel art inspired designs', true, NOW(), NOW());

-- 6. Cultural / Spiritual
INSERT INTO specialties (id, name, category, description, "isActive", "createdAt", "updatedAt") VALUES
('spec_cult_001', 'Samoan / Hawaiian', 'Cultural / Spiritual', 'Traditional Polynesian tribal designs', true, NOW(), NOW()),
('spec_cult_002', 'Inuit', 'Cultural / Spiritual', 'Traditional Inuit cultural markings and symbols', true, NOW(), NOW()),
('spec_cult_003', 'Religious / Spiritual symbols', 'Cultural / Spiritual', 'Religious and spiritual symbols from various traditions', true, NOW(), NOW()),
('spec_cult_004', 'Celtic / Norse', 'Cultural / Spiritual', 'Traditional Celtic and Norse cultural symbols and designs', true, NOW(), NOW());

-- 7. Typography & Lettering
INSERT INTO specialties (id, name, category, description, "isActive", "createdAt", "updatedAt") VALUES
('spec_type_001', 'Script / Calligraphy', 'Typography & Lettering', 'Elegant script and calligraphic lettering', true, NOW(), NOW()),
('spec_type_002', 'Gothic / Blackletter', 'Typography & Lettering', 'Gothic and blackletter style typography', true, NOW(), NOW()),
('spec_type_003', 'Graffiti', 'Typography & Lettering', 'Graffiti-style lettering and urban art', true, NOW(), NOW());

-- 8. Digital & Tech-Inspired
INSERT INTO specialties (id, name, category, description, "isActive", "createdAt", "updatedAt") VALUES
('spec_digi_001', 'UV / Blacklight', 'Digital & Tech-Inspired', 'Tattoos that glow under blacklight', true, NOW(), NOW()),
('spec_digi_002', '3D / Optical Illusion', 'Digital & Tech-Inspired', 'Three-dimensional and optical illusion effects', true, NOW(), NOW()),
('spec_digi_003', 'Bio-Mechanical', 'Digital & Tech-Inspired', 'Fusion of organic and mechanical elements', true, NOW(), NOW()),
('spec_digi_004', 'Cyberpunk / Cyber-Sigilism', 'Digital & Tech-Inspired', 'Futuristic cyberpunk and digital sigil designs', true, NOW(), NOW());

-- Verify the data was inserted correctly
SELECT category, COUNT(*) as count FROM specialties GROUP BY category ORDER BY category;

-- Show all specialties organized by category
SELECT category, name, description FROM specialties ORDER BY category, name; 