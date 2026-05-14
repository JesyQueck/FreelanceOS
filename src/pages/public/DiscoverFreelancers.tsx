import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Briefcase, Search, MessageCircle, ExternalLink } from 'lucide-react';
import { getAllPublicFreelancers, checkOrCreateConversation, UserProfile } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DiscoverFreelancers() {
  const { user, role } = useAuth();
  const [freelancers, setFreelancers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFreelancers, setFilteredFreelancers] = useState<UserProfile[]>([]);

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
        window.location.href = `/messages/${result.conversationId}`;
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner text="Discovering freelancers..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)]">
      {/* Premium Background with Dot Grid */}
      <div className="fixed inset-0 dot-grid pointer-events-none" />
      
      {/* Subtle Blur Elements */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-[var(--color-primary)] subtle-blur rounded-full pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-64 h-64 bg-[var(--color-accent)] subtle-blur rounded-full pointer-events-none" />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[var(--color-bg-card)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="bg-[var(--color-primary)] p-1.5 rounded-lg shadow-sm shadow-[var(--color-primary)]/20 flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm text-[var(--color-text-primary)]">Discover</span>
          </div>
          <div className="w-9"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-[var(--color-bg-card)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[var(--color-primary)] p-1.5 rounded-lg shadow-sm shadow-[var(--color-primary)]/20 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-lg text-[var(--color-text-primary)]">Discover Freelancers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 lg:pt-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          {/* Search Section */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                placeholder="Search freelancers by name, skills, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input w-full pl-12"
              />
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
      </div>
    </div>
  );
}
