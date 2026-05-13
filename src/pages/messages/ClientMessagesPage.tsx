import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate, Link, useLocation } from "react-router-dom";
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical, 
  ArrowLeft, 
  Briefcase, 
  UserCircle, 
  LogOut, 
  Bell, 
  ChevronRight, 
  MessageSquare 
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getClientConversations, getMessages, createMessage, Conversation, Message, getPublicUserProfile, checkOrCreateConversation } from "../../utils/supabase";
import { supabase } from "../../utils/supabase";
import NotificationDropdown from "../../components/NotificationDropdown";
import ToastContainer from "../../components/ToastContainer";
import { useNotifications } from "../../contexts/NotificationContext";

export default function ClientMessagesPage() {
  const { user, role, loading } = useAuth();
  const { addToastNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const conversationIdParam = searchParams.get('conversation');

  // Redirect if not a client
  useEffect(() => {
    if (!loading && role !== 'client') {
      navigate('/login');
    }
  }, [role, loading, navigate]);

  // Show loading while determining role
  if (loading || role === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // Don't render if role is not client
  if (role !== 'client') {
    return null;
  }
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [initial, setInitial] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch user data for navbar
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserLoading(false);
        return;
      }

      try {
        // For clients, fetch data from client_profiles table
        const { data, error } = await supabase
          .from('client_profiles')
          .select('user_id, company, industry, project_preferences')
          .eq('user_id', user.id)
          .single() as { data: { user_id?: string; company?: string; industry?: string; project_preferences?: any } | null; error: any };

        if (error) {
          console.error('Error fetching client data:', error);
          setDisplayName(user.email?.split('@')[0] || 'Client');
          setUserEmail(user.email || '');
          setInitial(user.email?.charAt(0).toUpperCase() || 'C');
        } else if (data) {
          // Get display name from users table since client_profiles doesn't have it
          const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select('display_name')
            .eq('id', user.id)
            .single() as { data: { display_name?: string } | null; error: any };
          
          if (userDataError) {
            console.error('Error fetching user data:', userDataError);
            setDisplayName(user.email?.split('@')[0] || 'Client');
            setUserEmail(user.email || '');
            setInitial(user.email?.charAt(0).toUpperCase() || 'C');
          } else {
            setDisplayName(userData?.display_name || user.email?.split('@')[0] || 'Client');
            setUserEmail(user.email || '');
            setInitial((userData?.display_name || user.email || 'C').charAt(0).toUpperCase());
          }
        }
      } catch (error) {
        console.error('Unexpected error fetching client data:', error);
        setDisplayName(user.email?.split('@')[0] || 'Client');
        setUserEmail(user.email || '');
        setInitial(user.email?.charAt(0).toUpperCase() || 'C');
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time message subscription for client conversations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`client_messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=neq.${user.id}` // Only messages from freelancers
        },
        (payload) => {
          const newMessage = payload.new as Message;
          console.log('New client message received:', newMessage);
          
          // If this message is from the current conversation, add it to messages
          if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
            setMessages(prev => [...prev, newMessage]);
          } else {
            // If this message is from a different conversation, show toast notification
            const conversation = conversations.find(c => c.id === newMessage.conversation_id);
            if (conversation) {
              const displayName = getDisplayName(conversation);
              addToastNotification({
                type: 'message',
                title: `New message from ${displayName}`,
                message: newMessage.content.substring(0, 100) + (newMessage.content.length > 100 ? '...' : ''),
                conversationId: newMessage.conversation_id,
                senderId: newMessage.sender_id,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, selectedConversation, conversations, addToastNotification]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (user) {
        try {
          // Check for direct message parameter
          const urlParams = new URLSearchParams(window.location.search);
          const freelancerUsername = urlParams.get('freelancer');
          
          if (freelancerUsername) {
            // Direct message flow - create conversation with freelancer
            try {
              const profile = await getPublicUserProfile(freelancerUsername);
              if (profile) {
                const result = await checkOrCreateConversation(user.id, profile.id!);
                if (result.success && result.conversationId) {
                  // Create a temporary conversation object for immediate display
                  const tempConversation = {
                    id: result.conversationId,
                    freelancer_id: profile.id!,
                    client_id: '', // Will be filled by the actual client ID
                    created_at: new Date().toISOString(),
                    last_message_at: new Date().toISOString(),
                    freelancer_user: [{
                      username: profile.username,
                      display_name: profile.display_name || profile.username
                    }],
                    client_user: []
                  };
                  
                  setConversations([tempConversation]);
                  setSelectedConversation(tempConversation);
                  setShowChat(true);
                  
                  // Fetch messages (should be empty for new conversation)
                  const messagesData = await getMessages(result.conversationId);
                  setMessages(messagesData);
                  
                  // Clear the URL parameter
                  window.history.replaceState({}, '', '/messages');
                  setConversationsLoading(false);
                  return;
                }
              }
            } catch (error) {
              console.error('Error creating direct message conversation:', error);
            }
          }
          
          // Normal conversation loading
          const conversationsData = await getClientConversations(user.id);
          setConversations(conversationsData);
          if (conversationsData.length > 0) {
            // Check if there's a specific conversation ID in URL
            if (conversationIdParam) {
              const targetConversation = conversationsData.find(conv => conv.id === conversationIdParam);
              if (targetConversation) {
                setSelectedConversation(targetConversation);
                setShowChat(true);
                const messagesData = await getMessages(targetConversation.id!);
                setMessages(messagesData);
              }
            }
            // Don't auto-select any conversation - wait for user to click
          }
        } catch (error) {
          console.error('Error fetching client conversations:', error);
        } finally {
          setConversationsLoading(false);
        }
      }
    };

    fetchConversations();
  }, [user]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || !user) return;
    
    setSending(true);
    try {
      const result = await createMessage({
        conversation_id: selectedConversation.id!,
        sender_id: user.id,
        content: messageInput.trim()
      });
      
      if (result.error) {
        console.error('Error sending message:', result.error);
      } else if (result.data) {
        setMessages(prev => [...prev, result.data!]);
        setMessageInput('');
        // Refresh conversations to update last message
        const updatedConversations = await getClientConversations(user.id);
        setConversations(updatedConversations);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  
  const handleBackToList = () => {
    setShowChat(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        navigate('/client-login');
      }
    } catch (error) {
      console.error('Unexpected error during logout:', error);
    }
  };

  // Client navigation items
  const clientNavigation = [
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Discover Freelancers', href: '/discover', icon: Search },
    { name: 'Profile', href: '/client-profile', icon: UserCircle },
  ];

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getDisplayName = (conversation: Conversation) => {
    // For client messages, always show freelancer info
    if (conversation.freelancer_user && conversation.freelancer_user.length > 0) {
      const freelancer = conversation.freelancer_user[0];
      return freelancer.display_name || freelancer.username || 'Freelancer';
    }
    return 'Unknown Freelancer';
  };

  const getInitials = (conversation: Conversation) => {
    const name = getDisplayName(conversation);
    return name?.substring(0, 2).toUpperCase() || 'FL';
  };

const handleSelectConversation = (conversation: Conversation) => {
  setSelectedConversation(conversation);
  setShowChat(true);
  
  const loadMessages = async () => {
    try {
      const messagesData = await getMessages(conversation.id!);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };
  
  loadMessages();
};

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* DESKTOP SIDEBAR - Always Visible */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-[#1A1A1A] lg:bg-[#0A0A0A]/50 lg:backdrop-blur-xl lg:flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-transparent">
          <div className="flex items-center gap-2.5 group">
            <div className="bg-[#FFD700] p-1.5 rounded-lg shadow-sm shadow-[#FFD700]/20 group-hover:shadow-[#FFD700]/40 transition-shadow">
              <Briefcase className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight">FreelanceOS</span>
          </div>
        </div>
        
        <div className="px-4 py-4">
          <p className="px-3 text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider mb-2">
            Client Portal
          </p>
          <nav className="space-y-1">
            {clientNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group ${
                  location.pathname === item.href
                    ? 'bg-[var(--color-primary)]/20 text-white'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)]/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </nav>

          <div className="mt-8">
            <nav className="space-y-1">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[#A0A0A0] hover:bg-red-500/10 hover:text-red-400 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Log out</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </nav>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="mt-auto p-4 border-t border-[#1A1A1A]/60">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-black text-sm font-semibold">
              {userLoading ? (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                initial
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userLoading ? 'Loading...' : displayName}
              </p>
              <p className="text-xs text-[#A0A0A0] truncate">
                {userLoading ? 'Loading...' : userEmail}
              </p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-[#0A0A0A]/50 transition-colors">
              <Bell className="h-4 w-4 text-[#A0A0A0]" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE NAVBAR */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[var(--color-bg-main)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5 group">
            <div className="bg-[#FFD700] p-1.5 rounded-lg shadow-sm shadow-[#FFD700]/20 group-hover:shadow-[#FFD700]/40 transition-shadow">
              <Briefcase className="h-4 w-5 text-black" />
            </div>
            <span className="font-bold text-sm tracking-tight">FreelanceOS</span>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-500/50 hover:bg-red-500/70 transition-colors"
            >
              <LogOut className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col lg:ml-0 pt-16 lg:pt-0 min-h-screen lg:min-h-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6">
          <h1 className="text-2xl font-bold text-white">Client Messages</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0A0]" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="pl-10 pr-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]/50 w-full sm:w-auto text-base"
              />
            </div>
            <NotificationDropdown />
          </div>
        </div>

        <div className="flex-1 flex bg-[var(--color-bg-main)] rounded-2xl border border-[var(--color-border)] overflow-hidden relative mx-6 mb-6">
          {/* Conversations List - Always visible */}
          <div className={`w-full sm:w-80 bg-[var(--color-bg-main)] flex flex-col transition-transform duration-300 ${
            showChat ? 'absolute inset-0 z-10 sm:relative sm:z-0' : 'relative'
          } ${showChat ? 'translate-x-0 sm:translate-x-0' : 'translate-x-0'}`}>
            <div className="p-4 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Your Conversations</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="p-6 flex flex-col items-center justify-center">
                  <div className="loading-cube mb-4">
                    <div className="cube-face"></div>
                    <div className="cube-face"></div>
                    <div className="cube-face"></div>
                    <div className="cube-face"></div>
                    <div className="cube-face"></div>
                    <div className="cube-face"></div>
                  </div>
                  <div className="text-[var(--color-text-secondary)] text-sm">Loading conversations...</div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-[var(--color-text-secondary)]">No conversations yet. Start a conversation with a freelancer!</div>
              ) : (
                conversations.map((conversation: Conversation) => (
                  <div 
                    key={conversation.id} 
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-4 hover:bg-[var(--color-bg-secondary)]/50 cursor-pointer transition-colors border-b border-[var(--color-border)]/30 last:border-b-0 ${
                      selectedConversation?.id === conversation.id ? 'bg-[var(--color-primary)]/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-black text-sm font-semibold flex-shrink-0">
                        {getInitials(conversation)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-[var(--color-text-primary)] truncate">{getDisplayName(conversation)}</h3>
                          <span className="text-xs text-[var(--color-text-secondary)]">{formatTimeAgo(conversation.last_message_at)}</span>
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] truncate">Click to view messages</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area - Slides in from right */}
          <div className={`flex-1 bg-[var(--color-bg-main)] overflow-hidden flex flex-col min-w-0 transition-transform duration-300 ${
            showChat ? 'translate-x-0' : 'translate-x-full'
          } ${showChat ? 'absolute inset-0 z-20 sm:relative sm:z-0' : 'absolute inset-0'}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleBackToList}
                      className="p-3 hover:bg-[var(--color-bg-secondary)]/50 rounded-xl transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5 text-[var(--color-text-primary)]" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-black text-sm font-semibold">
                      {getInitials(selectedConversation)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{getDisplayName(selectedConversation)}</h3>
                      <p className="text-xs text-green-400">Freelancer</p>
                    </div>
                  </div>
                  <button className="p-3 hover:bg-[var(--color-bg-secondary)]/50 rounded-xl transition-colors">
                    <MoreVertical className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-[var(--color-text-secondary)] py-8">No messages yet. Start the conversation!</div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] sm:max-w-md px-4 py-3 rounded-2xl ${
                            message.sender_id === user?.id 
                            ? 'bg-[var(--color-primary)] text-black rounded-br-sm' 
                            : 'bg-[var(--color-bg-secondary)] text-white rounded-tl-sm'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-2 text-xs ${
                              message.sender_id === user?.id ? 'text-black/70' : 'text-[var(--color-text-secondary)]'
                            }`}>
                              <span>{formatTime(message.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-[var(--color-border)]">
                  <div className="flex items-center gap-3">
                    <button className="p-3 hover:bg-[var(--color-bg-secondary)]/50 rounded-xl transition-colors">
                      <Paperclip className="h-5 w-5 text-[var(--color-text-secondary)]" />
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      disabled={sending}
                      className="flex-1 px-4 py-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-white placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]/50 disabled:opacity-50 text-base"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={sending || !messageInput.trim()}
                      className="p-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5 text-black" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[var(--color-text-secondary)]">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        </div>

        {/* Toast Container */}
        <ToastContainer />
      </main>
    </div>
  );
}
