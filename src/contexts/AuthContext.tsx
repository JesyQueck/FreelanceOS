import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, onAuthStateChange } from '../utils/supabase'

interface User {
  id: string
  email?: string
  role?: 'freelancer' | 'client'
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

  const logout = async () => {
    const { supabase } = await import('../utils/supabase')
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
  }

  const handlePostLoginRouting = (userRole: 'freelancer' | 'client') => {
    // Check for stored freelancer_id from client entry flow
    const pendingFreelancerId = localStorage.getItem('pending_freelancer_id')
    
    if (pendingFreelancerId && userRole === 'client') {
      // Client was trying to message a freelancer, redirect to messages
      localStorage.removeItem('pending_freelancer_id')
      window.location.href = `/messages`
    } else if (userRole === 'freelancer') {
      // Freelancer goes to dashboard
      window.location.href = `/dashboard`
    } else if (userRole === 'client') {
      // Client goes to messages portal
      window.location.href = `/messages`
    }
  }

  useEffect(() => {
    // Get initial user and determine role
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          // Get user with role from unified users table
          const { supabase } = await import('../utils/supabase')
          
          const { data: userData, error } = await supabase
            .from('users')
            .select('id, email, role, display_name')
            .eq('id', currentUser.id)
            .single();
          
          if (error) {
            console.error('Error fetching user data:', error)
            setUser(null)
            setRole(null)
          } else if (userData) {
            const user: User = {
              id: (userData as any).id,
              email: (userData as any).email,
              role: (userData as any).role as 'freelancer' | 'client',
              display_name: (userData as any).display_name
            };
            setUser(user)
            setRole((userData as any).role as 'freelancer' | 'client' | null)
            
            // Handle post-login routing
            handlePostLoginRouting((userData as any).role as 'freelancer' | 'client')
          } else {
            setUser(null)
            setRole(null)
          }
        } else {
          setUser(null)
          setRole(null)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setUser(null)
        setRole(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (authUser) => {
      if (authUser) {
        // Get user with role from unified users table
        const { supabase } = await import('../utils/supabase')
        
        const { data: userData, error } = await supabase
          .from('users')
          .select('id, email, role, display_name')
          .eq('id', authUser.id)
          .single();
        
        if (error) {
          console.error('Error fetching user data on auth change:', error)
          setUser(null)
          setRole(null)
        } else if (userData) {
          const user: User = {
            id: (userData as any).id,
            email: (userData as any).email,
            role: (userData as any).role as 'freelancer' | 'client',
            display_name: (userData as any).display_name
          };
          setUser(user)
          setRole((userData as any).role as 'freelancer' | 'client' | null)
          
          // Handle post-login routing
          handlePostLoginRouting((userData as any).role as 'freelancer' | 'client')
        } else {
          setUser(null)
          setRole(null)
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
