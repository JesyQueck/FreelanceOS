import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ClientMessagesPage from '../pages/messages/ClientMessagesPage';
import FreelancerMessagesPage from '../pages/messages/FreelancerMessagesPage';

export default function RoleBasedMessages() {
  const { user, role } = useAuth();

  if (!user) {
    return <Navigate to="/client-login" replace />;
  }

  // Use unified role system to determine which messages page to show
  if (role === 'client') {
    return <ClientMessagesPage />;
  } else if (role === 'freelancer') {
    return <FreelancerMessagesPage />;
  } else {
    // If role is not set, redirect to client login to re-authenticate
    console.log('Role not detected, redirecting to client login');
    return <Navigate to="/client-login" replace />;
  }
}
