-- Clear all messages and conversations data
-- This will permanently delete all message and conversation records

-- First delete all messages (due to foreign key constraints)
DELETE FROM public.messages;

-- Then delete all conversations
DELETE FROM public.conversations;

-- Reset the sequence for conversation IDs (if using serial)
-- ALTER SEQUENCE public.conversations_id_seq RESTART WITH 1;

-- Reset the sequence for message IDs (if using serial)
-- ALTER SEQUENCE public.messages_id_seq RESTART WITH 1;

-- Verify the deletion
SELECT 'Messages cleared: ' || COUNT(*) FROM public.messages;
SELECT 'Conversations cleared: ' || COUNT(*) FROM public.conversations;
