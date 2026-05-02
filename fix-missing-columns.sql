-- FIX MISSING COLUMNS - Add updated_at column to conversations table
-- This script adds missing columns that the frontend expects

-- Add updated_at column to conversations table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='conversations' 
        AND column_name='updated_at'
        AND table_schema='public'
    ) THEN
        ALTER TABLE public.conversations ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;
        RAISE NOTICE 'Added updated_at column to conversations table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in conversations table';
    END IF;
END $$;

-- Create trigger for conversations updated_at (if not exists)
DROP TRIGGER IF EXISTS handle_conversations_updated_at ON public.conversations;
CREATE TRIGGER handle_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Update existing conversations to have updated_at set
UPDATE public.conversations 
SET updated_at = COALESCE(updated_at, created_at, NOW())
WHERE updated_at IS NULL;

DO $$
BEGIN
    RAISE NOTICE 'Missing columns fix completed successfully!';
END $$;
