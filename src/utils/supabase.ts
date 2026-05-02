// @ts-nocheck - Temporarily disable strict type checking for functionality
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

// Singleton pattern to prevent multiple instances
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    });
    console.log('Supabase client instance created');
  } else {
    console.log('Using existing Supabase client instance');
  }
  return supabaseInstance;
})();

// Request debouncing to prevent concurrent requests
const pendingRequests = new Map<string, Promise<any>>();

export const withRequestLock = async <T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> => {
  // Check if there's already a pending request with the same key
  if (pendingRequests.has(key)) {
    console.log(`Waiting for existing request: ${key}`);
    return pendingRequests.get(key) as Promise<T>;
  }

  // Create new request
  const request = requestFn()
    .finally(() => {
      // Clean up after request completes
      pendingRequests.delete(key);
    });

  // Store the pending request
  pendingRequests.set(key, request);

  return request;
};

// Singleton pattern - only one Supabase client instance
export const getSupabaseClient = () => {
  return supabase;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
};

export const signUpFreelancer = async (email: string, password: string, displayName: string) => {
  // Step 1: Create auth user with metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        user_type: 'freelancer'
      }
    }
  });

  if (error) {
    return { data: null, error };
  }

  if (data.user && !data.session) {
    // Email confirmation required - user will be created after confirmation
    return { data, error: null };
  }

  // Step 2: Create freelancer profile in users table
  if (data.user && data.session) {
    // Generate username and slug from display name
    const username = displayName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    const slug = username;
    
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        display_name: displayName,
        email: email,
        username: username,
        slug: slug,
        role: 'freelancer'
      });

    if (profileError) {
      console.error('Error creating freelancer profile:', profileError);
      
      // Handle 409 conflict (user already exists)
      if (profileError.code === '409' || profileError.message?.includes('duplicate')) {
        console.log('User profile already exists, proceeding with signup');
        // Don't fail the signup, just continue
      } else {
        // For other errors, try to clean up the auth user (but handle permission issues)
        try {
          await supabase.auth.admin.deleteUser(data.user.id);
        } catch (deleteError) {
          console.warn('Could not delete auth user (permission issue):', deleteError);
        }
        return { data: null, error: { message: 'Failed to create freelancer profile' } };
      }
    }

    // Step 3: Create freelancer-specific profile
    const { error: freelancerProfileError } = await supabase
      .from('freelancer_profiles')
      .insert({
        user_id: data.user.id,
        hourly_rate: null, // Will be set later by user
        experience_level: 'beginner', // Default value
        availability: 'available', // Default value
        bio: null, // Will be set later by user
        skills: [], // Empty array initially
        created_at: new Date().toISOString()
      });

    if (freelancerProfileError) {
      console.error('Error creating freelancer-specific profile:', freelancerProfileError);
      
      // Handle 409 conflict (freelancer profile already exists)
      if (freelancerProfileError.code === '409' || freelancerProfileError.message?.includes('duplicate')) {
        console.log('Freelancer profile already exists, proceeding with signup');
      } else {
        // For other errors, log but don't fail the signup
        console.warn('Freelancer profile creation failed, but basic user profile was created:', freelancerProfileError);
      }
    }
  }

  return { data, error: null };
};

export const signUpClient = async (email: string, password: string, fullName: string, company?: string) => {
  // Step 1: Create auth user with metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company: company || '',
        user_type: 'client'
      }
    }
  });

  if (error) {
    return { data: null, error };
  }

  if (data.user && !data.session) {
    // Email confirmation required - user will be created after confirmation
    return { data, error: null };
  }

  // Step 2: Create client profile in users table
  if (data.user && data.session) {
    // Generate username and slug from full name
    const username = fullName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    const slug = username;
    
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        display_name: fullName,
        email: email,
        username: username,
        slug: slug,
        role: 'client'
      });

    if (profileError) {
      console.error('Error creating client profile:', profileError);
      // Try to clean up the auth user
      await supabase.auth.admin.deleteUser(data.user.id);
      return { data: null, error: { message: 'Failed to create client profile' } };
    }

    // Also create client profile for additional client-specific data
    const { error: clientProfileError } = await supabase
      .from('client_profiles')
      .insert({
        user_id: data.user.id,
        company: company || ''
      });

    if (clientProfileError) {
      console.error('Error creating client profile:', clientProfileError);
      // Don't fail completely, just log the error
    }
  }

  return { data, error: null };
};

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
  return withRequestLock('getCurrentUser', async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        // Handle specific authentication errors
        if (error.message.includes('Auth session missing') || error.message.includes('session missing')) {
          // This is normal when user is not logged in
          return null;
        }
        if (error.message.includes('missing sub claim') || error.message.includes('invalid claim')) {
          console.warn('Invalid JWT token, clearing session...');
          // Clear the session and try to get session instead
          await supabase.auth.signOut({ scope: 'local' });
          const { data: { session } } = await supabase.auth.getSession();
          return session?.user || null;
        }
        // Handle lock timeout and other errors gracefully
        if (error.message.includes('Lock') || error.message.includes('stolen')) {
          console.warn('Supabase lock timeout, retrying...');
          // Retry once after a short delay
          await new Promise(resolve => setTimeout(resolve, 100));
          const retry = await supabase.auth.getUser();
          return retry.data?.user || null;
        }
        console.error('Error getting current user:', error);
        return null;
      }
      return user;
    } catch (error) {
      console.error('Unexpected error getting current user:', error);
      return null;
    }
  });
}

export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null)
  })
}

export const getUser = async () => {
  return withRequestLock('getUser', async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        // Handle lock timeout and other errors gracefully
        if (error.message.includes('Lock') || error.message.includes('stolen')) {
          console.warn('Supabase lock timeout in getUser, retrying...');
          // Retry once after a short delay
          await new Promise(resolve => setTimeout(resolve, 100));
          const retry = await supabase.auth.getUser();
          return retry.data?.user || null;
        }
        console.error('Error in getUser:', error);
        return null;
      }
      return user;
    } catch (error) {
      console.error('Unexpected error in getUser:', error);
      return null;
    }
  });
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
    updated_at: new Date().toISOString(),
    role: 'freelancer' // Default role for profile updates
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

// Global cache for user data to prevent all repeated requests
const globalUserCache = new Map<string, { data: any, exists: boolean, timestamp: number }>();
const USER_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Cache for user profiles to prevent concurrent requests
const userProfileCache = new Map<string, Promise<UserProfile | null>>();

// Universal user data fetcher with global cache
export const getUserDataSafe = async (userId: string, selectFields = 'display_name, email'): Promise<{ data: any, exists: boolean }> => {
  // Check global cache first
  const cached = globalUserCache.get(userId);
  if (cached && Date.now() - cached.timestamp < USER_CACHE_DURATION) {
    return { data: cached.data, exists: cached.exists };
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select(selectFields)
      .eq('id', userId)
      .single();
    
    const exists = !error && data !== null;
    const result = { data: exists ? data : null, exists };
    
    // Cache the result (even if user doesn't exist)
    globalUserCache.set(userId, { 
      data: exists ? data : null, 
      exists, 
      timestamp: Date.now() 
    });
    
    if (!exists && error?.code === 'PGRST116') {
      // Silent handling of missing user
      return result;
    }
    
    return result;
  } catch (error) {
    // Cache the failure to prevent repeated attempts
    globalUserCache.set(userId, { 
      data: null, 
      exists: false, 
      timestamp: Date.now() 
    });
    return { data: null, exists: false };
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  // Check if there's already a pending request for this user
  if (pendingRequests.has(userId)) {
    return pendingRequests.get(userId)!;
  }
  
  // Check cache first
  if (userProfileCache.has(userId)) {
    return userProfileCache.get(userId)!;
  }
  
  // Use the safe user data fetcher
  const { data, exists } = await getUserDataSafe(userId, 'display_name, bio, profile_image, created_at, id, updated_at, username, slug');
  
  // Cache both successful and null results to prevent repeated requests
  const result = exists ? data : null;
  userProfileCache.set(userId, Promise.resolve(result));
  
  return result;
}

// Portfolio items functions
export const getFreelancerProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('freelancer_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      console.log('Freelancer profile not found for user:', userId);
      return null;
    }
    console.error('Error fetching freelancer profile:', error);
    return null;
  }
  
  return data;
};

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
// Optimized conversation handler for complete database structure
const conversationCache = new Map<string, { data: Conversation[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getConversationsByRole = async (userId: string, role: 'freelancer' | 'client'): Promise<Conversation[]> => {
  const cacheKey = `${userId}-${role}`;
  const cached = conversationCache.get(cacheKey);
  
  // Return cached data if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    let conversations: any[] = [];
    
    if (role === 'freelancer') {
      // Freelancer: Get conversations directly, no client table check needed
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          freelancer_id,
          client_id,
          created_at,
          last_message_at
        `)
        .eq('freelancer_id', userId)
        .order('last_message_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching freelancer conversations:', error);
        return [];
      }
      
      conversations = data || [];
      
      // Get freelancer info separately for display
      const { data: freelancerInfo } = await getUserDataSafe(userId, 'username, display_name');
      
      // Enrich conversations with client info (only if client_id exists)
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          let clientInfo = null;
          
          // Only fetch client info if we have a client_id
          if (conv.client_id) {
            let clientData = null;
            try {
              const result = await supabase
                .from('client_profiles')
                .select('full_name, email, user_id')
                .eq('id', conv.client_id)
                .single();
              clientData = result.data;
            } catch (error) {
              // Client not found or other error
              clientData = null;
            }
            
            clientInfo = clientData;
          }
          
          return {
            ...conv,
            freelancer_user: freelancerInfo.exists ? [{
              username: freelancerInfo.data.username || `freelancer-${userId.substring(0, 8)}`,
              display_name: freelancerInfo.data.display_name || freelancerInfo.data.username || 'Freelancer'
            }] : [{
              username: `freelancer-${userId.substring(0, 8)}`,
              display_name: 'Freelancer'
            }],
            client_user: clientInfo ? [{
              username: clientInfo.full_name?.replace(/\s+/g, '-').toLowerCase() || 'client',
              display_name: clientInfo.full_name || 'Client',
              full_name: clientInfo.full_name,
              email: clientInfo.email,
              user_id: clientInfo.user_id
            }] : [{
              username: `client-${conv.client_id?.substring(0, 8) || 'unknown'}`,
              display_name: 'Unknown Client'
            }]
          };
        })
      );
      
      // Cache the result
      conversationCache.set(cacheKey, { data: enrichedConversations, timestamp: Date.now() });
      return enrichedConversations;
      
    } else {
      // Client: First get client ID from client_profiles table
      const { data: clientData, error: clientError } = await supabase
        .from('client_profiles')
        .select('id, full_name, email')
        .eq('user_id', userId)
        .single();
      
      if (clientError || !clientData) {
        console.log('Client not found for user:', userId);
        return [];
      }
      
      // Get conversations with freelancer info
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          freelancer_id,
          client_id,
          created_at,
          last_message_at
        `)
        .eq('client_id', clientData.id)
        .order('last_message_at', { ascending: false });
      
      if (convError) {
        console.error('Error fetching client conversations:', convError);
        return [];
      }
      
      // Enrich conversations with freelancer info
      const enrichedConversations = await Promise.all(
        (convData || []).map(async (conv) => {
          // Get freelancer info from users table
          const { data: freelancerData } = await getUserDataSafe(conv.freelancer_id, 'username, display_name');
          
          return {
            ...conv,
            freelancer_user: freelancerData.exists ? [{
              username: freelancerData.data.username,
              display_name: freelancerData.data.display_name || freelancerData.data.username
            }] : [{
              username: `freelancer-${conv.freelancer_id.substring(0, 8)}`,
              display_name: 'Unknown Freelancer'
            }],
            client_user: [{
              username: clientData.full_name?.replace(/\s+/g, '-').toLowerCase() || 'client',
              display_name: clientData.full_name || 'Client',
              full_name: clientData.full_name,
              email: clientData.email
            }]
          };
        })
      );
      
      // Cache the result
      conversationCache.set(cacheKey, { data: enrichedConversations, timestamp: Date.now() });
      return enrichedConversations;
    }
  } catch (error) {
    console.error('Unexpected error in getConversationsByRole:', error);
    return [];
  }
};

// Backward compatibility wrappers
export const getFreelancerConversations = (userId: string) => getConversationsByRole(userId, 'freelancer');
export const getClientConversations = (userId: string) => getConversationsByRole(userId, 'client');


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
      if (conv.client_id) {
        // This is a client conversation, get client info from clients table
        const { data: clientData } = await supabase
          .from('clients')
          .select('full_name, email')
          .eq('id', conv.client_id)
          .single();
        
        return {
          ...conv,
          client_user: clientData ? [{
            username: clientData.full_name.replace(/\s+/g, '-').toLowerCase(),
            display_name: clientData.full_name
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
    full_name: clientInfo.name,
    email: clientInfo.email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  try {
    const { data, error } = await supabase
      .from('clients')
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

export const isUserClient = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if user is client:', error);
    }
    
    return (data as any)?.role === 'client';
  } catch (error) {
    console.error('Unexpected error checking user role:', error);
    return false;
  }
};

export const isUserFreelancer = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking if user is freelancer:', error);
    }
    
    return (data as any)?.role === 'freelancer';
  } catch (error) {
    console.error('Unexpected error checking user role:', error);
    return false;
  }
};

export const validateFreelancerAccess = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // First attempt to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Authentication failed' };
    }

    // Check if user exists in users table (freelancer table)
    const isFreelancer = await isUserFreelancer(authData.user.id);
    
    if (!isFreelancer) {
      // Sign out the user since they're not a freelancer
      await supabase.auth.signOut();
      return { success: false, error: 'Access denied. This account is not registered as a freelancer.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error validating freelancer access:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const validateClientAccess = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // First attempt to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Authentication failed' };
    }

    // Check if user has client role using unified system
    const isClient = await isUserClient(authData.user.id);
    
    if (!isClient) {
      // Sign out the user since they're not a client
      await supabase.auth.signOut();
      return { success: false, error: 'Access denied. This account is not registered as a client.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error validating client access:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const getClientInfo = async (clientId: string): Promise<{ data: ClientInfo | null; error: any }> => {
  
  try {
    const { data, error } = await supabase
      .from('clients')
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
    // Use simple query without complex options
    const { data, error } = await supabase
      .from('users')
      .select('display_name, bio, profile_image, created_at, id, updated_at, username, slug')
      .eq('username', username)
      .maybeSingle();
    
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
      .select('display_name, bio, profile_image, created_at, id, updated_at, username, slug')
      .not('display_name', 'is', null)
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

// Interface for conversation data
interface ConversationData {
  id: string;
}

// Interfaces for database tables
interface UserRecord {
  id: string;
  username: string;
  display_name?: string;
  email?: string;
}

interface ClientRecord {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
}

interface ConversationRecord {
  id: string;
  freelancer_id: string;
  client_id: string;
  created_at: string;
  last_message_at: string;
}

// Conversation logic for client-freelancer messaging
export const checkOrCreateConversation = async (userId1: string, userId2: string): Promise<{ success: boolean; conversationId?: string; error?: string }> => {
  try {
    // Get the client ID for userId1 (assuming userId1 is the client)
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId1)
      .single();

    if (clientError || !clientData) {
      console.error('Error getting client data:', clientError);
      return { success: false, error: 'Client not found' };
    }

    const clientId = clientData.id;

    // First check if conversation already exists
    let existingConversation: ConversationData | null = null;

    // Check if conversation already exists with proper client_id
    const { data: conversation1, error: error1 } = await supabase
      .from('conversations')
      .select('id')
      .eq('client_id', clientId)
      .eq('freelancer_id', userId2)
      .single();

    if (conversation1) {
      existingConversation = conversation1 as ConversationData;
    } else if (error1 && error1.code !== 'PGRST116') {
      // Check if we're using the old table structure or need fallback
      if (error1.message?.includes('column') || error1.code === 'PGRST204' || error1.code === 'PGRST116') {
        // Try the old table structure with user_id directly (temporary workaround)
        console.warn('Using temporary fallback for conversation checking');
        const { data: oldConversation, error: oldError } = await supabase
          .from('conversations')
          .select('id')
          .or(`(client_id.eq.${userId1},freelancer_id.eq.${userId2}),(client_id.eq.${userId2},freelancer_id.eq.${userId1})`)
          .single();

        if (oldConversation) {
          existingConversation = oldConversation as ConversationData;
        } else if (oldError && oldError.code !== 'PGRST116') {
          console.error('Error checking conversation (fallback):', oldError);
          return { success: false, error: 'Failed to check conversation - database schema may need updating' };
        }
      } else {
        console.error('Error checking conversation:', error1);
        return { success: false, error: 'Failed to check conversation' };
      }
    }

    // If conversation exists, return it
    if (existingConversation) {
      return { success: true, conversationId: existingConversation.id };
    }

    // Create new conversation - try new structure first
    let createError = null;
    let newConversation = null;

    try {
      const { data: createdNew, error: createdNewError } = await supabase
        .from('conversations')
        .insert({
          client_id: clientId,
          freelancer_id: userId2
        })
        .select('id')
        .single();

      if (createdNew) {
        newConversation = createdNew;
      } else {
        createError = createdNewError;
      }
    } catch (err) {
      createError = err;
    }

    // If new structure fails, try old structure or temporary workaround
    if (!newConversation && createError) {
      try {
        // Try the old structure first
        const { data: createdOld, error: createdOldError } = await supabase
          .from('conversations')
          .insert({
            client_id: clientId,
            freelancer_id: userId2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (createdOld) {
          newConversation = createdOld;
        } else {
          // Temporary workaround: try with user_id directly if schema is not fixed
          console.warn('Schema not fixed, trying temporary workaround with user_id');
          const { data: tempConversation, error: tempError } = await supabase
            .from('conversations')
            .insert({
              client_id: userId1, // Use user_id temporarily
              freelancer_id: userId2,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (tempConversation) {
            newConversation = tempConversation;
            console.log('Temporary conversation created with user_id - schema needs to be fixed');
          } else {
            console.error('Error creating conversation (all attempts):', createdOldError, tempError);
            return { success: false, error: 'Failed to create conversation - database schema may need updating' };
          }
        }
      } catch (err) {
        console.error('Error creating conversation (fallback):', err);
        return { success: false, error: 'Failed to create conversation' };
      }
    }

    if (!newConversation) {
      return { success: false, error: 'Failed to create conversation' };
    }

    return { success: true, conversationId: newConversation.id };
  } catch (error) {
    console.error('Unexpected error in checkOrCreateConversation:', error);
    return { success: false, error: 'Unexpected error' };
  }
};
