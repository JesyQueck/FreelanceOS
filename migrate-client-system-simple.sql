-- Simple migration script - step by step approach
-- This script separates column additions from policy creation

-- Step 1: Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  bio TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Step 2: Add missing columns to conversations table (one by one)
DO $$
BEGIN
    -- Add client_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='conversations' 
        AND column_name='client_id'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.conversations 
        ADD COLUMN client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added client_id column to conversations table';
    END IF;
    
    -- Add freelancer_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='conversations' 
        AND column_name='freelancer_id'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.conversations 
        ADD COLUMN freelancer_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added freelancer_id column to conversations table';
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='conversations' 
        AND column_name='updated_at'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.conversations 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
        RAISE NOTICE 'Added updated_at column to conversations table';
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='conversations' 
        AND column_name='status'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.conversations 
        ADD COLUMN status TEXT DEFAULT 'active';
        RAISE NOTICE 'Added status column to conversations table';
    END IF;
    
    -- Add last_message_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='conversations' 
        AND column_name='last_message_at'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.conversations 
        ADD COLUMN last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
        RAISE NOTICE 'Added last_message_at column to conversations table';
    END IF;
END $$;

-- Step 3: Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  file_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_freelancer_id ON public.conversations(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Step 5: Create functions and triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS handle_clients_updated_at ON public.clients;
CREATE TRIGGER handle_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_conversations_updated_at ON public.conversations;
CREATE TRIGGER handle_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_messages_updated_at ON public.messages;
CREATE TRIGGER handle_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to update conversation's last_message_at
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at, updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_conversation_last_message ON public.messages;
CREATE TRIGGER update_conversation_last_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_conversation_last_message();

-- Step 6: Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop existing policies
DROP POLICY IF EXISTS "Clients can view own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can update own data" ON public.clients;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;

-- Step 8: Create client policies
CREATE POLICY "Clients can view own data" ON public.clients
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Clients can update own data" ON public.clients
FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Step 9: Create conversation policies (simple version)
CREATE POLICY "Users can view own conversations" ON public.conversations
FOR SELECT USING (
  auth.uid()::text IN (
    SELECT user_id::text FROM public.clients WHERE id::text = client_id::text
  ) OR auth.uid()::text = freelancer_id::text
);

-- Step 10: Create message policies (simple version)
CREATE POLICY "Users can view own messages" ON public.messages
FOR SELECT USING (
  auth.uid()::text IN (
    SELECT user_id::text FROM public.clients WHERE id::text = 
      (SELECT client_id::text FROM public.conversations WHERE id::text = conversation_id::text)
  ) OR auth.uid()::text = freelancer_id::text OR auth.uid()::text = sender_id::text
);

CREATE POLICY "Users can insert own messages" ON public.messages
FOR INSERT WITH CHECK (
  auth.uid()::text IN (
    SELECT user_id::text FROM public.clients WHERE id::text = 
      (SELECT client_id::text FROM public.conversations WHERE id::text = conversation_id::text)
  ) OR auth.uid()::text = freelancer_id::text
);

DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
END $$;
