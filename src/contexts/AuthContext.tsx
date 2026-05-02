import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChange } from '../utils/supabase'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  email?: string
  user_type?: 'freelancer' | 'client'
  display_name?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  role: 'freelancer' | 'client' | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<'freelancer' | 'client' | null>(null)
  const [roleCache, setRoleCache] = useState<Map<string, 'freelancer' | 'client'>>(new Map())

  // Convert Supabase User to our User interface
  const convertUser = (supabaseUser: SupabaseUser): User => ({
    id: supabaseUser.id,
    email: supabaseUser.email,
    user_type: supabaseUser.user_metadata?.user_type,
    display_name: supabaseUser.user_metadata?.display_name
  })

  const logout = async () => {
    const { supabase } = await import('../utils/supabase')
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    // Clear role cache on logout
    setRoleCache(new Map())
    // Read cache to satisfy TypeScript (this is a workaround for false positive warning)
    void roleCache.size
  }

  
  const determineUserRole = async (userId: string): Promise<'freelancer' | 'client'> => {
    // Check cache first to prevent repeated requests
    if (roleCache.has(userId)) {
      const cachedRole = roleCache.get(userId)!
      console.log('Using cached role for user', userId, ':', cachedRole)
      return cachedRole
    }

    try {
      const { supabase } = await import('../utils/supabase')
      
      // Get role from users table - this is the correct approach
      const { data: userData, error } = await supabase
        .from('users')
        .select('role, display_name, email')
        .eq('id', userId)
        .single() as { data: { role: string; display_name?: string; email?: string } | null; error: any };
      
      console.log('Role detection for user', userId, 'Data:', userData, 'Error:', error);
      
      let userRole: 'freelancer' | 'client'
      
      // Handle different error cases
      if (error) {
        if (error.code === 'PGRST116') {
          // User not found in users table - this shouldn't happen but default to freelancer
          console.log('User not found in users table, defaulting to freelancer')
          userRole = 'freelancer'
        } else {
          // Other error - default to freelancer
          console.log('Error checking user role, defaulting to freelancer:', error)
          userRole = 'freelancer'
        }
      } else if (userData) {
        // Use the actual role from the database
        userRole = userData?.role === 'client' ? 'client' : 'freelancer'
        console.log('User role determined:', userRole, 'from database role:', userData?.role)
      } else {
        // No data found, default to freelancer
        console.log('No user data found, defaulting to freelancer')
        userRole = 'freelancer'
      }
      
      // Cache the result to prevent repeated requests
      setRoleCache(prev => new Map(prev.set(userId, userRole)))
      
      return userRole
    } catch (error) {
      // Default to freelancer if error
      console.log('Unexpected error in determineUserRole, defaulting to freelancer:', error)
      const fallbackRole = 'freelancer'
      setRoleCache(prev => new Map(prev.set(userId, fallbackRole)))
      return fallbackRole
    }
  }

  const handlePostLoginRouting = (userRole: 'freelancer' | 'client') => {
    // Check for stored freelancer_id from client entry flow
    const pendingFreelancerId = localStorage.getItem('pending_freelancer_id')
    
    if (pendingFreelancerId && userRole === 'client') {
      // Client was trying to message a freelancer, redirect to messages
      localStorage.removeItem('pending_freelancer_id')
      // Use window.location for this specific case since it's a post-login redirect
      window.location.href = `/messages`
    }
    // For other cases, let the routing components handle navigation
    // This prevents infinite refresh loops
  }

  useEffect(() => {
    let mounted = true
    
    // Get initial user and determine role
    const initializeAuth = async () => {
      try {
        // Use a single auth call to prevent lock conflicts
        const { supabase } = await import('../utils/supabase')
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted && session?.user) {
          setUser(convertUser(session.user))
          
          // Determine role separately to avoid auth lock conflicts
          const userRole = await determineUserRole(session.user.id)
          if (mounted) {
            setRole(userRole)
            handlePostLoginRouting(userRole)
          }
        } else if (mounted) {
          setUser(null)
          setRole(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        if (mounted) {
          setUser(null)
          setRole(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes with debouncing to prevent conflicts
    const { data: { subscription } } = onAuthStateChange(async (authUser) => {
      if (!mounted) return
      
      if (authUser) {
        setUser(convertUser(authUser))
        
        // Clear role cache when user changes to ensure fresh detection
        if (user?.id !== authUser.id) {
          setRoleCache(new Map())
        }
        
        // Always determine role for fresh login
        const userRole = await determineUserRole(authUser.id)
        if (mounted) {
          setRole(userRole)
          handlePostLoginRouting(userRole)
        }
      } else {
        setUser(null)
        setRole(null)
        setRoleCache(new Map())
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, role, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

