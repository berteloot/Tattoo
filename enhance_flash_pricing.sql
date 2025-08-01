-- Enhance Flash Table with Advanced Pricing Structure
-- Run this in pgAdmin to add the new pricing fields

-- Add new columns to the flash table
ALTER TABLE flash ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);
ALTER TABLE flash ADD COLUMN IF NOT EXISTS complexity VARCHAR(20) DEFAULT 'MEDIUM';
ALTER TABLE flash ADD COLUMN IF NOT EXISTS time_estimate INTEGER;
ALTER TABLE flash ADD COLUMN IF NOT EXISTS is_repeatable BOOLEAN DEFAULT true;
ALTER TABLE flash ADD COLUMN IF NOT EXISTS size_pricing JSONB;

-- Create the FlashComplexity enum type
DO $$ BEGIN
    CREATE TYPE "FlashComplexity" AS ENUM ('SIMPLE', 'MEDIUM', 'COMPLEX', 'MASTERPIECE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update the complexity column to use the enum
ALTER TABLE flash ALTER COLUMN complexity TYPE "FlashComplexity" USING complexity::"FlashComplexity";

-- Add constraints
ALTER TABLE flash ADD CONSTRAINT check_complexity CHECK (complexity IN ('SIMPLE', 'MEDIUM', 'COMPLEX', 'MASTERPIECE'));
ALTER TABLE flash ADD CONSTRAINT check_time_estimate CHECK (time_estimate > 0);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flash_complexity ON flash(complexity);
CREATE INDEX IF NOT EXISTS idx_flash_is_repeatable ON flash(is_repeatable);
CREATE INDEX IF NOT EXISTS idx_flash_base_price ON flash(base_price);

-- Update existing flash items with default values
UPDATE flash SET 
    base_price = price,
    complexity = 'MEDIUM',
    time_estimate = 120,
    is_repeatable = true,
    size_pricing = '{
        "small": {"price": 100, "time": 60, "size": "1-2 inches"},
        "medium": {"price": 150, "time": 90, "size": "3-4 inches"},
        "large": {"price": 200, "time": 120, "size": "5-6 inches"},
        "xlarge": {"price": 250, "time": 150, "size": "7+ inches"}
    }'::jsonb
WHERE base_price IS NULL;

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