import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isUserClient } from '../utils/supabase';
import ClientMessagesPage from '../pages/messages/ClientMessagesPage';
import FreelancerMessagesPage from '../pages/messages/FreelancerMessagesPage';

export default function RoleBasedMessages() {
  const { user } = useAuth();
  const [isClient, setIsClient] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const clientStatus = await isUserClient(user.id);
        setIsClient(clientStatus);
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsClient(false); // Default to freelancer if there's an error
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/client-login" replace />;
  }

  if (isClient === null) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white">Determining user type...</div>
      </div>
    );
  }

  return isClient ? <ClientMessagesPage /> : <FreelancerMessagesPage />;
}
