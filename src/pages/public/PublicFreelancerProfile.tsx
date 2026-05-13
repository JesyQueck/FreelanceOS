import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCircle, Mail, Briefcase, MessageCircle, ArrowLeft, ExternalLink, CheckCircle2, DollarSign, Clock } from 'lucide-react';
import { getPublicUserProfile, getPublicPortfolioItems, getPublicServices, checkOrCreateConversation, getFreelancerProfile, UserProfile, PortfolioItem, Service, ensureClientProfileExists } from '../../utils/supabase';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../contexts/AuthContext';
import ClientAuthModal from '../../components/ClientAuthModal';
import LoadingSpinner from '../../components/LoadingSpinner';

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
      // Ensure client profile exists (handles email confirmation case)
      const profileResult = await ensureClientProfileExists(user.id, user.email || '', user.email?.split('@')[0] || 'Client');
      
      if (!profileResult.success) {
        console.error('Failed to ensure client profile exists:', profileResult.error);
        // Continue anyway - the error might be non-critical
      }

      // Now check if client profile exists and proceed with conversation
      const { data: clientProfile, error: clientError } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (clientError || !clientProfile) {
        // If profile still doesn't exist, show signup modal
        setShowClientAuthModal(true);
        return;
      }

      // User has client profile, proceed with conversation
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
      <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center">
        <LoadingSpinner text="Loading freelancer profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center">
        <div className="text-[var(--color-text-primary)]">Freelancer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[var(--color-bg-main)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between px-4 py-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#FFD700] p-1.5 rounded-lg text-black shadow-sm flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-white">FreelanceOS</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-[var(--color-text-primary)]" />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 z-40 bg-[var(--color-bg-main)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="bg-[var(--color-primary)] p-1.5 rounded-lg text-black shadow-sm flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-[var(--color-text-primary)]">FreelanceOS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 lg:pt-12 pb-6 lg:pb-12">
        {/* Hero Section */}
        <div className="card p-6 lg:p-10 border border-[var(--color-border)] shadow-xl mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-10">
            {/* Profile Image */}
            <div className="lg:col-span-1 flex justify-center lg:justify-start">
              <div className="relative group">
                {profile.profile_image ? (
                  <div className="relative">
                    <img
                      src={profile.profile_image}
                      alt={profile.display_name || user?.email || 'Profile'}
                      className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover shadow-2xl border-3 border-[#FFD700] transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#FFD700] rounded-full p-1.5 shadow-lg">
                      <CheckCircle2 className="h-5 w-5 text-black" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-[#1A1A1A] flex items-center justify-center border-3 border-[#FFD700] shadow-2xl">
                    <UserCircle className="h-14 w-14 lg:h-18 lg:w-18 text-[#A0A0A0]" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="lg:col-span-3 space-y-4 lg:space-y-5">
              {/* Name and Status */}
              <div className="text-center lg:text-left">
                <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">
                  {profile.name || profile.display_name}
                </h1>
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-2 lg:gap-3 mb-3">
                  <span className="px-3 py-1.5 bg-[#FFD700]/20 text-[#FFD700] rounded-full text-xs font-medium border border-[#FFD700]/30">
                    Freelancer
                  </span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-500">Verified</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-4">
                <div className="flex items-center gap-3 bg-[#1A1A1A]/30 rounded-xl p-3 border border-[#2A2A2A]/30">
                  <div className="bg-[#FFD700]/10 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#A0A0A0] mb-0.5 uppercase tracking-wide">Email</p>
                    <p className="text-xs text-white font-medium truncate">{profile.email || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-[#1A1A1A]/30 rounded-xl p-3 border border-[#2A2A2A]/30">
                  <div className="bg-[#FFD700]/10 p-2 rounded-lg">
                    <UserCircle className="h-5 w-5 text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#A0A0A0] mb-0.5 uppercase tracking-wide">Member Since</p>
                    <p className="text-xs text-white font-medium">
                      {profile.created_at ? getRelativeTime(profile.created_at) : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <div className="bg-[#1A1A1A]/50 rounded-xl p-4 border border-[#2A2A2A]/50">
                  <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-[#FFD700]" />
                    About
                  </h3>
                  <p className="text-xs text-[#A0A0A0] leading-relaxed min-h-[60px]">{profile.bio}</p>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-[#1A1A1A]">
                <div className="flex justify-center">
                  <button
                    onClick={handleMessageFreelancer}
                    disabled={messageLoading}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#FFD700] text-black font-bold text-sm rounded-lg hover:bg-[#FFC700] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                  >
                    {messageLoading ? (
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" />
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
        <div className="bg-[#0A0A0A] rounded-3xl p-6 lg:p-8 border border-[#1A1A1A] shadow-xl mb-6">
          <h2 className="text-lg lg:text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[#FFD700]" />
            Professional Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            <div className="bg-[#1A1A1A]/30 rounded-xl p-3 border border-[#2A2A2A]/30">
              <p className="text-[10px] text-[#A0A0A0] mb-1 uppercase tracking-wide">Hourly Rate</p>
              <p className="text-sm text-white font-medium">
                {freelancerProfile?.hourly_rate ? `$${freelancerProfile.hourly_rate}/hr` : 'Not set'}
              </p>
            </div>
            <div className="bg-[#1A1A1A]/30 rounded-xl p-3 border border-[#2A2A2A]/30">
              <p className="text-[10px] text-[#A0A0A0] mb-1 uppercase tracking-wide">Experience Level</p>
              <p className="text-sm text-white font-medium capitalize">
                {freelancerProfile?.experience_level || 'Not set'}
              </p>
            </div>
            <div className="bg-[#1A1A1A]/30 rounded-xl p-3 border border-[#2A2A2A]/30">
              <p className="text-[10px] text-[#A0A0A0] mb-1 uppercase tracking-wide">Availability</p>
              <p className="text-sm text-white font-medium capitalize">
                {freelancerProfile?.availability || 'Not set'}
              </p>
            </div>
          </div>
          {freelancerProfile && freelancerProfile.skills && freelancerProfile.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] text-[#A0A0A0] mb-2 uppercase tracking-wide">Skills</p>
              <div className="flex flex-wrap gap-2">
                {freelancerProfile.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-[#FFD700]/20 text-[#FFD700] rounded-full text-xs font-medium border border-[#FFD700]/30"
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
          <div className="bg-[#0A0A0A] rounded-3xl p-6 lg:p-8 border border-[#1A1A1A] shadow-xl mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#FFD700]" />
                Services
              </h2>
              <span className="px-3 py-1.5 bg-[#FFD700]/20 text-[#FFD700] rounded-full text-xs font-medium border border-[#FFD700]/30">
                {services.length} Services Available
              </span>
            </div>
            {/* Desktop: Grid Layout */}
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-[#1A1A1A] rounded-xl p-4 lg:p-5 border border-[#2A2A2A] hover:border-[#FFD700]/50 transition-all duration-300 group flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 lg:p-3 bg-[#FFD700]/10 rounded-xl">
                      <Briefcase className="h-5 w-5 lg:h-6 lg:w-6 text-[#FFD700]" />
                    </div>
                  </div>
                  <h3 className="text-base lg:text-lg font-semibold text-white mb-2 lg:mb-3 group-hover:text-[#FFD700] transition-colors">{service.title.length > 50 ? `${service.title.substring(0, 50)}...` : service.title}</h3>
                  <div className="flex-grow">
                    <p className="text-xs lg:text-sm text-[#A0A0A0] leading-relaxed">{service.description || 'No description provided'}</p>
                  </div>
                  <div className="space-y-2 lg:space-y-3 mt-auto pt-3 lg:pt-4">
                    {service.price && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-[#FFD700]" />
                        <span className="text-base lg:text-lg font-bold text-[#FFD700]">{service.price}</span>
                      </div>
                    )}
                    {service.timeline && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-[#A0A0A0]" />
                        <span className="text-xs lg:text-sm text-[#A0A0A0]">{service.timeline}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Mobile: Horizontal Scroll Tray */}
            <div className="lg:hidden overflow-x-auto -mx-6 px-6">
              <div className="flex gap-4 pb-4">
                {services.map((service) => (
                  <div key={service.id} className="flex-shrink-0 w-72 bg-[#1A1A1A] rounded-xl p-4 border border-[#2A2A2A] hover:border-[#FFD700]/50 transition-all min-h-[16rem] sm:min-h-[18rem] md:min-h-[20rem] lg:min-h-[14rem] xl:min-h-[16rem] flex flex-col">
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
                    <h3 className="text-base font-semibold text-white mb-2 truncate">{service.title.length > 50 ? `${service.title.substring(0, 50)}...` : service.title}</h3>
                    <div className="flex-grow">
                      <p className="text-xs text-[#A0A0A0] leading-relaxed">{service.description || 'No description provided'}</p>
                    </div>
                    <div className="space-y-2 mt-auto pt-3">
                      {service.price && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-[#FFD700]" />
                          <span className="text-sm font-medium text-[#FFD700]">{service.price}</span>
                        </div>
                      )}
                      {service.timeline && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[#A0A0A0]" />
                          <span className="text-xs text-[#A0A0A0]">{service.timeline}</span>
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
          <div className="bg-[#0A0A0A] rounded-3xl p-6 lg:p-8 border border-[#1A1A1A] shadow-xl mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg lg:text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#FFD700]" />
                Portfolio
              </h2>
              <span className="px-3 py-1.5 bg-[#FFD700]/20 text-[#FFD700] rounded-full text-xs font-medium border border-[#FFD700]/30">
                {portfolioItems.length} Projects
              </span>
            </div>
            {/* Desktop: Grid Layout */}
            <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
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
                          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#FFD700]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Briefcase className="h-5 w-5 lg:h-6 lg:w-6 text-[#FFD700]" />
                          </div>
                          <span className="text-[#A0A0A0] text-[10px] lg:text-xs">No Image</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 lg:p-5">
                    <h4 className="text-white font-semibold mb-2 line-clamp-1 text-sm lg:text-base group-hover:text-[#FFD700] transition-colors">{item.title.length > 80 ? `${item.title.substring(0, 80)}...` : item.title}</h4>
                    <p className="text-[#A0A0A0] text-xs lg:text-sm mb-3 lg:mb-4 line-clamp-2">{item.description || 'No description provided'}</p>
                    {item.external_link && (
                      <a
                        href={item.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#FFD700] hover:text-[#FFC700] transition-colors text-xs lg:text-sm"
                      >
                        <ExternalLink className="h-3 w-3 lg:h-4 lg:w-4" />
                        View Project
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Mobile: Horizontal Scroll Tray */}
            <div className="lg:hidden overflow-x-auto -mx-6 px-6">
              <div className="flex gap-4 pb-4">
                {portfolioItems.map((item) => (
                  <div key={item.id} className="flex-shrink-0 w-72 bg-[#1A1A1A] rounded-xl overflow-hidden border border-[#2A2A2A] hover:border-[#FFD700]/50 transition-all duration-300 min-h-[16rem] sm:min-h-[18rem] md:min-h-[20rem] lg:min-h-[14rem] xl:min-h-[16rem] flex flex-col">
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
                            <div className="w-10 h-10 bg-[#FFD700]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                              <Briefcase className="h-5 w-5 text-[#FFD700]" />
                            </div>
                            <span className="text-[#A0A0A0] text-[10px]">No Image</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="text-white font-semibold mb-2 line-clamp-1 text-base group-hover:text-[#FFD700] transition-colors">{item.title}</h4>
                      <div className="flex-grow">
                        <p className="text-[#A0A0A0] text-xs leading-relaxed">{item.description || 'No description provided'}</p>
                      </div>
                      <div className="mt-auto pt-3">
                        {item.external_link && (
                          <a
                            href={item.external_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[#FFD700] hover:text-[#FFC700] transition-colors text-xs"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Project
                          </a>
                        )}
                      </div>
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
            // ClientAuthModal will handle auto-conversation creation if autoCreateConversation is true
          }}
          freelancerUsername={username || ''}
          autoCreateConversation={true}
        />
      </div>
    </div>
  );
}
