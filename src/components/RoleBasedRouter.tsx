import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface RoleBasedRouterProps {
  clientRoute: string
  freelancerRoute: string
}

export default function RoleBasedRouter({ clientRoute, freelancerRoute }: RoleBasedRouterProps) {
  const { user } = useAuth()

  // If not logged in, redirect to client login
  if (!user) {
    return <Navigate to="/client-login" replace />
  }

  // Check user role and redirect accordingly
  // For now, we'll use a simple check - in a real app, you'd have a role field in the user profile
  const isClient = !user.email?.includes('freelancer') // Simple heuristic - can be improved
  
  if (isClient) {
    return <Navigate to={clientRoute} replace />
  } else {
    return <Navigate to={freelancerRoute} replace />
  }
}
