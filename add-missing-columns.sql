-- ADD MISSING COLUMNS TO DATABASE TABLES
-- This script adds the columns that are referenced in the code but missing from the database

-- 1. Add status column to services table
ALTER TABLE public.services 
ADD COLUMN status VARCHAR(20) DEFAULT 'active' NOT NULL;

-- 2. Add timeline column to services table
ALTER TABLE public.services 
ADD COLUMN timeline VARCHAR(100);

-- 2. Add availability column to freelancer_profiles table
ALTER TABLE public.freelancer_profiles 
ADD COLUMN availability VARCHAR(20) DEFAULT 'available';

-- 3. Add experience_level column to freelancer_profiles table
ALTER TABLE public.freelancer_profiles 
ADD COLUMN experience_level VARCHAR(20) DEFAULT 'beginner';

-- 4. Verify the columns were added successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('services', 'freelancer_profiles') 
AND table_schema = 'public'
AND column_name IN ('status', 'timeline', 'availability', 'experience_level')
ORDER BY table_name, ordinal_position;

-- 5. Add comments to document the columns
COMMENT ON COLUMN public.services.status IS 'Service status: active or draft';
COMMENT ON COLUMN public.services.timeline IS 'Service timeline: e.g., 2-3 weeks, 1 month, etc.';
COMMENT ON COLUMN public.freelancer_profiles.availability IS 'Freelancer availability status: available, busy, etc.';
COMMENT ON COLUMN public.freelancer_profiles.experience_level IS 'Freelancer experience level: beginner, intermediate, expert, etc.';

DO $$
BEGIN
    RAISE NOTICE 'Missing columns added successfully!';
    RAISE NOTICE '✅ Added status column to services table';
    RAISE NOTICE '✅ Added timeline column to services table';
    RAISE NOTICE '✅ Added availability column to freelancer_profiles table';
    RAISE NOTICE '✅ Added experience_level column to freelancer_profiles table';
    RAISE NOTICE '✅ Added column comments for documentation';
END $$;
