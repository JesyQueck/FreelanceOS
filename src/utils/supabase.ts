import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey)

export const createClient = () => {
  return supabase
}

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null)
  })
}

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// TypeScript interface for user profile
export interface UserProfile {
  display_name?: string;
  name?: string;
  bio?: string;
  skills?: string[];
  profile_image?: string;
  created_at?: string;
  email?: string;
  id?: string;
  updated_at?: string;
  username?: string;
  slug?: string;
}

// TypeScript interface for portfolio items
export interface PortfolioItem {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  image_url?: string;
  external_link?: string;
  created_at?: string;
}

// TypeScript interface for services
export interface Service {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  price?: string;
  timeline?: string;
  status?: 'active' | 'draft';
  created_at?: string;
  updated_at?: string;
}

// TypeScript interfaces for messaging
export interface Conversation {
  id?: string;
  freelancer_id: string;
  client_id: string;
  created_at?: string;
  last_message_at?: string;
  last_message?: string;
  freelancer_user?: {
    username?: string;
    display_name?: string;
  }[];
  client_user?: {
    username?: string;
    display_name?: string;
  }[];
}

export interface Message {
  id?: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at?: string;
}

export const getServicesCount = async (userId: string) => {
  const { count } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count || 0
}

export const getPortfoliosCount = async (userId: string) => {
  const { count } = await supabase
    .from('portfolios')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count || 0
}

export const getConversationsCount = async (userId: string) => {
  const { count } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .or(`freelancer_id.eq.${userId},client_id.eq.${userId}`)
  return count || 0
}

export const createOrUpdateUserProfile = async (userId: string, email: string, displayName?: string, name?: string, bio?: string, skills?: string[]) => {
  console.log('createOrUpdateUserProfile called with:', { userId, email, displayName, name, bio, skills });
  
  const profileData: any = {
    id: userId,
    email: email,
    updated_at: new Date().toISOString()
  };
  
  // Set created_at for new profiles (when displayName is provided during signup)
  if (displayName && !name && !bio && !skills) {
    profileData.created_at = new Date().toISOString();
  }
  
  if (displayName) profileData.display_name = displayName;
  if (name) profileData.name = name;
  if (bio) profileData.bio = bio;
  if (skills) profileData.skills = skills;
  
  // Generate username and slug if not present
  if (!profileData.username && displayName) {
    profileData.username = displayName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
  }
  
  if (!profileData.slug && profileData.username) {
    profileData.slug = profileData.username;
  }
  
  console.log('Profile data to upsert:', profileData);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(profileData)
      .select()
      .single();
    
    console.log('Upsert result:', { data, error });
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error in createOrUpdateUserProfile:', err);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
}

export const generateShareLink = (username?: string, slug?: string) => {
  const baseUrl = window.location.origin;
  const identifier = slug || username;
  return identifier ? `${baseUrl}/portfolio/${identifier}` : null;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  console.log('Getting user profile for ID:', userId);
  const { data, error } = await supabase
    .from('users')
    .select('display_name, name, bio, skills, profile_image, created_at, email, id, updated_at')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user profile:', error);
  }
  
  console.log('User profile data:', data);
  return data
}

// Portfolio items functions
export const getPortfolioItems = async (userId: string): Promise<PortfolioItem[]> => {
  console.log('Getting portfolio items for user:', userId);
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching portfolio items:', error);
    return [];
  }
  
  return data || [];
};

export const createPortfolioItem = async (item: Omit<PortfolioItem, 'id' | 'user_id' | 'created_at'>, userId: string): Promise<{ data: PortfolioItem | null; error: any }> => {
  console.log('Creating portfolio item:', { ...item, userId });
  
  const portfolioData = {
    ...item,
    user_id: userId,
    created_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .insert(portfolioData)
      .select()
      .single();
    
    console.log('Portfolio item creation result:', { data, error });
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error in createPortfolioItem:', err);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

export const updatePortfolioItem = async (id: string, item: Partial<PortfolioItem>): Promise<{ data: PortfolioItem | null; error: any }> => {
  console.log('Updating portfolio item:', { id, ...item });
  
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    
    console.log('Portfolio item update result:', { data, error });
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error in updatePortfolioItem:', err);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

export const deletePortfolioItem = async (id: string): Promise<{ error: any }> => {
  console.log('Deleting portfolio item:', id);
  
  try {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id);
    
    console.log('Portfolio item deletion result:', { error });
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    return { error };
  } catch (err) {
    console.error('Unexpected error in deletePortfolioItem:', err);
    return { error: { message: 'Unexpected error occurred' } };
  }
};

// Services CRUD functions
export const getServices = async (userId: string): Promise<Service[]> => {
  console.log('Getting services for user:', userId);
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }
  
  return data || [];
};

export const createService = async (service: Omit<Service, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId: string): Promise<{ data: Service | null; error: any }> => {
  console.log('Creating service:', { ...service, userId });
  
  const serviceData = {
    ...service,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single();
    
    console.log('Service creation result:', { data, error });
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error in createService:', err);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

export const updateService = async (id: string, service: Partial<Service>): Promise<{ data: Service | null; error: any }> => {
  console.log('Updating service:', { id, ...service });
  
  const updateData = {
    ...service,
    updated_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    console.log('Service update result:', { data, error });
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error in updateService:', err);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

export const deleteService = async (id: string): Promise<{ error: any }> => {
  console.log('Deleting service:', id);
  
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    console.log('Service deletion result:', { error });
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    return { error };
  } catch (err) {
    console.error('Unexpected error in deleteService:', err);
    return { error: { message: 'Unexpected error occurred' } };
  }
};

// Messaging CRUD functions
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  console.log('Getting conversations for user:', userId);
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      freelancer_id,
      client_id,
      created_at,
      last_message_at,
      last_message,
      freelancer_user:users(
        username,
        display_name
      ),
      client_user:users(
        username,
        display_name
      )
    `)
    .or(`freelancer_id.eq.${userId},client_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
  
  return data || [];
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
  console.log('Getting messages for conversation:', conversationId);
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  
  return data || [];
};

export const createMessage = async (message: Omit<Message, 'id' | 'created_at'>): Promise<{ data: Message | null; error: any }> => {
  console.log('Creating message:', message);
  
  const messageData = {
    ...message,
    created_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();
    
    console.log('Message creation result:', { data, error });
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    // Update conversation's last_message and last_message_at
    if (data && !error) {
      await supabase
        .from('conversations')
        .update({
          last_message: message.content,
          last_message_at: new Date().toISOString()
        })
        .eq('id', message.conversation_id);
    }
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error in createMessage:', err);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

export const createConversation = async (conversation: Omit<Conversation, 'id' | 'created_at'>): Promise<{ data: Conversation | null; error: any }> => {
  console.log('Creating conversation:', conversation);
  
  const conversationData = {
    ...conversation,
    created_at: new Date().toISOString(),
    last_message_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single();
    
    console.log('Conversation creation result:', { data, error });
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error in createConversation:', err);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

export const getRecentActivity = async (userId: string) => {
  const { data } = await supabase
    .from('conversations')
    .select(`
      id,
      created_at,
      client_id,
      last_message,
      updated_at
    `)
    .or(`freelancer_id.eq.${userId},client_id.eq.${userId}`)
    .order('updated_at', { ascending: false })
    .limit(5)
  
  return data?.map((conv: any): ActivityItem => ({
    id: conv.id,
    name: conv.client_id ? 'Client Message' : 'System Update',
    message: conv.last_message || 'New conversation started',
    time: formatTimeAgo(conv.updated_at),
    type: conv.client_id ? 'message' : 'system'
  })) || []
}

export interface ActivityItem {
  id: string;
  name: string;
  message: string;
  time: string;
  type: 'message' | 'system';
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours < 24) return `${diffHours} hours ago`
  return `${diffDays} days ago`
}
