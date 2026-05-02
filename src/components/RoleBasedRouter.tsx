import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface RoleBasedRouterProps {
  clientRoute: string
  freelancerRoute: string
}

export default function RoleBasedRouter({ clientRoute, freelancerRoute }: RoleBasedRouterProps) {
  const { user, role } = useAuth()

  // If not logged in, redirect to client login
  if (!user) {
    return <Navigate to="/client-login" replace />
  }

  // Check user role and redirect accordingly using unified system
  if (role === 'client') {
    return <Navigate to={clientRoute} replace />
  } else if (role === 'freelancer') {
    return <Navigate to={freelancerRoute} replace />
  } else {
    // Default to freelancer dashboard if role is not set
    return <Navigate to={freelancerRoute} replace />
  }
}
