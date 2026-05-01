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
  preferences?: any;
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
  freelancer_user?: {
    username?: string;
    display_name?: string;
  }[];
  client_user?: {
    username?: string;
    display_name?: string;
  }[];
}

export interface ClientInfo {
  id: string;
  name: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id?: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at?: string;
}

export const getServices = async (userId: string): Promise<Service[]> => {
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

export const getServicesCount = async (userId: string): Promise<number> => {
  const { count } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count || 0
};

export const getPortfoliosCount = async (userId: string) => {
  const { count } = await supabase
    .from('portfolios')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
  return count || 0
}


export const createOrUpdateUserProfile = async (userId: string, email: string, displayName?: string, name?: string, bio?: string, skills?: string[]) => {
  
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
  
  
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(profileData)
      .select()
      .single();
    
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    } else {
      // Clear cache for this user after successful update
      userProfileCache.delete(userId);
    }
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error in createOrUpdateUserProfile:', err);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
}

export const generateShareLink = (username?: string) => {
  const baseUrl = window.location.origin;
  // Use username for the new client-facing freelancer profile URLs
  return username ? `${baseUrl}/freelancer/${username}` : null;
};

// Function to ensure user has username and slug (for existing users)
export const ensureUserHasSlug = async (userId: string, displayName?: string, email?: string): Promise<{ data: UserProfile | null; error: any }> => {
  try {
    // First get current profile
    const currentProfile = await getUserProfile(userId);
    
    if (!currentProfile || (!currentProfile.username && !currentProfile.slug)) {
      // Generate username and slug
      let username = currentProfile?.username;
      let slug = currentProfile?.slug;
      
      if (!username) {
// Generate clean username from display name or email
        const baseName = displayName || email?.split('@')[0] || 'user';
        username = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Ensure username is not empty
        if (!username) {
          username = 'user';
        }
        
        // Make username unique by adding a short suffix only if needed
        // First try the clean username
        let finalUsername = username;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          try {
            // Check if username already exists
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
              .eq('username', finalUsername)
              .single();
            
            if (!existingUser) {
              // Username is available
              username = finalUsername;
              break;
            }
          } catch (error) {
            // Username doesn't exist (this is good)
            username = finalUsername;
            break;
          }
          
          // Username exists, try with a suffix
          attempts++;
          const suffix = attempts.toString(36); // Use alphanumeric suffix
          finalUsername = username + suffix;
        }
        
        // If all attempts failed, use timestamp as fallback
        if (attempts >= maxAttempts) {
          username = username + Date.now().toString(36);
        }
      }
      
      if (!slug) {
        slug = username;
      }
      
      // Update the user with username and slug
      const { data, error } = await supabase
        .from('users')
        .update({ username, slug, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user with slug:', error);
        return { data: null, error };
      }
      
      // Clear cache
      userProfileCache.delete(userId);
      
      return { data, error: null };
    } else if (currentProfile.username && currentProfile.username.match(/\d+$/)) {
      // Clean up existing username with random numbers
      let username = currentProfile?.username;
      
      // Remove random numbers from existing username
      const cleanUsername = username.replace(/\d+$/, '');
      const baseName = currentProfile.display_name || currentProfile.name || cleanUsername || 'user';
      const newBaseUsername = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Ensure username is not empty
      const finalBaseUsername = newBaseUsername || 'user';
      
      // Make new username unique
      let finalUsername = finalBaseUsername;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        try {
          // Check if username already exists (skip current user's username)
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', finalUsername)
            .neq('id', userId)
            .single();
          
          if (!existingUser) {
            // Username is available
            username = finalUsername;
            break;
          }
        } catch (error) {
          // Username doesn't exist (this is good)
          username = finalUsername;
            break;
        }
        
        // Username exists, try with a suffix
        attempts++;
        const suffix = attempts.toString(36); // Use alphanumeric suffix
        finalUsername = finalBaseUsername + suffix;
      }
      
      // If all attempts failed, use timestamp as fallback
      if (attempts >= maxAttempts) {
        username = finalBaseUsername + Date.now().toString(36);
      }
      
      // Update the user with clean username
      const { data, error } = await supabase
        .from('users')
        .update({ username, slug: username, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user with clean username:', error);
        return { data: null, error };
      }
      
      // Clear cache
      userProfileCache.delete(userId);
      
      return { data, error: null };
    }
    
    return { data: currentProfile, error: null };
  } catch (error) {
    console.error('Error ensuring user has slug:', error);
    return { data: null, error };
  }
}

// Cache for user profiles to prevent concurrent requests
const userProfileCache = new Map<string, Promise<UserProfile | null>>();
const pendingRequests = new Map<string, Promise<UserProfile | null>>();

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  
  // Check if there's already a pending request for this user
  if (pendingRequests.has(userId)) {
    return pendingRequests.get(userId)!;
  }
  
  // Check cache first
  if (userProfileCache.has(userId)) {
    return userProfileCache.get(userId)!;
  }
  
  // Create new request promise
  const requestPromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('display_name, name, bio, skills, profile_image, created_at, email, id, updated_at, username, slug')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      } else {
        return data;
      }
    } catch (error) {
      console.error('Unexpected error in getUserProfile:', error);
      return null;
    } finally {
      // Clean up pending request
      pendingRequests.delete(userId);
    }
  })();
  
  // Store pending request
  pendingRequests.set(userId, requestPromise);
  
  // Cache the result
  userProfileCache.set(userId, requestPromise);
  
  return requestPromise;
}

// Portfolio items functions
export const getPortfolioItems = async (userId: string): Promise<PortfolioItem[]> => {
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
  
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    
    
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
  
  try {
    const { error } = await supabase
      .from('portfolios')
      .delete()
      .eq('id', id);
    
    
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
export const getConversationsCount = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .or(`freelancer_id.eq.${userId},client_id.eq.${userId}`);
      
  if (error) {
    console.error('Error fetching conversations count:', error);
    return 0;
  }
      
  return data?.length || 0;
};

export const getActiveClientsCount = async (freelancerId: string): Promise<number> => {
      
  // Get conversations with messages in the last 7 days (considered active)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
  const { data, error } = await supabase
    .from('conversations')
    .select('id, last_message_at')
    .eq('freelancer_id', freelancerId)
    .gte('last_message_at', sevenDaysAgo);
      
  if (error) {
    console.error('Error fetching active clients count:', error);
    return 0;
  }
      
  return data?.length || 0;
};

export const createService = async (service: Omit<Service, 'id' | 'user_id' | 'created_at' | 'updated_at'>, userId: string): Promise<{ data: Service | null; error: any }> => {
      
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
  
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    
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
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      freelancer_id,
      client_id,
      created_at,
      last_message_at,
      freelancer_user:users!freelancer_id(
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
  
  // For client conversations, we need to get client info separately
  const conversationsWithClientInfo = await Promise.all(
    (data || []).map(async (conv) => {
      if (conv.client_id && conv.client_id.startsWith('client-')) {
        // This is a client conversation, get client info from client_info table
        const { data: clientData } = await supabase
          .from('client_info')
          .select('name, email')
          .eq('id', conv.client_id)
          .single();
        
        return {
          ...conv,
          client_user: clientData ? [{
            username: clientData.name.replace(/\s+/g, '-').toLowerCase(),
            display_name: clientData.name
          }] : []
        };
      }
      return conv;
    })
  );
  
  return conversationsWithClientInfo;
};

export const getMessages = async (conversationId: string): Promise<Message[]> => {
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
    
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    // Update conversation's last_message_at
    if (data && !error) {
      await supabase
        .from('conversations')
        .update({
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

// Client information management
export const createOrUpdateClient = async (clientInfo: Omit<ClientInfo, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: ClientInfo | null; error: any }> => {
  
  // Generate a unique client ID based on email or name + timestamp
  const clientId = clientInfo.email 
    ? `client-${clientInfo.email.replace(/[^a-zA-Z0-9]/g, '')}`
    : `client-${clientInfo.name.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`;
  
  const clientData = {
    id: clientId,
    ...clientInfo,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('client_info')
      .upsert(clientData, { onConflict: 'id' })
      .select()
      .single();
    
    
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
    console.error('Unexpected error in createOrUpdateClient:', err);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

export const getClientInfo = async (clientId: string): Promise<{ data: ClientInfo | null; error: any }> => {
  
  try {
    const { data, error } = await supabase
      .from('client_info')
      .select('*')
      .eq('id', clientId)
      .single();
    
    if (error) {
      console.error('Error fetching client info:', error);
    }
    
    return { data, error };
  } catch (err) {
    console.error('Unexpected error in getClientInfo:', err);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

export const createConversation = async (conversation: Omit<Conversation, 'id' | 'created_at'>): Promise<{ data: Conversation | null; error: any }> => {
  
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
    console.error('Unexpected error in createMessage:', err);
    return { data: null, error: { message: 'Unexpected error occurred' } };
  }
};

export const getRecentActivity = async (userId: string): Promise<ActivityItem[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id,
      created_at,
      client_id,
      last_message_at,
      updated_at
    `)
    .or(`freelancer_id.eq.${userId}`)
    .order('updated_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
  
  return data?.map((conv: any): ActivityItem => ({
    id: conv.id,
    name: conv.client_id ? 'Client Message' : 'System Update',
    message: 'New conversation started',
    time: formatTimeAgo(conv.updated_at),
    type: conv.client_id ? 'message' : 'system'
  })) || [];
};

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

// Public profile functions for freelancer discovery
export const getPublicUserProfile = async (username: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('display_name, name, bio, skills, profile_image, created_at, email, id, updated_at, username, slug')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error fetching public user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error in getPublicUserProfile:', error);
    return null;
  }
};

export const getPublicPortfolioItems = async (userId: string): Promise<PortfolioItem[]> => {
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching public portfolio items:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getPublicPortfolioItems:', error);
    return [];
  }
};

export const getPublicServices = async (userId: string): Promise<Service[]> => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching public services:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getPublicServices:', error);
    return [];
  }
};

export const getAllPublicFreelancers = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('display_name, name, bio, skills, profile_image, created_at, email, id, updated_at, username, slug')
      .not('display_name', 'is', null)
      .not('bio', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching public freelancers:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Unexpected error in getAllPublicFreelancers:', error);
    return [];
  }
};

// Conversation logic for client-freelancer messaging
export const checkOrCreateConversation = async (clientId: string, freelancerId: string): Promise<{ success: boolean; conversationId?: string; error?: string }> => {
  try {
    // First check if conversation already exists (try both directions)
    let existingConversation = null;
    let checkError = null;

    // Try client->freelancer direction
    const { data: conversation1, error: error1 } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', clientId)
      .eq('freelancer_id', freelancerId)
      .single();

    if (conversation1) {
      existingConversation = conversation1;
    } else if (error1 && error1.code !== 'PGRST116') {
      checkError = error1;
    }

    // Try freelancer->client direction if not found
    if (!existingConversation && (!error1 || error1.code === 'PGRST116')) {
      const { data: conversation2, error: error2 } = await supabase
        .from('conversations')
        .select('id')
        .eq('client_id', freelancerId)
        .eq('freelancer_id', clientId)
        .single();

      if (conversation2) {
        existingConversation = conversation2;
      } else if (error2 && error2.code !== 'PGRST116') {
        checkError = error2;
      }
    }

    if (checkError) {
      console.error('Error checking conversation:', checkError);
      return { success: false, error: 'Failed to check conversation' };
    }

    // If conversation exists, return it
    if (existingConversation) {
      return { success: true, conversationId: existingConversation.id };
    }

    // Create new conversation
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        client_id: clientId,
        freelancer_id: freelancerId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      return { success: false, error: 'Failed to create conversation' };
    }

    return { success: true, conversationId: newConversation.id };
  } catch (error) {
    console.error('Unexpected error in checkOrCreateConversation:', error);
    return { success: false, error: 'Unexpected error' };
  }
};
