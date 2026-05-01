import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserCircle, Mail, Briefcase, MessageCircle, ArrowLeft, ExternalLink, CheckCircle2 } from 'lucide-react';
import { getPublicUserProfile, getPublicPortfolioItems, getPublicServices, checkOrCreateConversation, UserProfile, PortfolioItem, Service } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function PublicFreelancerProfile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageLoading, setMessageLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) {
        setError('Freelancer not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch public profile data
        const profileData = await getPublicUserProfile(username);
        if (!profileData) {
          setError('Freelancer profile not found');
          return;
        }
        setProfile(profileData);

        // Fetch portfolio items and services in parallel
        const [portfolioData, servicesData] = await Promise.all([
          getPublicPortfolioItems(profileData.id!),
          getPublicServices(profileData.id!)
        ]);

        setPortfolioItems(portfolioData || []);
        setServices(servicesData || []);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [username]);

  const handleMessageFreelancer = async () => {
    if (!user) {
      // Store the intended action and redirect to login
      sessionStorage.setItem('redirectAfterLogin', `/freelancer/${username}`);
      sessionStorage.setItem('intendedAction', 'message');
      navigate('/login');
      return;
    }

    if (!profile) return;

    setMessageLoading(true);
    try {
      // Check if conversation already exists or create new one
      const result = await checkOrCreateConversation(user.id, profile.id!);
      
      if (result.success && result.conversationId) {
        // Navigate to the conversation
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error || 'Profile not found'}</div>
          <Link 
            to="/discover" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFD700] text-black rounded-lg hover:bg-[#FFC700] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Discover Freelancers
          </Link>
        </div>
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
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-start">
            <div className="flex items-center gap-2">
              <div className="bg-[#FFD700] p-1.5 rounded-lg text-black shadow-sm flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="font-bold text-white">FreelanceOS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 lg:pt-20 min-h-screen flex justify-center">
        <div className="w-full max-w-4xl px-4 lg:px-6 py-8">
          {/* Profile Header */}
          <div className="bg-[#0A0A0A] rounded-2xl p-6 lg:p-8 border border-[#1A1A1A] shadow-sm mb-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <div className="flex flex-col lg:items-center">
                <div className="relative">
                  {profile?.profile_image ? (
                    <img 
                      src={profile.profile_image} 
                      alt={profile.display_name || profile.name} 
                      className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-[#FFD700] flex items-center justify-center text-black text-2xl lg:text-3xl font-bold">
                      {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="mt-4 lg:mt-6 lg:text-center">
                  <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">
                    {profile.display_name || profile.name}
                  </h1>
                  <p className="text-[#A0A0A0] mb-3">Freelancer</p>
                  <div className="flex items-center lg:justify-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">Verified</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
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
              </div>
            </div>
          </div>

          {/* Services Section */}
          {services.length > 0 && (
            <div className="bg-[#0A0A0A] rounded-2xl p-6 lg:p-8 border border-[#1A1A1A] shadow-sm mb-6">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-6">Services</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A] hover:border-[#FFD700]/50 transition-all">
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
          )}

          {/* Portfolio Section */}
          {portfolioItems.length > 0 && (
            <div className="bg-[#0A0A0A] rounded-2xl p-6 lg:p-8 border border-[#1A1A1A] shadow-sm">
              <h2 className="text-xl lg:text-2xl font-bold text-white mb-6">Portfolio</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {portfolioItems.map((item) => (
                  <div key={item.id} className="group relative bg-[#1A1A1A]/50 rounded-xl overflow-hidden border border-[#2A2A2A]/50 hover:border-[#FFD700]/50 transition-all duration-300">
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
                          className="inline-flex items-center gap-2 text-[#FFD700] hover:text-[#FFC700] text-sm transition-colors"
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
          )}
        </div>
      </div>
    </div>
  );
}
