import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Send, Paperclip, MoreVertical, ArrowLeft, User, Briefcase } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getConversations, getMessages, createMessage, Conversation, Message } from "../../utils/supabase";
import { supabase } from "../../utils/supabase";
import NotificationDropdown from "../../components/NotificationDropdown";
import ToastContainer from "../../components/ToastContainer";
import { useNotifications } from "../../contexts/NotificationContext";

export default function ClientMessagesPage() {
  const { user } = useAuth();
  const { addToastNotification } = useNotifications();
  const [searchParams] = useSearchParams();
  const conversationIdParam = searchParams.get('conversation');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time message subscription for all conversations
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
          filter: `sender_id=neq.${user.id}` // Only messages from other users
        },
        (payload) => {
          const newMessage = payload.new as Message;
          console.log('New message received:', newMessage);
          
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
          const conversationsData = await getConversations(user.id);
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
          console.error('Error fetching conversations:', error);
        } finally {
          setLoading(false);
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
        const updatedConversations = await getConversations(user.id);
        setConversations(updatedConversations);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
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

  const handleBackToList = () => {
    setShowChat(false);
  };

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

  const getFreelancerUser = (conversation: Conversation) => {
    // For clients, we always want to see the freelancer's info
    const userData = conversation.freelancer_user;
    return userData?.[0] || {};
  };

  const getDisplayName = (conversation: Conversation) => {
    const freelancerUser = getFreelancerUser(conversation);
    
    // Use freelancer's display name or username
    if (freelancerUser.display_name || freelancerUser.username) {
      return freelancerUser.display_name || freelancerUser.username;
    }
    
    return 'Freelancer';
  };

  const getInitials = (conversation: Conversation) => {
    const name = getDisplayName(conversation);
    return name?.substring(0, 2).toUpperCase() || 'FL';
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-black via-[#0A0A0A] to-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFC700] rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <p className="text-xs text-[#A0A0A0]">Connect with freelancers</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Search freelancers..."
              className="pl-10 pr-4 py-3 bg-[#0A0A0A]/50 backdrop-blur-sm border border-[#1A1A1A]/50 rounded-xl text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50 w-full sm:w-auto text-base shadow-sm"
            />
          </div>
          <NotificationDropdown />
        </div>
      </div>

      <div className="flex-1 flex bg-[#0A0A0A]/30 backdrop-blur-xl rounded-2xl border border-[#1A1A1A]/50 overflow-hidden relative shadow-2xl">
        {/* Conversations List - Always visible */}
        <div className={`w-full sm:w-80 bg-[#0A0A0A]/50 backdrop-blur-sm flex flex-col transition-transform duration-300 ${
          showChat ? 'absolute inset-0 z-10 sm:relative sm:z-0' : 'relative'
        } ${showChat ? 'translate-x-0 sm:translate-x-0' : 'translate-x-0'}`}>
          <div className="p-4 border-b border-[#1A1A1A]/30 bg-gradient-to-r from-[#FFD700]/5 to-transparent">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse"></div>
              Your Conversations
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-[#A0A0A0] flex flex-col items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span>Loading conversations...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-[#A0A0A0] flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-[#1A1A1A]/50 rounded-2xl flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-[#FFD700]" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">No conversations yet</h3>
                  <p className="text-xs">Discover freelancers and start conversations</p>
                </div>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div 
                  key={conversation.id} 
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 hover:bg-[#1A1A1A]/50 cursor-pointer transition-all duration-200 border-b border-[#1A1A1A]/30 last:border-b-0 group ${
                    selectedConversation?.id === conversation.id ? 'bg-gradient-to-r from-[#FFD700]/10 to-[#FFD700]/5 border-l-2 border-l-[#FFD700]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFC700] flex items-center justify-center text-black text-sm font-semibold flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow">
                        {getInitials(conversation)}
                      </div>
                      {selectedConversation?.id !== conversation.id && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0A0A]"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-white truncate group-hover:text-[#FFD700] transition-colors">{getDisplayName(conversation)}</h3>
                        <span className="text-xs text-[#A0A0A0]">{formatTimeAgo(conversation.last_message_at)}</span>
                      </div>
                      <p className="text-xs text-[#A0A0A0] truncate">Click to view messages</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area - Slides in from right */}
        <div className={`flex-1 bg-[#0A0A0A]/30 backdrop-blur-sm overflow-hidden flex flex-col min-w-0 transition-transform duration-300 ${
          showChat ? 'translate-x-0' : 'translate-x-full'
        } ${showChat ? 'absolute inset-0 z-20 sm:relative sm:z-0' : 'absolute inset-0'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#1A1A1A]/30 bg-gradient-to-r from-[#FFD700]/5 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleBackToList}
                    className="p-3 hover:bg-[#1A1A1A]/50 rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFC700] flex items-center justify-center text-black text-sm font-semibold shadow-sm">
                      {getInitials(selectedConversation)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0A0A]"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{getDisplayName(selectedConversation)}</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-xs text-green-400">Freelancer</p>
                    </div>
                  </div>
                </div>
                <button className="p-3 hover:bg-[#1A1A1A]/50 rounded-xl transition-all duration-200 hover:scale-105">
                  <MoreVertical className="h-4 w-4 text-[#A0A0A0]" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-[#FFD700]/5">
                {messages.length === 0 ? (
                  <div className="text-center text-[#A0A0A0] py-8 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#1A1A1A]/50 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-white mb-1">Start the conversation!</h3>
                      <p className="text-xs">Send your first message to connect with this freelancer</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                        <div className={`max-w-[85%] sm:max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md ${
                          message.sender_id === user?.id 
                            ? 'bg-gradient-to-br from-[#FFD700] to-[#FFC700] text-black rounded-br-sm border border-[#FFD700]/20' 
                            : 'bg-[#1A1A1A]/80 backdrop-blur-sm text-white rounded-tl-sm border border-[#2A2A2A]/50'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className={`flex items-center gap-1 mt-2 text-xs ${
                            message.sender_id === user?.id ? 'text-black/70' : 'text-[#A0A0A0]'
                          }`}>
                            <span>{formatTime(message.created_at)}</span>
                            {message.sender_id === user?.id && (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-[#1A1A1A]/30 bg-gradient-to-r from-[#FFD700]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <button className="p-3 hover:bg-[#1A1A1A]/50 rounded-xl transition-all duration-200 hover:scale-105">
                    <Paperclip className="h-5 w-5 text-[#A0A0A0]" />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="flex-1 px-4 py-3 bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#2A2A2A]/50 rounded-xl text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50 disabled:opacity-50 text-base shadow-sm transition-all duration-200"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={sending || !messageInput.trim()}
                    className="p-3 bg-gradient-to-br from-[#FFD700] to-[#FFC700] hover:from-[#FFC700] hover:to-[#FFD700] rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:scale-105 disabled:hover:scale-100"
                  >
                    {sending ? (
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    ) : (
                      <Send className="h-5 w-5 text-black" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#A0A0A0]">
              <div className="text-center">
                <Briefcase className="w-16 h-16 text-[#FFD700] mx-auto mb-4" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
