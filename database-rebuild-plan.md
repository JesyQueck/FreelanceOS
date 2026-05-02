# Database Rebuild Plan - Clean Unified System

## Overview
Due to persistent foreign key constraint issues during migration, we will rebuild the database from scratch with a clean unified user system. This approach ensures no legacy data conflicts.

## Phase 1: Data Backup
**Priority: CRITICAL**
1. Export all existing data from current tables
2. Store exports securely before any destructive operations
3. Verify backup integrity

## Phase 2: Clean Schema Creation
**Priority: HIGH**
1. Drop all existing tables (users, clients, conversations, messages, portfolios, services, etc.)
2. Create fresh unified schema with proper relationships from the start
3. Implement all RLS policies correctly from the beginning

## Phase 3: Data Restoration
**Priority: HIGH**
1. Import backed up data into new schema
2. Map legacy data to unified structure
3. Verify data integrity after restoration

## Phase 4: Frontend Updates
**Priority: MEDIUM**
1. Update frontend to work with new unified schema
2. Remove all legacy table references
3. Test all functionality end-to-end

## Phase 5: Testing & Verification
**Priority: HIGH**
1. Test user registration (both freelancer and client)
2. Test messaging system thoroughly
3. Test role-based routing
4. Test client entry flow
5. Verify all security policies work correctly

---

## Implementation Order

### Step 1: Backup Script
```sql
-- Export all data from existing tables
COPY (SELECT id, email, display_name, name, bio, profile_image, skills, created_at, updated_at, username, slug FROM public.users) TO '/tmp/users_backup.csv' WITH CSV HEADER;
COPY (SELECT id, user_id, full_name, email, company, phone, bio, profile_image, created_at, updated_at FROM public.clients) TO '/tmp/clients_backup.csv' WITH CSV HEADER;
COPY (SELECT id, freelancer_id, client_id, created_at, last_message_at, status FROM public.conversations) TO '/tmp/conversations_backup.csv' WITH CSV HEADER;
COPY (SELECT id, conversation_id, sender_id, content, created_at FROM public.messages) TO '/tmp/messages_backup.csv' WITH CSV HEADER;
COPY (SELECT id, user_id, title, description, image_url, external_link, created_at FROM public.portfolios) TO '/tmp/portfolios_backup.csv' WITH CSV HEADER;
COPY (SELECT id, user_id, title, description, price, is_negotiable, delivery_time, created_at FROM public.services) TO '/tmp/services_backup.csv' WITH CSV HEADER;
```

### Step 2: Clean Schema Script
```sql
-- Fresh unified schema from scratch
-- Users table with role column from start
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

-- Profile tables
CREATE TABLE public.freelancer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC(10,2),
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

-- Messaging tables
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT DEFAULT 'active',
  UNIQUE(freelancer_id, client_id)
);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Other tables
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  external_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) DEFAULT 0.00,
  is_negotiable BOOLEAN DEFAULT FALSE,
  delivery_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_freelancer_profiles_user_id ON public.freelancer_profiles(user_id);
CREATE INDEX idx_client_profiles_user_id ON public.client_profiles(user_id);
CREATE INDEX idx_conversations_freelancer_id ON public.conversations(freelancer_id);
CREATE INDEX idx_conversations_client_id ON public.conversations(client_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Enable RLS on all tables
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Freelancer profiles viewable by everyone." ON public.freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Freelancer can update own profile." ON public.freelancer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Freelancer can insert own profile." ON public.freelancer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Client profiles viewable by everyone." ON public.client_profiles FOR SELECT USING (true);
CREATE POLICY "Client can update own profile." ON public.client_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Client can insert own profile." ON public.client_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Messaging policies
CREATE POLICY "Users can read their own conversations." ON public.conversations 
FOR SELECT USING (auth.uid() = freelancer_id OR auth.uid() = client_id);

CREATE POLICY "Users can create conversations." ON public.conversations 
FOR INSERT WITH CHECK (auth.uid() = freelancer_id OR auth.uid() = client_id);

CREATE POLICY "Users can update conversations." ON public.conversations 
FOR UPDATE USING (auth.uid() = freelancer_id OR auth.uid() = client_id);

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

-- Public content policies
CREATE POLICY "Portfolios are viewable by everyone." ON public.portfolios FOR SELECT USING (true);
CREATE POLICY "Portfolios can manage own." ON public.portfolios FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Services are viewable by everyone." ON public.services FOR SELECT USING (true);
CREATE POLICY "Services can manage own." ON public.services FOR ALL USING (auth.uid() = user_id);

-- Real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
```

### Step 3: Data Restoration Script
```sql
-- Map legacy data to new unified schema
-- Insert users with roles
INSERT INTO public.users (id, email, display_name, role, created_at)
SELECT 
    u.id,
    COALESCE(u.email, ''),
    COALESCE(u.display_name, u.name),
    CASE 
        WHEN c.id IS NOT NULL THEN 'client'
        ELSE 'freelancer'
    END,
    u.created_at
FROM public.users u
LEFT JOIN public.clients c ON u.id = c.user_id;

-- Insert client profiles
INSERT INTO public.client_profiles (user_id, company, created_at)
SELECT 
    u.id,
    c.company,
    c.created_at
FROM public.users u
INNER JOIN public.clients c ON u.id = c.user_id
WHERE u.role = 'client';

-- Insert conversations
INSERT INTO public.conversations (id, freelancer_id, client_id, created_at, last_message_at)
SELECT 
    gen_random_uuid(),
    c.freelancer_id,
    u.id as client_id,
    c.created_at,
    c.created_at
FROM public.conversations c
INNER JOIN public.clients c ON c.client_id = c.id
INNER JOIN public.users u ON u.id = c.user_id
WHERE u.role = 'client';

-- Insert messages
INSERT INTO public.messages (id, conversation_id, sender_id, content, created_at)
SELECT 
    gen_random_uuid(),
    c.id,
    c.sender_id,
    m.content,
    m.created_at
FROM public.conversations c
INNER JOIN public.clients c ON c.client_id = c.id
INNER JOIN public.messages m ON c.id = m.conversation_id
INNER JOIN public.users u ON u.id = m.sender_id
WHERE u.role = 'client';

-- Insert portfolios
INSERT INTO public.portfolios (id, user_id, title, description, image_url, external_link, created_at)
SELECT 
    gen_random_uuid(),
    u.id,
    p.title,
    p.description,
    p.image_url,
    p.external_link,
    p.created_at
FROM public.portfolios p
INNER JOIN public.users u ON u.id = p.user_id;

-- Insert services
INSERT INTO public.services (id, user_id, title, description, price, is_negotiable, delivery_time, created_at)
SELECT 
    gen_random_uuid(),
    u.id,
    s.title,
    s.description,
    s.price,
    s.is_negotiable,
    s.delivery_time,
    s.created_at
FROM public.services s
INNER JOIN public.users u ON u.id = s.user_id;
```

## Execution Strategy

1. **Execute backup script first** - Ensure we have all data saved
2. **Execute clean schema script** - Create fresh unified structure  
3. **Execute restoration script** - Import data with proper mapping
4. **Test thoroughly** - Verify all functionality works
5. **Update frontend** - Remove any remaining legacy references

## Benefits of This Approach

✅ **No Foreign Key Issues** - Clean schema from scratch
✅ **Unified User System** - Single source of truth for user identity
✅ **Clean Messaging** - Proper relationships from the start
✅ **Data Integrity** - Controlled migration process
✅ **Future-Proof** - No legacy dependencies

This approach eliminates all the migration issues we encountered and provides a solid foundation for the unified user system.
