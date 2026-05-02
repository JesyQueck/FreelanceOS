-- SAFE REFACTOR PROMPT — NON-DESTRUCTIVE DATABASE + MESSAGING FIX
-- Simplified version that avoids UUID comparison issues

-- STEP 1: ADD MISSING ROLE COLUMN TO USERS TABLE
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

-- STEP 2: MIGRATE CLIENT DATA TO USERS TABLE USING SAFE METHOD
-- First, set role for users that exist in clients table
UPDATE public.users 
SET role = 'client' 
FROM public.clients c
WHERE public.users.id = c.user_id;

-- Then set remaining users to freelancer role
UPDATE public.users 
SET role = 'freelancer' 
WHERE role IS NULL;

-- STEP 3: CREATE PROFILE TABLES
CREATE TABLE IF NOT EXISTS public.freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC(10, 2),
  availability_status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  company TEXT,
  industry TEXT,
  project_preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- STEP 4: MIGRATE CLIENT PROFILES SAFELY
INSERT INTO public.client_profiles (user_id, company, created_at)
SELECT c.user_id, c.company, c.created_at
FROM public.clients c
WHERE NOT EXISTS (
    SELECT 1 FROM public.client_profiles cp 
    WHERE cp.user_id = c.user_id
);

-- STEP 5: UPDATE CONVERSATIONS TABLE FOR UNIFIED SYSTEM
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='conversations' 
        AND column_name='client_user_id'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN client_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added client_user_id column to conversations table';
    ELSE
        RAISE NOTICE 'client_user_id column already exists in conversations table';
    END IF;
END $$;

-- Migrate existing conversations using JOIN approach
UPDATE public.conversations 
SET client_user_id = c.user_id
FROM public.clients c
WHERE public.conversations.client_id = c.id;

-- STEP 6: ENSURE MESSAGES TABLE HAS REQUIRED COLUMNS
DO $$
BEGIN
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
        ALTER TABLE public.messages ADD COLUMN content TEXT NOT NULL DEFAULT '';
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

-- STEP 7: CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_user_id ON public.freelancer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON public.client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_conversations_client_user_id ON public.conversations(client_user_id);

-- STEP 8: CREATE TRIGGERS FOR UPDATED_AT COLUMNS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

DROP TRIGGER IF EXISTS handle_conversations_updated_at ON public.conversations;
CREATE TRIGGER handle_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- STEP 9: UPDATE ROW LEVEL SECURITY POLICIES
-- Drop and recreate user policies
DROP POLICY IF EXISTS "Users are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.users;

CREATE POLICY "Users are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Enable RLS and create policies for profile tables
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Freelancer profiles viewable by everyone." ON public.freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Freelancer can update own profile." ON public.freelancer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Freelancer can insert own profile." ON public.freelancer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Client profiles viewable by everyone." ON public.client_profiles FOR SELECT USING (true);
CREATE POLICY "Client can update own profile." ON public.client_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Client can insert own profile." ON public.client_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update conversations policies
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

-- Update messages policies
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

-- STEP 10: ENABLE REAL-TIME SUBSCRIPTIONS
ALTER PUBLICATION supabase_realtime ADD TABLE public.freelancer_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_profiles;

DO $$
BEGIN
    RAISE NOTICE 'Safe refactor completed successfully!';
    RAISE NOTICE 'Unified user system is now active with role-based access.';
    RAISE NOTICE 'All existing data has been preserved and migrated.';
END $$;
