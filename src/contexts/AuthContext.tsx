import React, { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, onAuthStateChange } from '../utils/supabase'

interface User {
  id: string
  email?: string
  user_type?: 'freelancer' | 'client'
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

  useEffect(() => {
    // Get initial user and determine role
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          
          // Determine user role by checking which table they exist in
          const { supabase } = await import('../utils/supabase')
          
          // Check if user exists in clients table
          let clientData = null;
          try {
            const result = await supabase
              .from('clients')
              .select('id')
              .eq('user_id', currentUser.id)
              .single();
            clientData = result.data;
          } catch (error) {
            // User doesn't exist in clients table or other error
            clientData = null;
          }
          
          if (clientData) {
            setRole('client')
          } else {
            // Default to freelancer if not in clients table
            setRole('freelancer')
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
        setUser(authUser)
        
        // Determine role on auth change
        const { supabase } = await import('../utils/supabase')
        
        let clientData = null;
        try {
          const result = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', authUser.id)
            .single();
          clientData = result.data;
        } catch (error) {
          // User doesn't exist in clients table or other error
          clientData = null;
        }
        
        if (clientData) {
          setRole('client')
        } else {
          setRole('freelancer')
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
