-- Database cleanup script - remove unused tables and columns
-- This script removes tables and columns that are not referenced in the code

-- WARNING: This will permanently delete data!
-- Make sure to backup your database before running this script

-- Step 1: Remove unused tables
-- notifications table is not referenced anywhere in the code
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Step 2: Remove unused columns from existing tables

-- Remove unused columns from users table
-- Based on code analysis, these fields are never used:
-- - name (not used, only display_name is used)
-- - email (not used in users table, only in auth.users)
-- - skills (not used in current code)
DO $$
BEGIN
    -- Check if column exists before dropping
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='users' 
               AND column_name='name'
               AND table_schema='public') THEN
        ALTER TABLE public.users DROP COLUMN name;
        RAISE NOTICE 'Dropped unused column: users.name';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='users' 
               AND column_name='email'
               AND table_schema='public') THEN
        ALTER TABLE public.users DROP COLUMN email;
        RAISE NOTICE 'Dropped unused column: users.email';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='users' 
               AND column_name='skills'
               AND table_schema='public') THEN
        ALTER TABLE public.users DROP COLUMN skills;
        RAISE NOTICE 'Dropped unused column: users.skills';
    END IF;
END $$;

-- Step 3: Remove unused columns from services table
-- Based on code analysis, these fields are never used:
-- - delivery_time (not used in current code)
-- - timeline (not used in current code)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='services' 
               AND column_name='delivery_time'
               AND table_schema='public') THEN
        ALTER TABLE public.services DROP COLUMN delivery_time;
        RAISE NOTICE 'Dropped unused column: services.delivery_time';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='services' 
               AND column_name='timeline'
               AND table_schema='public') THEN
        ALTER TABLE public.services DROP COLUMN timeline;
        RAISE NOTICE 'Dropped unused column: services.timeline';
    END IF;
END $$;

-- Step 4: Remove unused columns from conversations table
-- Based on code analysis, these fields are never used:
-- - status (not used in current code)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='conversations' 
               AND column_name='status'
               AND table_schema='public') THEN
        ALTER TABLE public.conversations DROP COLUMN status;
        RAISE NOTICE 'Dropped unused column: conversations.status';
    END IF;
END $$;

-- Step 5: Clean up indexes for dropped columns
DROP INDEX IF EXISTS idx_conversations_status;

-- Step 6: Update RLS policies to remove references to dropped columns
-- Drop and recreate policies without the unused columns

-- Users table policies (only reference used columns)
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

CREATE POLICY "Users can view own data" ON public.users
FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON public.users
FOR UPDATE USING (auth.uid()::text = id::text);

-- Step 7: Note about optimization
-- Note: VACUUM ANALYZE should be run separately after this script
-- as it cannot run inside a transaction block

DO $$
BEGIN
    RAISE NOTICE 'Database cleanup completed successfully!';
    RAISE NOTICE 'Removed: notifications table';
    RAISE NOTICE 'Removed unused columns: users.name, users.email, users.skills';
    RAISE NOTICE 'Removed unused columns: services.delivery_time, services.timeline';
    RAISE NOTICE 'Removed unused columns: conversations.status';
    RAISE NOTICE 'Run VACUUM ANALYZE separately to optimize the database';
END $$;
