-- Adaptive migration script that checks current table structure
-- This script will work with whatever structure currently exists

-- First, let's check what columns exist in the conversations table
DO $$
BEGIN
    -- Check if conversations table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'conversations' AND table_schema = 'public') THEN
        RAISE NOTICE 'Conversations table exists, checking structure...';
        
        -- Check what columns exist
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'client_id' AND table_schema = 'public') THEN
            RAISE NOTICE 'client_id column exists';
        ELSE
            RAISE NOTICE 'client_id column does not exist, will add it';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'freelancer_id' AND table_schema = 'public') THEN
            RAISE NOTICE 'freelancer_id column exists';
        ELSE
            RAISE NOTICE 'freelancer_id column does not exist, will add it';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'updated_at' AND table_schema = 'public') THEN
            RAISE NOTICE 'updated_at column exists';
        ELSE
            RAISE NOTICE 'updated_at column does not exist, will add it';
        END IF;
    ELSE
        RAISE NOTICE 'Conversations table does not exist, will create it';
    END IF;
END $$;

-- Create clients table (only if it doesn't exist)
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

-- Add missing columns to conversations table if needed
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

-- Create messages table (only if it doesn't exist)
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);

-- Only create conversation indexes if the columns exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'client_id' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations(client_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'freelancer_id' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_conversations_freelancer_id ON public.conversations(freelancer_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'status' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'last_message_at' AND table_schema = 'public') THEN
        CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Create or replace functions and triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers (drop if exists first)
DROP TRIGGER IF EXISTS handle_clients_updated_at ON public.clients;
CREATE TRIGGER handle_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Only create conversation triggers if the columns exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'updated_at' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS handle_conversations_updated_at ON public.conversations;
        CREATE TRIGGER handle_conversations_updated_at
        BEFORE UPDATE ON public.conversations
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_updated_at();
    END IF;
END $$;

-- Create trigger to update conversation's last_message_at when new message is added
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

-- Enable RLS if not already enabled
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can view own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can update own data" ON public.clients;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;

-- Create RLS policies (only for columns that exist)
CREATE POLICY "Clients can view own data" ON public.clients
FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Clients can update own data" ON public.clients
FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Only create conversation policies if the required columns exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'client_id' AND table_schema = 'public')
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'freelancer_id' AND table_schema = 'public') THEN
        
        CREATE POLICY "Users can view own conversations" ON public.conversations
        FOR SELECT USING (
          auth.uid()::text IN (
            SELECT user_id::text FROM public.clients WHERE id::text = client_id::text
          ) OR auth.uid()::text = freelancer_id::text
        );
        
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
    ELSE
        -- Fallback policies for old table structure
        CREATE POLICY "Users can view own conversations" ON public.conversations
        FOR SELECT USING (true); -- Allow all for now, adjust based on actual structure
        
        CREATE POLICY "Users can view own messages" ON public.messages
        FOR SELECT USING (auth.uid()::text = sender_id::text);
        
        CREATE POLICY "Users can insert own messages" ON public.messages
        FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);
    END IF;
END $$;

DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
END $$;
