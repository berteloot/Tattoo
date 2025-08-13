-- =====================================================
-- Fix Database Trigger Issues for Geocoding
-- =====================================================
-- This script fixes the problematic database triggers
-- that are causing geocoding failures
-- =====================================================

-- Start transaction for safety
BEGIN;

-- 1. Check what triggers exist on the studios table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'studios';

-- 2. Check if there's a problematic update_updated_at_column function
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'update_updated_at_column';

-- 3. Disable problematic triggers temporarily
-- (Uncomment these lines if you want to disable triggers)
/*
DO $$
BEGIN
    -- Disable all triggers on studios table
    ALTER TABLE studios DISABLE TRIGGER ALL;
    
    RAISE NOTICE 'All triggers disabled on studios table';
END $$;
*/

-- 4. Alternative: Drop the problematic trigger function
-- (Uncomment these lines if you want to remove the problematic function)
/*
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
RAISE NOTICE 'Dropped problematic trigger function';
*/

-- 5. Test a simple update to see if triggers are working
UPDATE studios 
SET latitude = 51.5074, longitude = -0.1278, updated_at = NOW()
WHERE id = (SELECT id FROM studios LIMIT 1);

-- 6. Check the result
SELECT 
    id, 
    title, 
    latitude, 
    longitude, 
    updated_at
FROM studios 
WHERE latitude = 51.5074 AND longitude = -0.1278;

-- 7. Rollback the test update
ROLLBACK;

-- =====================================================
-- Manual Fix: Update studios without triggers
-- =====================================================
-- If triggers continue to cause issues, use this approach:

/*
-- Disable triggers temporarily
ALTER TABLE studios DISABLE TRIGGER ALL;

-- Update coordinates
UPDATE studios 
SET 
    latitude = 51.5074, 
    longitude = -0.1278, 
    updated_at = NOW()
WHERE id = 'your-studio-id';

-- Re-enable triggers
ALTER TABLE studios ENABLE TRIGGER ALL;
*/

-- =====================================================
-- Verify the fix
-- =====================================================
-- Check if the studios table has the correct structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'studios' 
AND column_name IN ('latitude', 'longitude', 'updated_at')
ORDER BY column_name;

-- Check if there are any active triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'studios'
AND trigger_name IS NOT NULL;

COMMIT;
