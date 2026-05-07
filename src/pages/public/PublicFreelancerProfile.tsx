import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { UserCircle, Mail, Briefcase, MessageCircle, ArrowLeft, ExternalLink, CheckCircle2 } from 'lucide-react';
import { getPublicUserProfile, getPublicPortfolioItems, getPublicServices, checkOrCreateConversation, getFreelancerProfile, UserProfile, PortfolioItem, Service } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ClientAuthModal from '../../components/ClientAuthModal';

// Helper function to get relative time
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInDays < 30) {
    return 'Recently joined';
  } else if (diffInMonths === 1) {
    return '1 month ago';
  } else if (diffInMonths <= 11) {
    return `${diffInMonths} months ago`;
  } else if (diffInYears === 1) {
    return '1 year ago';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
};

export default function PublicFreelancerProfile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<any>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
    const [messageLoading, setMessageLoading] = useState(false);
  const [showClientAuthModal, setShowClientAuthModal] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username || !mountedRef.current) {
        if (mountedRef.current) {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user profile first to get the user_id
        const profileData = await getPublicUserProfile(username);
        
        if (!profileData) {
          if (mountedRef.current) {
            setLoading(false);
          }
          return;
        }
        
        // Fetch all other data using the user_id from profile data
        const [freelancerData, portfolioData, servicesData] = await Promise.all([
          getFreelancerProfile(profileData.id!),
          getPublicPortfolioItems(profileData.id!),
          getPublicServices(profileData.id!)
        ]);
        
        if (mountedRef.current) {
          setProfile(profileData);
          setFreelancerProfile(freelancerData);
          setPortfolioItems(portfolioData);
          setServices(servicesData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [username]);

  const handleMessageFreelancer = async () => {
    if (!user) {
      setShowClientAuthModal(true);
      return;
    }

    if (!profile) {
      return;
    }

    setMessageLoading(true);
    try {
      // User is now authenticated, proceed with conversation
      const result = await checkOrCreateConversation(user!.id, profile.id!);
      if (result.success && result.conversationId) {
        navigate(`/messages/${result.conversationId}`);
      } else {
        alert(result.error || 'Failed to start conversation');
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
      alert('Failed to start conversation');
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <div className="text-white">Loading freelancer profile...</div>
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
        <div className="flex items-center justify-between px-4 py-6">
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
      <div className="container mx-auto px-4 pt-24 lg:pt-12 pb-6 lg:pb-12">
        {/* Hero Section */}
        <div className="bg-[#0A0A0A] rounded-3xl p-8 lg:p-12 border border-[#1A1A1A] shadow-xl mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Profile Image */}
            <div className="lg:col-span-1 flex justify-center lg:justify-start">
              <div className="relative group">
                {profile.profile_image ? (
                  <div className="relative">
                    <img 
                      src={profile.profile_image} 
                      alt={profile.display_name || user?.email || 'Profile'} 
                      className="w-40 h-40 lg:w-48 lg:h-48 rounded-3xl object-cover shadow-2xl border-4 border-[#FFD700] transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-[#FFD700] rounded-full p-2 shadow-lg">
                      <CheckCircle2 className="h-6 w-6 text-black" />
                    </div>
                  </div>
                ) : (
                  <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-3xl bg-[#1A1A1A] flex items-center justify-center border-4 border-[#FFD700] shadow-2xl">
                    <UserCircle className="h-16 w-16 lg:h-20 lg:w-20 text-[#A0A0A0]" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="lg:col-span-3 space-y-6">
              {/* Name and Status */}
              <div className="text-center lg:text-left">
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {profile.name || profile.display_name}
                </h1>
                <div className="flex flex-col items-center lg:items-start gap-3 mb-4">
                  <span className="px-4 py-2 bg-[#FFD700]/20 text-[#FFD700] rounded-full text-sm font-medium border border-[#FFD700]/30">
                    Freelancer
                  </span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-500">Verified</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 bg-[#1A1A1A]/30 rounded-2xl p-4 border border-[#2A2A2A]/30">
                  <div className="bg-[#FFD700]/10 p-3 rounded-xl">
                    <Mail className="h-6 w-6 text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#A0A0A0] mb-1">Email</p>
                    <p className="text-sm text-white font-medium">{profile.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-[#1A1A1A]/30 rounded-2xl p-4 border border-[#2A2A2A]/30">
                  <div className="bg-[#FFD700]/10 p-3 rounded-xl">
                    <UserCircle className="h-6 w-6 text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#A0A0A0] mb-1">Member Since</p>
                    <p className="text-sm text-white font-medium">
                      {profile.created_at ? getRelativeTime(profile.created_at) : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="bg-[#1A1A1A]/50 rounded-2xl p-6 border border-[#2A2A2A]/50">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#FFD700]" />
                    About
                  </h3>
                  <p className="text-[#A0A0A0] leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-8 pt-6 border-t border-[#1A1A1A]">
                <div className="flex justify-center">
                  <button
                    onClick={handleMessageFreelancer}
                    disabled={messageLoading}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#FFD700] text-black font-bold text-lg rounded-xl hover:bg-[#FFC700] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[250px]"
                  >
                    {messageLoading ? (
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    ) : (
                      <>
                        <MessageCircle className="h-6 w-6" />
                        Message Freelancer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information - From Freelancer Profile */}
        <div className="bg-[#0A0A0A] rounded-3xl p-8 lg:p-12 border border-[#1A1A1A] shadow-xl mb-8">
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-[#FFD700]" />
            Professional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[#A0A0A0] mb-1">Hourly Rate</p>
              <p className="text-sm text-white font-medium">
                {freelancerProfile?.hourly_rate ? `$${freelancerProfile.hourly_rate}/hr` : 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#A0A0A0] mb-1">Experience Level</p>
              <p className="text-sm text-white font-medium capitalize">
                {freelancerProfile?.experience_level || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#A0A0A0] mb-1">Availability</p>
              <p className="text-sm text-white font-medium capitalize">
                {freelancerProfile?.availability || 'Not set'}
              </p>
            </div>
          </div>
          {freelancerProfile && freelancerProfile.skills && freelancerProfile.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-[#A0A0A0] mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {freelancerProfile.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#FFD700]/20 text-[#FFD700] rounded-full text-xs font-medium border border-[#FFD700]/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Services Section */}
        {services.length > 0 && (
          <div className="bg-[#0A0A0A] rounded-3xl p-8 lg:p-12 border border-[#1A1A1A] shadow-xl mb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-[#FFD700]" />
                Services
              </h2>
              <span className="px-4 py-2 bg-[#FFD700]/20 text-[#FFD700] rounded-full text-sm font-medium border border-[#FFD700]/30">
                {services.length} Services Available
              </span>
            </div>
            {/* Desktop: Grid Layout */}
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A] hover:border-[#FFD700]/50 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-[#FFD700]/10 rounded-xl">
                      <Briefcase className="h-6 w-6 text-[#FFD700]" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-[#FFD700] transition-colors">{service.title}</h3>
                  <p className="text-[#A0A0A0] text-sm mb-4 leading-relaxed">{service.description || 'No description provided'}</p>
                  <div className="space-y-3">
                    {service.price && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-[#FFD700]">{service.price}</span>
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
            {/* Mobile: Horizontal Scroll - only if more than one service */}
            <div className={`lg:hidden ${services.length > 1 ? 'overflow-x-auto' : ''}`}>
              <div className={`flex gap-4 ${services.length > 1 ? 'min-w-max pb-2' : ''}`}>
                {services.map((service) => (
                  <div key={service.id} className={`bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A] hover:border-[#FFD700]/50 transition-all ${services.length > 1 ? 'min-w-[280px] flex-shrink-0' : ''}`}>
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
          <div className="bg-[#0A0A0A] rounded-3xl p-8 lg:p-12 border border-[#1A1A1A] shadow-xl mb-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-[#FFD700]" />
                Portfolio
              </h2>
              <span className="px-4 py-2 bg-[#FFD700]/20 text-[#FFD700] rounded-full text-sm font-medium border border-[#FFD700]/30">
                {portfolioItems.length} Projects
              </span>
            </div>
            {/* Desktop: Grid Layout */}
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {portfolioItems.map((item) => (
                <div key={item.id} className="group relative bg-[#1A1A1A] rounded-xl overflow-hidden border border-[#2A2A2A] hover:border-[#FFD700]/50 transition-all duration-300">
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
                  <div className="p-6">
                    <h4 className="text-white font-semibold mb-2 line-clamp-1 text-lg group-hover:text-[#FFD700] transition-colors">{item.title}</h4>
                    <p className="text-[#A0A0A0] text-sm mb-4 line-clamp-2">{item.description || 'No description provided'}</p>
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
            {/* Mobile: Horizontal Scroll - only if more than one item */}
            <div className={`lg:hidden ${portfolioItems.length > 1 ? 'overflow-x-auto' : ''}`}>
              <div className={`flex gap-4 ${portfolioItems.length > 1 ? 'min-w-max pb-2' : ''}`}>
                {portfolioItems.map((item) => (
                  <div key={item.id} className={`group relative bg-[#1A1A1A] rounded-xl overflow-hidden border border-[#2A2A2A] hover:border-[#FFD700]/50 transition-all duration-300 ${portfolioItems.length > 1 ? 'min-w-[320px] flex-shrink-0' : ''}`}>
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

        {/* Client Auth Modal */}
        <ClientAuthModal
          isOpen={showClientAuthModal}
          onClose={() => setShowClientAuthModal(false)}
          onAuthSuccess={async () => {
            setShowClientAuthModal(false);
            // After successful auth, proceed with conversation
            if (user && profile) {
              setMessageLoading(true);
              try {
                // User is now authenticated, proceed with conversation
                const result = await checkOrCreateConversation(user!.id, profile.id!);
                if (result.success && result.conversationId) {
                  navigate(`/messages/${result.conversationId}`);
                } else {
                  alert(result.error || 'Failed to start conversation');
                }
              } catch (err) {
                console.error('Error starting conversation:', err);
                alert('Failed to start conversation');
              } finally {
                setMessageLoading(false);
              }
            }
          }}
          freelancerUsername={username || ''}
        />
      </div>
    </div>
  );
}
