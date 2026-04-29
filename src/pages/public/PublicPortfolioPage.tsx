import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, UserCircle, Briefcase, Target, Clock, DollarSign, MessageCircle, ExternalLink, Send, ArrowLeft } from "lucide-react";
import { getUserProfile, getPortfolioItems, getServices, UserProfile, PortfolioItem, Service, createConversation, createMessage, supabase } from "../../utils/supabase";

export default function PublicPortfolioPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!slug) return;
      
      try {
        // First get user by slug
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('slug', slug)
          .single();
        
        if (userError || !userData) {
          console.error('User not found:', userError);
          setLoading(false);
          return;
        }

        // Then fetch all profile data
        const [profileData, portfolioData, servicesData] = await Promise.all([
          getUserProfile(userData.id),
          getPortfolioItems(userData.id),
          getServices(userData.id)
        ]);
        
        setProfile(profileData);
        setPortfolioItems(portfolioData);
        setServices(servicesData.filter(service => service.status === 'active'));
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [slug]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !profile?.id) return;
    
    setSending(true);
    try {
      // Create a temporary client ID for demo purposes
      // In a real app, this would be the actual logged-in client's ID
      const clientId = 'temp-client-id';
      
      // Create conversation
      const conversationResult = await createConversation({
        freelancer_id: profile.id,
        client_id: clientId
      });
      
      if (conversationResult.error) {
        console.error('Error creating conversation:', conversationResult.error);
        return;
      }
      
      if (conversationResult.data) {
        // Send initial message
        await createMessage({
          conversation_id: conversationResult.data.id!,
          sender_id: clientId,
          content: messageText.trim()
        });
        
        setMessageSent(true);
        setTimeout(() => {
          setShowMessageModal(false);
          setMessageSent(false);
          setMessageText('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Portfolio Not Found</h2>
          <p className="text-slate-400 mb-6">The portfolio you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      {/* Header */}
      <div className="bg-[#151B2B] border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Profile Section */}
        <div className="bg-[#151B2B] rounded-2xl p-8 border border-slate-800/60 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex flex-col items-center">
              {profile?.profile_image ? (
                <img 
                  src={profile.profile_image} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                  {profile?.display_name?.charAt(0).toUpperCase() || profile?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {profile?.display_name || profile?.name || profile?.username || 'Freelancer'}
                </h2>
                <p className="text-slate-400 mb-4">Freelancer</p>
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send Message
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">About</h3>
                <p className="text-slate-300 leading-relaxed">
                  {profile?.bio || 'No bio available.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-white">{profile?.email || 'Contact for details'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <UserCircle className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Username</p>
                    <p className="text-sm text-white">@{profile?.username || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Services Section */}
        {services.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-[#151B2B] rounded-2xl p-6 border border-slate-800/60 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-indigo-600/10 rounded-lg">
                      <Target className="h-5 w-5 text-indigo-400" />
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      Available
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">{service.description || 'No description provided'}</p>

                  <div className="space-y-3">
                    {service.price && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-medium text-white">{service.price}</span>
                      </div>
                    )}
                    {service.timeline && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-400">{service.timeline}</span>
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
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Portfolio</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item) => (
                <div key={item.id} className="group relative bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                  <div className="aspect-video bg-slate-700/50 relative overflow-hidden">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-slate-600/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Briefcase className="h-8 w-8 text-slate-400" />
                          </div>
                          <span className="text-slate-400 text-sm">No Image</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h4 className="text-white font-semibold mb-2 line-clamp-1">{item.title}</h4>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.description || 'No description provided'}</p>
                    {item.external_link && (
                      <a
                        href={item.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
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

        {/* Empty State */}
        {services.length === 0 && portfolioItems.length === 0 && (
          <div className="bg-[#151B2B] rounded-2xl p-12 border border-slate-800/60 shadow-sm text-center">
            <div className="w-24 h-24 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-600/50">
              <Briefcase className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No Services or Portfolio Items</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              This freelancer hasn't added any services or portfolio items yet.
            </p>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#151B2B] rounded-2xl p-6 border border-slate-800/60 shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Send Message</h4>
                  <p className="text-slate-400 text-sm">Contact {profile?.display_name || profile?.username}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMessageModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            
            {messageSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-green-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">Message Sent!</h4>
                <p className="text-slate-400 text-sm">Your message has been delivered successfully.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32 resize-none"
                  placeholder="Introduce yourself and let them know about your project..."
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowMessageModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !messageText.trim()}
                    className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <>
                        <div className="h-4 w-4 border border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
