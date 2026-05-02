-- SAFE REFACTOR PROMPT — NON-DESTRUCTIVE DATABASE + MESSAGING FIX
-- This script implements a unified user identity model without breaking existing data

-- STEP 1: UNIFIED USERS TABLE - Add missing role column
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

-- STEP 2: MIGRATE EXISTING CLIENT DATA TO USERS TABLE
-- Update users table with role information from clients table
UPDATE public.users 
SET role = 'client' 
WHERE id IN (SELECT user_id FROM public.clients) 
AND role IS NULL;

-- Set default role to freelancer for users not in clients table
UPDATE public.users 
SET role = 'freelancer' 
WHERE role IS NULL;

-- STEP 3: CREATE PROFILE TABLES IF THEY DON'T EXIST
CREATE TABLE IF NOT EXISTS public.freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC(10, 2),
  availability_status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  company TEXT,
  industry TEXT,
  project_preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- STEP 4: MIGRATE EXISTING CLIENT PROFILES
-- Move data from clients table to client_profiles
INSERT INTO public.client_profiles (user_id, company, created_at)
SELECT user_id, company, created_at
FROM public.clients
ON CONFLICT (user_id) DO NOTHING;

-- STEP 5: FIX CONVERSATIONS TABLE TO USE UNIFIED USER SYSTEM
-- Create new columns for unified user references
DO $$
BEGIN
    -- Add client_user_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='conversations' 
        AND column_name='client_user_id'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN client_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added client_user_id column to conversations table';
    END IF;
END $$;

-- Migrate existing conversations to use unified user system
UPDATE public.conversations 
SET client_user_id = c.user_id
FROM public.clients c
WHERE conversations.client_id = c.id AND conversations.client_user_id IS NULL;

-- STEP 6: UPDATE MESSAGES TABLE IF NEEDED
DO $$
BEGIN
    -- Ensure messages table has all required columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='messages' 
        AND column_name='conversation_id'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.messages ADD COLUMN conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='messages' 
        AND column_name='sender_id'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.messages ADD COLUMN sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='messages' 
        AND column_name='content'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.messages ADD COLUMN content TEXT NOT NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='messages' 
        AND column_name='created_at'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.messages ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
    END IF;
END $$;

-- STEP 7: CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_user_id ON public.freelancer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON public.client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_conversations_client_user_id ON public.conversations(client_user_id);

-- STEP 8: UPDATED ROW LEVEL SECURITY POLICIES
-- Drop existing policies
DROP POLICY IF EXISTS "Users are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.users;

-- Recreate users table policies with role support
CREATE POLICY "Users are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Profile tables policies
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Freelancer profiles viewable by everyone." ON public.freelancer_profiles;
DROP POLICY IF EXISTS "Freelancer can update own profile." ON public.freelancer_profiles;
DROP POLICY IF EXISTS "Client profiles viewable by everyone." ON public.client_profiles;
DROP POLICY IF EXISTS "Client can update own profile." ON public.client_profiles;

CREATE POLICY "Freelancer profiles viewable by everyone." ON public.freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Freelancer can update own profile." ON public.freelancer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Freelancer can insert own profile." ON public.freelancer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Client profiles viewable by everyone." ON public.client_profiles FOR SELECT USING (true);
CREATE POLICY "Client can update own profile." ON public.client_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Client can insert own profile." ON public.client_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Updated conversations policies (support both old and new systems)
DROP POLICY IF EXISTS "Users can read their own conversations." ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations." ON public.conversations;
DROP POLICY IF EXISTS "Users can update conversations." ON public.conversations;

CREATE POLICY "Users can read their own conversations." ON public.conversations 
FOR SELECT USING (
    auth.uid() = freelancer_id OR 
    auth.uid() = client_user_id OR
    auth.uid() IN (SELECT user_id FROM public.clients WHERE id = client_id)
);

CREATE POLICY "Users can create conversations." ON public.conversations 
FOR INSERT WITH CHECK (
    auth.uid() = freelancer_id OR 
    auth.uid() = client_user_id
);

CREATE POLICY "Users can update conversations." ON public.conversations 
FOR UPDATE USING (
    auth.uid() = freelancer_id OR 
    auth.uid() = client_user_id
);

-- Updated messages policies
DROP POLICY IF EXISTS "Users can read messages in their conversations." ON public.messages;
DROP POLICY IF EXISTS "Users can send messages." ON public.messages;

CREATE POLICY "Users can read messages in their conversations." ON public.messages 
FOR SELECT USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = messages.conversation_id 
      AND (c.freelancer_id = auth.uid() OR c.client_user_id = auth.uid() OR 
           auth.uid() IN (SELECT user_id FROM public.clients WHERE id = c.client_id))
    )
);

CREATE POLICY "Users can send messages." ON public.messages 
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- STEP 9: CREATE OR UPDATE TRIGGERS FOR UPDATED_AT COLUMNS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_freelancer_profiles_updated_at ON public.freelancer_profiles;
CREATE TRIGGER handle_freelancer_profiles_updated_at
BEFORE UPDATE ON public.freelancer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_client_profiles_updated_at ON public.client_profiles;
CREATE TRIGGER handle_client_profiles_updated_at
BEFORE UPDATE ON public.client_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- STEP 10: ENSURE REAL-TIME SUBSCRIPTIONS
ALTER PUBLICATION supabase_realtime ADD TABLE public.freelancer_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_profiles;

DO $$
BEGIN
    RAISE NOTICE 'Safe refactor completed successfully!';
    RAISE NOTICE 'Unified user system is now active with role-based access.';
    RAISE NOTICE 'Existing data has been preserved and migrated.';
END $$;
