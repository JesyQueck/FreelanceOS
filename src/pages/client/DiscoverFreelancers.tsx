import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Search, MessageCircle, ExternalLink } from 'lucide-react';
import { getAllPublicFreelancers, checkOrCreateConversation, UserProfile } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DiscoverFreelancers() {
  const { user, role } = useAuth();
  const [freelancers, setFreelancers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFreelancers, setFilteredFreelancers] = useState<UserProfile[]>([]);

  const handleMessageFreelancer = async (freelancerId: string, username: string) => {
    if (!user) {
      // Store freelancer_id temporarily and redirect to client login
      localStorage.setItem('pending_freelancer_id', freelancerId);
      window.location.href = '/client-login';
      return;
    }

    // Check if user has client role using unified system
    if (role !== 'client') {
      // Store freelancer_id temporarily and redirect to client login
      localStorage.setItem('pending_freelancer_id', freelancerId);
      window.location.href = '/client-login';
      return;
    }

    try {
      // Find freelancer's display name
      const freelancer = freelancers.find(f => f.id === freelancerId);
      const freelancerName = freelancer?.display_name || username;

      // Check if conversation already exists or create new one
      const result = await checkOrCreateConversation(user.id, freelancerId, freelancerName);
      
      if (result.success && result.conversationId) {
        // Navigate to the conversation
        window.location.href = `/client-dashboard/messages?conversation=${result.conversationId}`;
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        setLoading(true);
        const data = await getAllPublicFreelancers();
        setFreelancers(data);
        setFilteredFreelancers(data);
      } catch (error) {
        console.error('Error fetching freelancers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, []);

  useEffect(() => {
    const filtered = freelancers.filter(freelancer => 
      freelancer.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      freelancer.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFreelancers(filtered);
  }, [searchTerm, freelancers]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner text="Discovering freelancers..." />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Discover Freelancers</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder="Search freelancers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]/50 w-full sm:w-auto text-base"
            />
          </div>
        </div>
      </div>

      {/* Freelancers Grid */}
      {filteredFreelancers.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-[var(--color-bg-card)]/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--color-border)]/50">
            <UserCircle className="h-12 w-12 text-[var(--color-primary)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3">
            {searchTerm ? 'No freelancers found' : 'No freelancers available'}
          </h3>
          <p className="text-[var(--color-text-secondary)] mb-6 max-w-md mx-auto">
            {searchTerm 
              ? 'Try adjusting your search terms to find more freelancers.'
              : 'Check back later for talented freelancers to join platform.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFreelancers.map((freelancer) => (
            <div key={freelancer.id} className="card p-6 hover:scale-[1.02] animate-slide-in" style={{ animationDelay: `${Math.random() * 200}ms` }}>
              {/* Profile Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  {freelancer.profile_image ? (
                    <img
                      src={freelancer.profile_image}
                      alt={freelancer.display_name || 'Freelancer'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[var(--color-bg-card)]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[var(--color-primary)]/20">
                      {freelancer.display_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--color-success)] rounded-full border-2 border-[var(--color-bg-card)]"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[var(--color-text-primary)] font-semibold text-base truncate">
                    {freelancer.display_name || 'Freelancer'}
                  </h3>
                  <p className="text-[var(--color-text-secondary)] text-sm">Freelancer</p>
                </div>
              </div>

              {/* Bio Preview */}
              {freelancer.bio && (
                <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2 leading-relaxed">
                  {freelancer.bio}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  to={`/freelancer/${freelancer.username}`}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Profile
                </Link>
                <button
                  onClick={() => handleMessageFreelancer(freelancer.id!, freelancer.username!)}
                  className="btn btn-primary flex-1 text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
