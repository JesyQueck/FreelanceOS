import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, UserCircle, Briefcase, Target, Clock, DollarSign, MessageCircle, ExternalLink, Send, ArrowLeft, MoreVertical, Paperclip, X } from "lucide-react";
import { getUserProfile, getPortfolioItems, getServices, UserProfile, PortfolioItem, Service, createConversation, createMessage, createOrUpdateClient, supabase } from "../../utils/supabase";

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
  const [clientInfo, setClientInfo] = useState({ name: '', email: '' });
  const [clientId, setClientId] = useState<string>('');
  const [showClientForm, setShowClientForm] = useState(true);

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
        
        // Get user profile and portfolio data
        const [profileData, portfolioData, servicesData] = await Promise.all([
          getUserProfile(userData.id),
          getPortfolioItems(userData.id),
          getServices(userData.id)
        ]);
        
        setProfile(profileData);
        setPortfolioItems(portfolioData);
        setServices(servicesData);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [slug]);

  // Real-time messaging subscription
  useEffect(() => {
    if (!currentConversation || !clientId) {
      console.log('Real-time subscription not set up - missing conversation or client ID', { currentConversation, clientId });
      return;
    }

    console.log('🔧 Setting up real-time subscription for conversation:', currentConversation.id, 'Client ID:', clientId);
    
    const subscription = supabase
      .channel(`client-chat-${currentConversation.id}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${currentConversation.id}`
        },
        (payload) => {
          console.log('✅ Real-time message received:', payload.new);
          const messageContent = payload.new.content;
          
          // Check if this is from the current client
          const isFromClient = payload.new.sender_id === clientId;
          console.log('👤 Message from:', isFromClient ? 'Client' : 'Freelancer');
          
          // Format message for display
          let displayContent = messageContent;
          if (!isFromClient) {
            // This is from freelancer, remove any client info prefix if present
            displayContent = messageContent.replace(/^(📧|👤)[^:]+: /, '');
            console.log('🔄 Formatted freelancer message:', displayContent);
          }
          
          const newMessage = {
            ...payload.new,
            content: displayContent,
            is_client: isFromClient
          };
          
          console.log('📝 Adding message to chat:', newMessage);
          setMessages(prev => [...prev, newMessage]);
          
          // Scroll to bottom for new messages
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Subscription status:', status);
        if (err) {
          console.error('❌ Subscription error:', err);
        } else if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time updates');
        }
      });

    return () => {
      console.log('🧹 Cleaning up real-time subscription');
      supabase.removeChannel(subscription);
    };
  }, [currentConversation, clientId]);

  // Load existing conversation and messages when modal opens
  // Check URL for client conversation parameters
  useEffect(() => {
    if (!profile?.id) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const clientConversationId = urlParams.get('client');
    const clientName = urlParams.get('name');
    const clientEmail = urlParams.get('email');
    const conversationId = urlParams.get('conversation');
    
    if (clientConversationId && clientName) {
      // Client is returning via URL link
      setClientId(clientConversationId);
      setClientInfo({ name: clientName, email: clientEmail || '' });
      setShowClientForm(false);
      
      // If conversation ID is in URL, set it directly and load messages
      if (conversationId) {
        setCurrentConversation({ id: conversationId });
        console.log('Conversation loaded from URL:', { conversationId });
        
        // Auto-open message modal when returning client is detected
        setShowMessageModal(true);
      }
      
      console.log('Client identified via URL:', { clientConversationId, clientName, clientEmail, conversationId });
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!showMessageModal || !profile?.id || !clientId) return;

    const loadExistingConversation = async () => {
      try {
        // If we already have a conversation ID from URL, use it directly
        if (currentConversation?.id) {
          console.log('Loading messages for existing conversation:', currentConversation.id);
          
          // Load existing messages
          const { data: existingMessages, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', currentConversation.id)
            .order('created_at', { ascending: true });

          if (msgError) {
            console.log('Messages lookup error:', msgError);
          }

          if (existingMessages) {
            const formattedMessages = existingMessages.map(msg => ({
              ...msg,
              is_client: msg.sender_id === clientId,
              content: msg.content.replace(/^(?:\ud83d\udce7|\ud83d\udc64)[^:]+: /, '') // Remove client info prefix for display
            }));
            setMessages(formattedMessages);
            console.log('Loaded', formattedMessages.length, 'messages');
          }
          return;
        }

        // Check for existing conversation
        const { data: existingConv, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('freelancer_id', profile.id)
          .eq('client_id', clientId)
          .maybeSingle(); // Use maybeSingle() instead of single()

        if (convError) {
          console.log('Conversation lookup error:', convError);
        }

        if (existingConv) {
          setCurrentConversation(existingConv);
          
          // Load existing messages
          const { data: existingMessages, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', existingConv.id)
            .order('created_at', { ascending: true });

          if (msgError) {
            console.log('Messages lookup error:', msgError);
          }

          if (existingMessages) {
            const formattedMessages = existingMessages.map(msg => ({
              ...msg,
              is_client: msg.sender_id === clientId,
              content: msg.content.replace(/^(?:\ud83d\udce7|\ud83d\udc64)[^:]+: /, '') // Remove client info prefix for display
            }));
            setMessages(formattedMessages);
            console.log('Loaded', formattedMessages.length, 'messages from existing conversation');
          }
        } else {
          console.log('No existing conversation found, will create new one');
        }
      } catch (error) {
        console.log('Error in loadExistingConversation:', error);
      }
    };

    loadExistingConversation();
  }, [showMessageModal, profile?.id, clientId, currentConversation?.id]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !profile?.id || !clientId) return;
    
    setSending(true);
    try {
      // Check for existing conversation with this client
      let conversation = currentConversation;
      if (!conversation) {
        // Try to find existing conversation first
        try {
          const { data: existingConv, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .eq('freelancer_id', profile.id)
            .eq('client_id', clientId)
            .maybeSingle(); // Use maybeSingle() instead of single()
          
          if (convError) {
            console.log('Conversation lookup error in send message:', convError);
          }
          
          if (existingConv) {
            conversation = existingConv;
            setCurrentConversation(conversation);
          }
        } catch (error) {
          console.log('Error checking existing conversation:', error);
        }
        
        if (!conversation) {
          const conversationResult = await createConversation({
            freelancer_id: profile.id,
            client_id: clientId
          });
          
          if (conversationResult.error) {
            console.error('Error creating conversation:', conversationResult.error);
            return;
          } else if (conversationResult.data) {
            conversation = conversationResult.data;
            setCurrentConversation(conversation);
          }
        }
      }
      
      if (conversation) {
        const messageContent = messageText.trim();
        const clientDisplayName = clientInfo.name || 'Anonymous Client';
        
        // Format message with client information for freelancer
        const formattedMessage = clientInfo.email 
          ? `📧 ${clientDisplayName} (${clientInfo.email}): ${messageContent}`
          : `👤 ${clientDisplayName}: ${messageContent}`;
        
        const newMessage = {
          id: Date.now().toString(),
          conversation_id: conversation.id,
          sender_id: clientId,
          content: messageContent,
          created_at: new Date().toISOString(),
          is_client: true
        };
        
        // Add message to UI immediately (right-aligned for client)
        setMessages(prev => [...prev, newMessage]);
        setMessageText('');
        
        // Send to backend with client information
        await createMessage({
          conversation_id: conversation.id!,
          sender_id: clientId,
          content: formattedMessage
        });
        
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

  const handleClientInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clientInfo.name.trim()) {
      try {
        // Create or update client information
        const clientResult = await createOrUpdateClient({
          name: clientInfo.name,
          email: clientInfo.email
        });
        
        if (clientResult.data) {
          const clientId = clientResult.data.id;
          setClientId(clientId);
          
          // Create conversation immediately when form is submitted
          if (profile?.id) {
            const conversationResult = await createConversation({
              freelancer_id: profile.id,
              client_id: clientId
            });
            
            if (conversationResult.data) {
              setCurrentConversation(conversationResult.data);
              console.log('✅ Conversation created immediately:', conversationResult.data);
              
              // Generate shareable URL with conversation ID
              const currentUrl = window.location.pathname; // e.g., /freelancer-slug
              const clientUrl = `${currentUrl}?client=${clientId}&name=${encodeURIComponent(clientInfo.name)}${clientInfo.email ? `&email=${encodeURIComponent(clientInfo.email)}` : ''}&conversation=${conversationResult.data.id}`;
              
              console.log('🔗 Client shareable URL with conversation:', clientUrl);
              
              // Update URL without page reload
              window.history.pushState({}, '', clientUrl);
            } else {
              console.error('Error creating conversation:', conversationResult.error);
            }
          }
          
          setShowClientForm(false);
        } else {
          console.error('Error creating client:', clientResult.error);
        }
      } catch (error) {
        console.error('Error in handleClientInfoSubmit:', error);
      }
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

      {/* Chat Modal - MessagingOverlay Style */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center sm:justify-center">
          <div className="bg-[#151B2B] w-full sm:w-full sm:max-w-md sm:h-[600px] h-[70vh] sm:h-auto rounded-t-2xl sm:rounded-2xl border border-slate-800/60 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowMessageModal(false)}
                  className="sm:hidden p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-white" />
                </button>
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                  {profile?.display_name?.charAt(0).toUpperCase() || profile?.name?.charAt(0).toUpperCase() || 'F'}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">{profile?.display_name || profile?.name || profile?.username || 'Freelancer'}</h3>
                  <p className="text-xs text-green-400">Active now</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const shareUrl = window.location.href;
                    navigator.clipboard.writeText(shareUrl);
                    alert('Conversation link copied! You can return to this chat anytime using this link.');
                  }}
                  className="hidden sm:block p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                  title="Copy conversation link"
                >
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </button>
                <button className="hidden sm:block p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                  <MoreVertical className="h-4 w-4 text-slate-400" />
                </button>
                <button 
                  onClick={() => setShowMessageModal(false)}
                  className="hidden sm:block p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {showClientForm ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-full max-w-md">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Introduce Yourself</h3>
                  <p className="text-slate-400 text-sm">Please provide your name so {profile?.display_name || profile?.name || 'the freelancer'} can identify you</p>
                </div>
                <form onSubmit={handleClientInfoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Your Name *</label>
                    <input
                      type="text"
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email (Optional)</label>
                    <input
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
                  >
                    Start Conversation
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs mt-2">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.is_client ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-2xl ${
                      message.is_client 
                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        message.is_client ? 'text-indigo-200' : 'text-slate-500'
                      }`}>
                        <span>{new Date(message.created_at).toLocaleTimeString('en-US', { 
                          hour: 'numeric', 
                          minute: '2-digit',
                          hour12: true 
                        })}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

            {/* Message Input */}
        {!showClientForm && (
          <div className="p-4 border-t border-slate-800/60">
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
        )}
          </div>
        </div>
      )}
    </div>
  );
}
