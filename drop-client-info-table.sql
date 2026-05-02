-- Drop the client_info table since we're now using the clients table exclusively
-- All client data is now stored in the clients table

-- First, drop any RLS policies on client_info
ALTER TABLE IF EXISTS public.client_info DISABLE ROW LEVEL SECURITY;

-- Drop the client_info table
DROP TABLE IF EXISTS public.client_info CASCADE;

DO $$
BEGIN
    RAISE NOTICE 'Dropped client_info table - all client data now uses clients table';
END $$;
