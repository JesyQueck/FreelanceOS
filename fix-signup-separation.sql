-- Fix signup separation between freelancers and clients
-- Remove automatic trigger and implement role-specific signup

-- 1. Drop the automatic trigger that inserts all users into users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create separate functions for freelancer and client signup
CREATE OR REPLACE FUNCTION public.create_freelancer_profile()
RETURNS trigger AS $$
BEGIN
  -- Only create users table record for freelancers
  -- This will be called manually during freelancer signup
  INSERT INTO public.users (id, display_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.create_client_profile()
RETURNS trigger AS $$
BEGIN
  -- Only create clients table record for clients
  -- This will be called manually during client signup
  INSERT INTO public.clients (user_id, full_name, email, company)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'company'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update RLS policies to be more specific
-- Users table policies (for freelancers only)
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

CREATE POLICY "Freelancers can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Freelancers can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Freelancers can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Clients table policies (for clients only)
DROP POLICY IF EXISTS "Clients can view own data" ON clients;
DROP POLICY IF EXISTS "Clients can update own data" ON clients;
DROP POLICY IF EXISTS "Clients can insert own data" ON clients;
DROP POLICY IF EXISTS "Allow service role insert" ON clients;

CREATE POLICY "Clients can insert own data" ON clients
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Clients can view own data" ON clients
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Clients can update own data" ON clients
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Allow service role to insert (for signup flow)
CREATE POLICY "Allow service role insert" ON clients
  FOR INSERT WITH CHECK (true);

DO $$
BEGIN
    RAISE NOTICE 'Fixed signup separation between freelancers and clients';
END $$;
