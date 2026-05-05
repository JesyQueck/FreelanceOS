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
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex gap-1 mb-4">
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <div className="text-[#A0A0A0]">Loading...</div>
        </div>
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
