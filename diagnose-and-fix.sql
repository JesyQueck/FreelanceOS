-- DIAGNOSTIC SCRIPT - Check current state and fix issues step by step

-- First, let's see what's in the users table
SELECT 'Users table count:', COUNT(*) FROM public.users;
SELECT 'Users with roles:', id, email, role FROM public.users WHERE role IS NOT NULL LIMIT 5;

-- Check what's in the clients table
SELECT 'Clients table count:', COUNT(*) FROM public.clients;
SELECT 'Sample clients:', id, user_id, full_name FROM public.clients LIMIT 3;

-- Check if there are any users that should have client role but don't
SELECT 'Users in clients but no role:', u.id, u.email FROM public.users u 
INNER JOIN public.clients c ON u.id = c.user_id 
WHERE u.role IS NULL LIMIT 3;

-- Now, let's fix this step by step

-- STEP 1: Add role column if not exists (safe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' 
        AND column_name='role'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN role TEXT CHECK (role IN ('freelancer', 'client'));
        RAISE NOTICE 'Added role column to users table';
    ELSE
        RAISE NOTICE 'Role column already exists in users table';
    END IF;
END $$;

-- STEP 2: Update users with client role (only those that actually exist in clients)
UPDATE public.users 
SET role = 'client' 
WHERE id IN (SELECT user_id FROM public.clients WHERE user_id IS NOT NULL)
AND role IS NULL;

-- STEP 3: Set remaining users to freelancer role
UPDATE public.users 
SET role = 'freelancer' 
WHERE role IS NULL;

-- STEP 4: Create client_profiles table (if not exists)
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  company TEXT,
  industry TEXT,
  project_preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- STEP 5: Migrate client profiles (only for valid user_ids)
INSERT INTO public.client_profiles (user_id, company, created_at)
SELECT 
    c.user_id,
    c.company,
    c.created_at
FROM public.clients c
WHERE c.user_id IS NOT NULL
AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = c.user_id)
AND NOT EXISTS (SELECT 1 FROM public.client_profiles cp WHERE cp.user_id = c.user_id);

-- STEP 6: Verify the migration
SELECT 'Migration complete - client profiles created:', COUNT(*) FROM public.client_profiles;

DO $$
BEGIN
    RAISE NOTICE 'Diagnosis and fix completed successfully!';
END $$;
