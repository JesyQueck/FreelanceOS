import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, UserCircle, Briefcase, Target, Clock, DollarSign, MessageCircle, ExternalLink, Send, ArrowLeft, MoreVertical, Paperclip } from "lucide-react";
import { getUserProfile, getPortfolioItems, getServices, UserProfile, PortfolioItem, Service, createConversation, createMessage, supabase } from "../../utils/supabase";

export default function PublicPortfolioPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

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
      const clientId = 'guest-' + Date.now();
      
      // Create conversation if not exists
      let conversation = currentConversation;
      if (!conversation) {
        const conversationResult = await createConversation({
          freelancer_id: profile.id,
          client_id: clientId
        });
        
        if (conversationResult.error) {
          // Fallback
          const fallbackResult = await createConversation({
            freelancer_id: profile.id,
            client_id: profile.id
          });
          
          if (fallbackResult.data) {
            conversation = fallbackResult.data;
          }
        } else if (conversationResult.data) {
          conversation = conversationResult.data;
        }
      }
      
      if (conversation) {
        const messageContent = messageText.trim();
        const newMessage = {
          id: Date.now().toString(),
          conversation_id: conversation.id,
          sender_id: clientId,
          content: messageContent,
          created_at: new Date().toISOString()
        };
        
        // Add message to UI immediately
        setMessages(prev => [...prev, newMessage]);
        setMessageText('');
        
        // Send to backend
        await createMessage({
          conversation_id: conversation.id!,
          sender_id: clientId,
          content: messageContent
        });
        
        setCurrentConversation(conversation);
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
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

      {/* WhatsApp-style Chat Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F19] rounded-2xl border border-slate-800/60 shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="bg-[#151B2B] p-4 border-b border-slate-800/60 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-400" />
                </button>
                <div className="flex items-center gap-3">
                  {profile?.profile_image ? (
                    <img 
                      src={profile.profile_image} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                      {profile?.display_name?.charAt(0).toUpperCase() || profile?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-white">{profile?.display_name || profile?.name || profile?.username || 'Freelancer'}</h3>
                    <p className="text-xs text-green-400">Active now</p>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                <MoreVertical className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B0F19]">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm">Start the conversation!</p>
                  <p className="text-xs text-slate-500 mt-2">Introduce yourself and let them know about your project</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-indigo-600 text-white rounded-br-sm">
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-indigo-200">
                        <span>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-[#151B2B] p-4 border-t border-slate-800/60 rounded-b-2xl">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                  <Paperclip className="h-4 w-4 text-slate-400" />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 disabled:opacity-50"
                  autoFocus
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={sending || !messageText.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
