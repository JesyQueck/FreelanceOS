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

export const createOrUpdateUserProfile = async (userId: string, email: string, name?: string) => {
  console.log('createOrUpdateUserProfile called with:', { userId, email, name });
  
  const profileData = {
    id: userId,
    email: email,
    name: name || email.split('@')[0],
    updated_at: new Date().toISOString()
  };
  
  console.log('Profile data to upsert:', profileData);
  
  const { data, error } = await supabase
    .from('users')
    .upsert(profileData)
    .select()
    .single()
  
  console.log('Upsert result:', { data, error });
  
  return { data, error }
}

export const getUserProfile = async (userId: string) => {
  console.log('Getting user profile for ID:', userId);
  const { data, error } = await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user profile:', error);
  }
  
  console.log('User profile data:', data);
  return data
}

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
