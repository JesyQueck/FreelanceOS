-- TEST USERNAME LOOKUP - Debug 406 error
-- This script tests if the users table and username column exist and work properly

-- Check if users table exists and has username column
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
AND column_name = 'username';

-- Test a simple username lookup query
SELECT id, username, display_name 
FROM public.users 
WHERE username = 'timputt1'
LIMIT 1;

-- Check if there are any users with usernames
SELECT COUNT(*) as user_count_with_usernames
FROM public.users 
WHERE username IS NOT NULL 
AND username != '';

-- Show sample users with usernames
SELECT id, username, display_name, email
FROM public.users 
WHERE username IS NOT NULL 
AND username != ''
LIMIT 5;
