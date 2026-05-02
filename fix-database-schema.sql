-- Fix database schema issues for messaging functionality
-- This script fixes missing relationships and column issues

-- 1. Add email column back to users table (it was removed but is still needed)
DO $$
BEGIN
    -- Check if email column exists in users table
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'email'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users ADD COLUMN email TEXT;
        RAISE NOTICE 'Added email column to users table';
    ELSE
        RAISE NOTICE 'Email column already exists in users table';
    END IF;
END $$;

-- 2. Fix conversations table relationships
-- Drop existing foreign key constraints if they exist
DO $$
BEGIN
    -- Drop foreign key constraints if they exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversations_freelancer_id_fkey' 
        AND table_name = 'conversations'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.conversations DROP CONSTRAINT conversations_freelancer_id_fkey;
        RAISE NOTICE 'Dropped existing freelancer_id foreign key';
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversations_client_id_fkey' 
        AND table_name = 'conversations'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.conversations DROP CONSTRAINT conversations_client_id_fkey;
        RAISE NOTICE 'Dropped existing client_id foreign key';
    END IF;
END $$;

-- 3. Fix data type issues and add proper foreign key constraints
-- First, check the data types in the conversations table
DO $$
DECLARE
    invalid_count INTEGER;
BEGIN
    -- Check if client_id is text and needs to be converted to UUID
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'conversations' 
        AND column_name = 'client_id'
        AND data_type = 'text'
        AND table_schema = 'public'
    ) THEN
        -- Create a temporary UUID column
        ALTER TABLE public.conversations ADD COLUMN client_id_uuid UUID;
        
        -- Update the new column with converted UUID values for valid UUIDs
        UPDATE public.conversations 
        SET client_id_uuid = client_id::UUID 
        WHERE client_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
        
        -- Handle cases where client_id might be a user_id that needs to be mapped to client_id
        UPDATE public.conversations 
        SET client_id_uuid = (SELECT id FROM public.clients WHERE user_id::text = client_id::text)
        WHERE client_id_uuid IS NULL 
        AND client_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        AND EXISTS (SELECT 1 FROM public.clients WHERE user_id::text = client_id::text);
        
        -- Log any records that couldn't be converted
        SELECT COUNT(*) INTO invalid_count 
        FROM public.conversations 
        WHERE client_id_uuid IS NULL;
        
        IF invalid_count > 0 THEN
            RAISE NOTICE 'Found % conversations with invalid client_id that could not be converted', invalid_count;
        END IF;
        
        -- Drop RLS policies that depend on client_id column
        DROP POLICY IF EXISTS "Users can view conversations" ON public.conversations;
        DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
        DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
        
        -- Drop the old text column
        ALTER TABLE public.conversations DROP COLUMN client_id;
        
        -- Rename the UUID column
        ALTER TABLE public.conversations RENAME COLUMN client_id_uuid TO client_id;
        
        RAISE NOTICE 'Converted client_id from text to UUID';
    END IF;
END $$;

-- Clean up orphaned conversations before adding foreign key constraints
DO $$
DECLARE
    orphaned_count INTEGER;
BEGIN
    -- Find and log conversations with invalid client_id references
    SELECT COUNT(*) INTO orphaned_count 
    FROM public.conversations c
    LEFT JOIN public.clients cl ON c.client_id = cl.id
    WHERE cl.id IS NULL;
    
    IF orphaned_count > 0 THEN
        RAISE NOTICE 'Found % conversations with invalid client_id references. Cleaning up...', orphaned_count;
        
        -- Delete orphaned conversations (those with invalid client_id)
        DELETE FROM public.conversations 
        WHERE client_id NOT IN (SELECT id FROM public.clients);
        
        RAISE NOTICE 'Cleaned up % orphaned conversations', orphaned_count;
    END IF;
    
    -- Also check for invalid freelancer_id references
    SELECT COUNT(*) INTO orphaned_count 
    FROM public.conversations c
    LEFT JOIN public.users u ON c.freelancer_id = u.id
    WHERE u.id IS NULL;
    
    IF orphaned_count > 0 THEN
        RAISE NOTICE 'Found % conversations with invalid freelancer_id references. Cleaning up...', orphaned_count;
        
        -- Delete orphaned conversations (those with invalid freelancer_id)
        DELETE FROM public.conversations 
        WHERE freelancer_id NOT IN (SELECT id FROM public.users);
        
        RAISE NOTICE 'Cleaned up % orphaned conversations with invalid freelancer_id', orphaned_count;
    END IF;
END $$;

-- Now add the foreign key constraints
ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_freelancer_id_fkey 
FOREIGN KEY (freelancer_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- 4. Update email in users table from auth.users
UPDATE public.users 
SET email = auth.users.email
FROM auth.users 
WHERE public.users.id = auth.users.id 
AND public.users.email IS NULL;

-- 5. Ensure RLS policies are correct for the updated schema
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Recreate policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. Fix conversations RLS policies (policies will be recreated after column conversion)

CREATE POLICY "Users can view conversations" ON public.conversations
FOR SELECT USING (
    auth.uid() = freelancer_id OR 
    auth.uid() IN (SELECT user_id FROM public.clients WHERE id = client_id)
);

CREATE POLICY "Users can create conversations" ON public.conversations
FOR INSERT WITH CHECK (
    auth.uid() = freelancer_id OR 
    auth.uid() IN (SELECT user_id FROM public.clients WHERE id = client_id)
);

-- 7. Update clients table RLS policies to ensure proper access
DROP POLICY IF EXISTS "Clients can view own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can update own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can insert own data" ON public.clients;
DROP POLICY IF EXISTS "Allow service role insert" ON public.clients;

CREATE POLICY "Clients can view own data" ON public.clients
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Clients can update own data" ON public.clients
FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Clients can insert own data" ON public.clients
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Allow service role insert" ON public.clients
FOR INSERT WITH CHECK (true);

DO $$
BEGIN
    RAISE NOTICE 'Database schema fixes completed successfully';
END $$;
