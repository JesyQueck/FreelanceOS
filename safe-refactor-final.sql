-- SAFE REFACTOR PROMPT — NON-DESTRUCTIVE DATABASE + MESSAGING FIX
-- Final working version

-- Add role column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('freelancer', 'client'));

-- Update users with client role
UPDATE public.users SET role = 'client' WHERE id IN (SELECT user_id FROM public.clients WHERE user_id IS NOT NULL);

-- Set remaining users to freelancer role  
UPDATE public.users SET role = 'freelancer' WHERE role IS NULL;

-- Create profile tables
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

-- Add client_user_id column to conversations table
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS client_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Update conversations with unified user references
UPDATE public.conversations SET client_user_id = c.user_id FROM public.clients c WHERE public.conversations.client_id = c.id AND c.user_id IS NOT NULL;

-- Add missing columns to messages table
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS content TEXT NOT NULL DEFAULT '';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_user_id ON public.freelancer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_user_id ON public.client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_conversations_client_user_id ON public.conversations(client_user_id);

-- Migrate client profiles safely
INSERT INTO public.client_profiles (user_id, company, created_at)
SELECT c.user_id, c.company, c.created_at
FROM public.clients c
WHERE c.user_id IS NOT NULL
AND EXISTS (SELECT 1 FROM public.users u WHERE u.id = c.user_id)
AND NOT EXISTS (SELECT 1 FROM public.client_profiles cp WHERE cp.user_id = c.user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS handle_freelancer_profiles_updated_at ON public.freelancer_profiles;
CREATE TRIGGER handle_freelancer_profiles_updated_at BEFORE UPDATE ON public.freelancer_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_client_profiles_updated_at ON public.client_profiles;
CREATE TRIGGER handle_client_profiles_updated_at BEFORE UPDATE ON public.client_profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_conversations_updated_at ON public.conversations;
CREATE TRIGGER handle_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Update RLS policies
DROP POLICY IF EXISTS "Users are viewable by everyone." ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.users;

CREATE POLICY "Users are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Freelancer profiles viewable by everyone." ON public.freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Freelancer can update own profile." ON public.freelancer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Freelancer can insert own profile." ON public.freelancer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Client profiles viewable by everyone." ON public.client_profiles FOR SELECT USING (true);
CREATE POLICY "Client can update own profile." ON public.client_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Client can insert own profile." ON public.client_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

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

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.freelancer_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.client_profiles;
