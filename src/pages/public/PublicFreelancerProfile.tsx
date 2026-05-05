import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserCircle, Mail, Briefcase, MessageCircle, ArrowLeft, ExternalLink, CheckCircle2 } from 'lucide-react';
import { getPublicUserProfile, getPublicPortfolioItems, getPublicServices, checkOrCreateConversation, UserProfile, PortfolioItem, Service } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ClientAuthModal from '../../components/ClientAuthModal';

export default function PublicFreelancerProfile() {
  const { username } = useParams<{ username: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  // @ts-ignore: False positive - error is used in setError calls
  const [error, setError] = useState<string | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);
  const [showClientAuthModal, setShowClientAuthModal] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username || !mountedRef.current) {
        if (mountedRef.current) {
          setError('Freelancer not found');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch public profile data
        const profileData = await getPublicUserProfile(username);
        if (!profileData || !mountedRef.current) {
          if (mountedRef.current) {
            setError('Freelancer profile not found');
          }
          return;
        }
        setProfile(profileData);

        // Fetch portfolio items and services in parallel
        const [portfolioData, servicesData] = await Promise.all([
          getPublicPortfolioItems(profileData.id!),
          getPublicServices(profileData.id!)
        ]);
        
        setPortfolioItems(portfolioData);
        setServices(servicesData);
        
        // Freelancer-specific data is not exposed to public for security
        
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setProfile(null);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [user, role]);

  const handleMessageFreelancer = async () => {
    // Check if user is client (not freelancer) - only clients can access public profiles
    if (role !== 'client') {
      // Store freelancer_id temporarily and show client auth modal
      localStorage.setItem('pending_freelancer_id', profile?.id || '');
      setShowClientAuthModal(true);
      return;
    }

    if (!profile) return;

    setMessageLoading(true);
    try {
      // Use unified conversation system
      const result = await checkOrCreateConversation(user!.id, profile.id!);
      
      if (result.success && result.conversationId) {
        // Clear any stored freelancer_id and navigate to conversation
        localStorage.removeItem('pending_freelancer_id');
        navigate(`/messages/${result.conversationId}`);
      } else {
        setError(result.error || 'Failed to start conversation');
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex gap-1 mb-4">
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <div className="text-[#A0A0A0]">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-white">Freelancer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#1A1A1A]">
        <div className="flex items-center justify-start px-4 py-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#FFD700] p-1.5 rounded-lg text-black shadow-sm flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-white">FreelanceOS</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#1A1A1A]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-[#FFD700] p-1.5 rounded-lg text-black shadow-sm flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-white">FreelanceOS</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-[#A0A0A0] hover:text-[#FFD700] transition-colors">
                Discover Freelancers
              </Link>
              <Link to="/client-login" className="text-[#FFD700] hover:text-[#FFC700] transition-colors">
                Client Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-6">
              {/* Profile Image */}
              <div className="relative">
                {profile.profile_image ? (
                  <img 
                    src={profile.profile_image} 
                    alt={profile.display_name || user?.email || 'Profile'} 
                    className="w-32 h-32 rounded-2xl object-cover shadow-lg border-2 border-[#FFD700]"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
                    <UserCircle className="h-12 w-12 text-[#A0A0A0]" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">
                    {profile.name || profile.display_name}
                  </h1>
                  <p className="text-[#A0A0A0] mb-3">Freelancer</p>
                  <div className="flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">Verified</span>
                  </div>
                </div>

                {/* About Section */}
                {profile.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">About</h3>
                    <p className="text-[#A0A0A0] leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Skills Section */}
                {profile.skills && profile.skills.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-[#1A1A1A] text-white rounded-lg text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-5 w-5 text-[#FFD700]" />
                    <div>
                      <p className="text-xs text-[#A0A0A0]">Display Name</p>
                      <p className="text-sm text-white">{profile.display_name || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-[#FFD700]" />
                    <div>
                      <p className="text-xs text-[#A0A0A0]">Contact</p>
                      <p className="text-sm text-white">Available for work</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Portfolio & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Message Button */}
            <div className="pt-4">
              <button
                onClick={handleMessageFreelancer}
                disabled={messageLoading}
                className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-[#FFC700] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {messageLoading ? (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                ) : (
                  <>
                    <MessageCircle className="h-5 w-5" />
                    Message Freelancer
                  </>
                )}
              </button>
            </div>

            {/* Services Section - Horizontal Scroll */}
            {services.length > 0 && (
              <div className="bg-[#0A0A0A] rounded-2xl p-6 lg:p-8 border border-[#1A1A1A] shadow-sm mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-6">Services</h2>
                <div className="overflow-x-auto">
                  <div className="flex gap-4 min-w-max pb-2">
                    {services.map((service) => (
                      <div key={service.id} className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A] hover:border-[#FFD700]/50 transition-all min-w-[280px] flex-shrink-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 bg-[#FFD700]/10 rounded-lg">
                            <Briefcase className="h-5 w-5 text-[#FFD700]" />
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            service.status === 'active' 
                              ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30' 
                              : 'bg-[#1A1A1A]/10 text-[#A0A0A0] border border-[#2A2A2A]/20'
                          }`}>
                            {service.status === 'active' ? 'Available' : 'Draft'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                        <p className="text-[#A0A0A0] text-sm mb-4 leading-relaxed">{service.description || 'No description provided'}</p>
                        <div className="space-y-2">
                          {service.price && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[#FFD700]">{service.price}</span>
                            </div>
                          )}
                          {service.timeline && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#A0A0A0]">{service.timeline}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Section */}
            {portfolioItems.length > 0 && (
              <div className="bg-[#0A0A0A] rounded-2xl p-6 lg:p-8 border border-[#1A1A1A] shadow-sm">
                <h2 className="text-xl lg:text-2xl font-bold text-white mb-6">Portfolio</h2>
                <div className="overflow-x-auto">
                  <div className="flex gap-4 min-w-max pb-2">
                    {portfolioItems.map((item) => (
                      <div key={item.id} className="group relative bg-[#1A1A1A]/50 rounded-xl overflow-hidden border border-[#2A2A2A]/50 hover:border-[#FFD700]/50 transition-all duration-300 min-w-[320px] flex-shrink-0">
                        <div className="aspect-video bg-[#2A2A2A]/50 relative overflow-hidden">
                          {item.image_url ? (
                            <img 
                              src={item.image_url} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-[#FFD700]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                                  <Briefcase className="h-6 w-6 text-[#FFD700]" />
                                </div>
                                <span className="text-[#A0A0A0] text-xs">No Image</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="text-white font-semibold mb-2 line-clamp-1">{item.title}</h4>
                          <p className="text-[#A0A0A0] text-sm mb-3 line-clamp-2">{item.description || 'No description provided'}</p>
                          {item.external_link && (
                            <a
                              href={item.external_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-[#FFD700] hover:text-[#FFC700] transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Project
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Client Auth Modal */}
      <ClientAuthModal
        isOpen={showClientAuthModal}
        onClose={() => setShowClientAuthModal(false)}
        onAuthSuccess={async () => {
          setShowClientAuthModal(false)
          // After successful auth, proceed with conversation
          if (user && profile) {
            setMessageLoading(true)
            try {
              // User is now authenticated, proceed with conversation
              const result = await checkOrCreateConversation(user!.id, profile.id!)
              if (result.success && result.conversationId) {
                navigate(`/messages/${result.conversationId}`)
              } else {
                setError(result.error || 'Failed to start conversation')
              }
            } catch (err) {
              console.error('Error starting conversation:', err)
              setError('Failed to start conversation')
            } finally {
              setMessageLoading(false)
            }
          }
        }}
        freelancerUsername={username || ''}
      />
    </div>
  );
}
