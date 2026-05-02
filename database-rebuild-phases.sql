-- ========================================
-- DATABASE REBUILD - PHASE 1: CORE TABLES
-- ========================================
-- This phase creates the core unified user system tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE - Core unified user table with role column
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  name TEXT,
  bio TEXT,
  profile_image TEXT,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  username TEXT UNIQUE,
  slug TEXT UNIQUE,
  role TEXT CHECK (role IN ('freelancer', 'client')) NOT NULL
);

-- PROFILE TABLES
CREATE TABLE public.freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC(10, 2),
  availability_status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.client_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  company TEXT,
  industry TEXT,
  project_preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- DATABASE REBUILD - PHASE 2: MESSAGING SYSTEM
-- ========================================
-- This phase creates the messaging tables with unified user references

-- CONVERSATIONS TABLE
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'active',
  UNIQUE(freelancer_id, client_id)
);

-- MESSAGES TABLE
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- DATABASE REBUILD - PHASE 3: CONTENT TABLES
-- ========================================
-- This phase creates the content tables (portfolios and services)

-- PORTFOLIOS TABLE
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  external_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- SERVICES TABLE
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) DEFAULT 0.00,
  is_negotiable BOOLEAN DEFAULT FALSE,
  delivery_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- DATABASE REBUILD - PHASE 4: INDEXES AND TRIGGERS
-- ========================================
-- This phase creates performance indexes and triggers

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_freelancer_profiles_user_id ON public.freelancer_profiles(user_id);
CREATE INDEX idx_client_profiles_user_id ON public.client_profiles(user_id);
CREATE INDEX idx_conversations_freelancer_id ON public.conversations(freelancer_id);
CREATE INDEX idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);

-- TRIGGERS FOR UPDATED_AT COLUMNS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER handle_freelancer_profiles_updated_at
BEFORE UPDATE ON public.freelancer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_client_profiles_updated_at
BEFORE UPDATE ON public.client_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ========================================
-- DATABASE REBUILD - PHASE 5: ROW LEVEL SECURITY
-- ========================================
-- This phase sets up RLS policies for all tables

-- USERS TABLE RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- FREELANCER PROFILES RLS
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Freelancer profiles viewable by everyone." ON public.freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Freelancer can update own profile." ON public.freelancer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Freelancer can insert own profile." ON public.freelancer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CLIENT PROFILES RLS
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client profiles viewable by everyone." ON public.client_profiles FOR SELECT USING (true);
CREATE POLICY "Client can update own profile." ON public.client_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Client can insert own profile." ON public.client_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CONVERSATIONS RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own conversations." ON public.conversations 
FOR SELECT USING (auth.uid() = freelancer_id OR auth.uid() = client_id);

CREATE POLICY "Users can create conversations." ON public.conversations 
FOR INSERT WITH CHECK (auth.uid() = freelancer_id OR auth.uid() = client_id);

CREATE POLICY "Users can update conversations." ON public.conversations 
FOR UPDATE USING (auth.uid() = freelancer_id OR auth.uid() = client_id);

-- MESSAGES RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read messages in their conversations." ON public.messages 
FOR SELECT USING (
  auth.uid() = sender_id OR
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = messages.conversation_id 
    AND (c.freelancer_id = auth.uid() OR c.client_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages." ON public.messages 
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- PORTFOLIOS RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Portfolios are viewable by everyone." ON public.portfolios FOR SELECT USING (true);
CREATE POLICY "Portfolios can manage own." ON public.portfolios FOR ALL USING (auth.uid() = user_id);

-- SERVICES RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are viewable by everyone." ON public.services FOR SELECT USING (true);
CREATE POLICY "Services can manage own." ON public.services FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- DATABASE REBUILD - PHASE 6: REAL-TIME SUBSCRIPTIONS
-- ========================================
-- This phase enables real-time subscriptions for messaging

ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- ========================================
-- DATABASE REBUILD - COMPLETION
-- ========================================
-- This marks the completion of the database rebuild

DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'DATABASE REBUILD COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE '✅ Unified user system created';
    RAISE NOTICE '✅ Core tables (users, profiles) ready';
    RAISE NOTICE '✅ Messaging system implemented';
    RAISE NOTICE '✅ Content tables (portfolios, services) ready';
    RAISE NOTICE '✅ Performance indexes created';
    RAISE NOTICE '✅ Triggers for updated_at columns active';
    RAISE NOTICE '✅ Row Level Security policies implemented';
    RAISE NOTICE '✅ Real-time subscriptions enabled';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Database is ready for use!';
END $$;
