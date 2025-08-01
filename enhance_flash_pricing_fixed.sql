-- Enhance Flash Table with Advanced Pricing Structure
-- Run this in pgAdmin to add the new pricing fields

-- Add new columns to the flash table
ALTER TABLE flash ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);
ALTER TABLE flash ADD COLUMN IF NOT EXISTS complexity VARCHAR(20);
ALTER TABLE flash ADD COLUMN IF NOT EXISTS time_estimate INTEGER;
ALTER TABLE flash ADD COLUMN IF NOT EXISTS is_repeatable BOOLEAN DEFAULT true;
ALTER TABLE flash ADD COLUMN IF NOT EXISTS size_pricing JSONB;

-- Create the FlashComplexity enum type
DO $$ BEGIN
    CREATE TYPE "FlashComplexity" AS ENUM ('SIMPLE', 'MEDIUM', 'COMPLEX', 'MASTERPIECE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Set default values for existing records
UPDATE flash SET 
    complexity = 'MEDIUM',
    time_estimate = 120,
    is_repeatable = true,
    size_pricing = '{
        "small": {"price": 100, "time": 60, "size": "1-2 inches"},
        "medium": {"price": 150, "time": 90, "size": "3-4 inches"},
        "large": {"price": 200, "time": 120, "size": "5-6 inches"},
        "xlarge": {"price": 250, "time": 150, "size": "7+ inches"}
    }'::jsonb
WHERE complexity IS NULL;

-- Now convert the complexity column to use the enum
ALTER TABLE flash ALTER COLUMN complexity TYPE "FlashComplexity" USING complexity::"FlashComplexity";

-- Set default value for new records
ALTER TABLE flash ALTER COLUMN complexity SET DEFAULT 'MEDIUM';

-- Add constraints
ALTER TABLE flash ADD CONSTRAINT check_time_estimate CHECK (time_estimate > 0);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flash_complexity ON flash(complexity);
CREATE INDEX IF NOT EXISTS idx_flash_is_repeatable ON flash(is_repeatable);
CREATE INDEX IF NOT EXISTS idx_flash_base_price ON flash(base_price);

-- Update base_price from existing price field
UPDATE flash SET base_price = price WHERE base_price IS NULL;

-- Verify the changes
SELECT 
    id, 
    title, 
    base_price, 
    complexity, 
    time_estimate, 
    is_repeatable,
    size_pricing
FROM flash 
LIMIT 5;

-- Show the table structure (pgAdmin compatible)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'flash' 
ORDER BY ordinal_position; 