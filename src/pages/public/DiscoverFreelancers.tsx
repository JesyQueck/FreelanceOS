import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Briefcase, Search, MessageCircle, ExternalLink } from 'lucide-react';
import { getAllPublicFreelancers, checkOrCreateConversation, UserProfile } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function DiscoverFreelancers() {
  const { user } = useAuth();
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
      // Store the intended action and redirect to login
      sessionStorage.setItem('redirectAfterLogin', `/freelancer/${username}`);
      sessionStorage.setItem('intendedAction', 'message');
      window.location.href = '/login';
      return;
    }

    try {
      // Check if conversation already exists or create new one
      const result = await checkOrCreateConversation(user.id, freelancerId);
      
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
      <div className="min-h-screen bg-gradient-to-br from-black via-[#0A0A0A] to-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex gap-1 mb-4">
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <div className="text-[#A0A0A0]">Discovering talented freelancers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0A0A0A] to-black">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#1A1A1A]/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-[#FFD700] to-[#FFC700] p-1.5 rounded-lg text-black shadow-lg flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">Discover</span>
              <p className="text-xs text-[#A0A0A0]">Find talented freelancers</p>
            </div>
          </div>
          <div className="w-9"></div> {/* Spacer for balance */}
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#1A1A1A]/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[#FFD700] to-[#FFC700] p-1.5 rounded-lg text-black shadow-lg flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-white">Discover Freelancers</span>
                <p className="text-xs text-[#A0A0A0]">Find and connect with talented professionals</p>
              </div>
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
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
              <input
                type="text"
                placeholder="Search freelancers by name, skills, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#2A2A2A]/50 rounded-lg pl-12 pr-4 py-4 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent shadow-sm transition-all duration-200"
              />
            </div>
          </div>

          {/* Freelancers Grid */}
          {filteredFreelancers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-[#1A1A1A]/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#2A2A2A]/50">
                <UserCircle className="h-12 w-12 text-[#FFD700]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {searchTerm ? 'No freelancers found' : 'No freelancers available'}
              </h3>
              <p className="text-[#A0A0A0] mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms to find more freelancers.'
                  : 'Check back later for talented freelancers to join the platform.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFreelancers.map((freelancer) => (
                <div key={freelancer.id} className="group bg-[#0A0A0A]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#1A1A1A]/50 shadow-sm hover:shadow-xl hover:border-[#FFD700]/50 transition-all duration-300 hover:scale-105">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      {freelancer.profile_image ? (
                        <img 
                          src={freelancer.profile_image} 
                          alt={freelancer.display_name || 'Freelancer'} 
                          className="w-16 h-16 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFC700] flex items-center justify-center text-black text-xl font-bold shadow-sm group-hover:shadow-md transition-shadow">
                          {freelancer.display_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0A0A0A] animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate group-hover:text-[#FFD700] transition-colors">
                        {freelancer.display_name || 'Freelancer'}
                      </h3>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <p className="text-[#A0A0A0] text-sm">Available</p>
                      </div>
                    </div>
                  </div>

                  {/* Bio Preview */}
                  {freelancer.bio && (
                    <p className="text-[#A0A0A0] text-sm mb-4 line-clamp-2 leading-relaxed">
                      {freelancer.bio}
                    </p>
                  )}

                  {/* Skills Preview */}
                  {freelancer.skills && freelancer.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {freelancer.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-[#1A1A1A]/50 text-[#FFD700] text-xs rounded-full border border-[#FFD700]/20">
                            {skill}
                          </span>
                        ))}
                        {freelancer.skills.length > 3 && (
                          <span className="px-2 py-1 bg-[#1A1A1A]/50 text-[#A0A0A0] text-xs rounded-full">
                            +{freelancer.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/freelancer/${freelancer.username}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1A1A1A]/50 hover:bg-[#2A1A1A]/50 text-white rounded-lg transition-all duration-200 text-sm border border-[#2A2A2A]/50 hover:border-[#FFD700]/30"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Profile
                    </Link>
                    <button
                      onClick={() => handleMessageFreelancer(freelancer.id!, freelancer.username!)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-br from-[#FFD700] to-[#FFC700] hover:from-[#FFC700] hover:to-[#FFD700] text-black rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md hover:scale-105"
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
