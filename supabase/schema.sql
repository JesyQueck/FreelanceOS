-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
-- Since we are using Supabase Auth, we typically map our public.users table to auth.users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  profile_image TEXT,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- PORTFOLIOS TABLE
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- SERVICES TABLE
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  is_negotiable BOOLEAN DEFAULT FALSE,
  delivery_time TEXT, -- e.g., '3 days', '1 week'
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- CONVERSATIONS TABLE
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(freelancer_id, client_id)
);

-- MESSAGES TABLE
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- e.g., 'message', 'system'
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- INDEXES FOR SCALABILITY & PERFORMANCE
-- Indexing foreign keys and commonly filtered columns
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX idx_services_user_id ON public.services(user_id);
CREATE INDEX idx_conversations_freelancer ON public.conversations(freelancer_id);
CREATE INDEX idx_conversations_client ON public.conversations(client_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- SETUP ROW LEVEL SECURITY (RLS)
-- Users can read all users (to see profiles)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Portfolios can be read by everyone, but only modified by the owner
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Portfolios are viewable by everyone." ON public.portfolios FOR SELECT USING (true);
CREATE POLICY "Users can insert their own portfolios." ON public.portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolios." ON public.portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own portfolios." ON public.portfolios FOR DELETE USING (auth.uid() = user_id);

-- Services can be read by everyone, but only modified by the owner
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services are viewable by everyone." ON public.services FOR SELECT USING (true);
CREATE POLICY "Users can insert their own services." ON public.services FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own services." ON public.services FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own services." ON public.services FOR DELETE USING (auth.uid() = user_id);

-- Conversations are visible to the freelancer and client involved
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own conversations." ON public.conversations 
  FOR SELECT USING (auth.uid() = freelancer_id OR auth.uid() = client_id);
CREATE POLICY "Users can create conversations." ON public.conversations 
  FOR INSERT WITH CHECK (auth.uid() = freelancer_id OR auth.uid() = client_id);
CREATE POLICY "Users can update conversations." ON public.conversations 
  FOR UPDATE USING (auth.uid() = freelancer_id OR auth.uid() = client_id);

-- Messages are only visible to the participants of the conversation
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read messages in their conversations." ON public.messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c 
      WHERE c.id = messages.conversation_id 
      AND (c.freelancer_id = auth.uid() OR c.client_id = auth.uid())
    )
  );
CREATE POLICY "Users can send messages." ON public.messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications are only visible to the user they belong to
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own notifications." ON public.notifications 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications (read status)." ON public.notifications 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications." ON public.notifications 
  FOR INSERT WITH CHECK (true); -- In a real app this would be restricted to service roles or triggers.

-- ENABLE REAL-TIME SUBSCRIPTIONS
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- OPTIONAL: FUNCTION TO AUTOMATICALLY CREATE A USER PROFILE ON SIGNUP
-- This function listens to auth.users inserts and automatically creates a public.users row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
