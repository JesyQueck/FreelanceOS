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
  }

  const determineUserRole = async (userId: string): Promise<'freelancer' | 'client'> => {
    try {
      const { supabase } = await import('../utils/supabase')
      
      // Check if user exists in clients table
      const { data: clientData, error } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', userId)
        .single()
      
      // Handle different error cases
      if (error) {
        if (error.code === 'PGRST116') {
          // User not found in clients table - they're a freelancer
          return 'freelancer'
        } else if (error.message?.includes('401') || error.details?.includes('Unauthorized')) {
          // Unauthorized - user doesn't have permission to access clients table
          // This likely means they're a freelancer (clients can't access other clients' data)
          console.log('User does not have access to clients table, assuming freelancer role')
          return 'freelancer'
        } else {
          // Other error - default to freelancer
          console.log('Error checking client table, defaulting to freelancer:', error)
          return 'freelancer'
        }
      }
      
      return clientData ? 'client' : 'freelancer'
    } catch (error) {
      // Default to freelancer if not in clients table or error
      console.log('Unexpected error in determineUserRole, defaulting to freelancer:', error)
      return 'freelancer'
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
        
        // Only determine role if it's not already set or if user changed
        if (!role || user?.id !== authUser.id) {
          const userRole = await determineUserRole(authUser.id)
          if (mounted) {
            setRole(userRole)
            handlePostLoginRouting(userRole)
          }
        }
      } else {
        setUser(null)
        setRole(null)
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

