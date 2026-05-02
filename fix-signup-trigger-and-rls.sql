-- Fix the handle_new_user trigger function
-- The email column was removed from the users table, causing signup to fail

-- Update the function to only insert the id (email column no longer exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Clients can view own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can update own data" ON public.clients;
DROP POLICY IF EXISTS "Clients can insert own data" ON public.clients;
DROP POLICY IF EXISTS "Allow service role insert" ON public.clients;

-- Add INSERT policy for clients table (was missing, causing RLS to block inserts)
CREATE POLICY "Clients can insert own data" ON public.clients
FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Also add a policy to allow reading client data for conversations
CREATE POLICY "Clients can view own data" ON public.clients
FOR SELECT USING (auth.uid()::text = user_id::text);

-- Allow service role to insert (for signup flow)
CREATE POLICY "Allow service role insert" ON public.clients
FOR INSERT WITH CHECK (true);

DO $$
BEGIN
    RAISE NOTICE 'Fixed handle_new_user trigger and added clients INSERT policies';
END $$;
