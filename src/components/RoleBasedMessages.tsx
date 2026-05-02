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
    // Default to freelancer messages if role is not set
    return <FreelancerMessagesPage />;
  }
}
