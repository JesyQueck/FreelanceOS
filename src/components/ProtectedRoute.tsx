import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'freelancer' | 'client'
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading, role } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    // Redirect to appropriate login based on required role
    if (requiredRole === 'client') {
      return <Navigate to="/client-login" replace />
    }
    return <Navigate to="/login" replace />
  }

  // Check if user has required role
  if (requiredRole && role !== requiredRole) {
    // Redirect to appropriate login for the required role
    if (requiredRole === 'freelancer') {
      return <Navigate to="/login" replace />
    } else if (requiredRole === 'client') {
      return <Navigate to="/client-login" replace />
    }
  }

  return <>{children}</>
}

// Role-specific protected routes
export const FreelancerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="freelancer">{children}</ProtectedRoute>
)

export const ClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="client">{children}</ProtectedRoute>
)

export default ProtectedRoute
