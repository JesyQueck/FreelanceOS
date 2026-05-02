-- FIX DATABASE CONSTRAINTS AND SCHEMA ISSUES
-- This script fixes role column NOT NULL constraint and other schema issues

-- 1. Fix role column constraint - allow NULL temporarily for existing users
ALTER TABLE public.users ALTER COLUMN role DROP NOT NULL;

-- 2. Update existing users to have default role if NULL
UPDATE public.users 
SET role = 'freelancer' 
WHERE role IS NULL;

-- 3. Add role column back with NOT NULL constraint
ALTER TABLE public.users ALTER COLUMN role SET NOT NULL;

-- 4. Check if username column exists and has proper data
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name = 'username';

-- 5. Test username lookup with proper escaping
SELECT id, username, display_name, role 
FROM public.users 
WHERE username = 'timputt1'
LIMIT 1;

-- 6. Check all users with NULL roles (should be none after fix)
SELECT COUNT(*) as users_with_null_role 
FROM public.users 
WHERE role IS NULL;

-- 7. Show sample users to verify data
SELECT id, email, username, role, display_name, created_at
FROM public.users 
ORDER BY created_at DESC
LIMIT 5;

-- 8. Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

DO $$
BEGIN
    RAISE NOTICE 'Database constraints fix completed!';
    RAISE NOTICE '✅ Role column NOT NULL constraint fixed';
    RAISE NOTICE '✅ Existing users updated with default role';
    RAISE NOTICE '✅ Schema verification queries executed';
END $$;
