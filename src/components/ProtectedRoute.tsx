import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from './LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'freelancer' | 'client'
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading, role } = useAuth()

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner text="Loading..." />
      </div>
    )
  }

  if (!user) {
    // Redirect to main login page for all users
    return <Navigate to="/login" replace />
  }

  // Check if user has required role
  if (requiredRole && role !== requiredRole) {
    // Redirect to main login for any role mismatch
    return <Navigate to="/login" replace />
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
