-- MINIMAL FIX FOR USER MIGRATION ISSUE
-- This script specifically fixes the foreign key constraint violation

-- The issue: User exists in clients table but not in users table
-- Solution: Ensure user exists in users table before creating client_profiles

-- Step 1: Add missing users from clients table to users table
INSERT INTO public.users (id, email, role, display_name, created_at)
SELECT 
    c.user_id,
    COALESCE(c.email, ''),
    'client',
    COALESCE(c.full_name, ''),
    c.created_at
FROM public.clients c
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = c.user_id
)
AND c.user_id IS NOT NULL;

-- Step 2: Now safely create client_profiles (this will work because users now exist)
INSERT INTO public.client_profiles (user_id, company, created_at)
SELECT 
    c.user_id,
    c.company,
    c.created_at
FROM public.clients c
WHERE c.user_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM public.client_profiles cp WHERE cp.user_id = c.user_id
);

-- Step 3: Verify the fix
SELECT 'Users added:', COUNT(*) FROM public.users WHERE role = 'client' AND id IN (SELECT user_id FROM public.clients WHERE user_id IS NOT NULL);
SELECT 'Client profiles created:', COUNT(*) FROM public.client_profiles;

-- This should resolve the foreign key constraint issue
-- Now you can run the main safe-refactor-final.sql script
