import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Send, Paperclip, MoreVertical, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getConversations, getMessages, createMessage, Conversation, Message } from "../../utils/supabase";
import { supabase } from "../../utils/supabase";
import NotificationDropdown from "../../components/NotificationDropdown";
import ToastContainer from "../../components/ToastContainer";
import { useNotifications } from "../../contexts/NotificationContext";

export default function MessagesPage() {
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
      .channel(`messages:${user.id}`)
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

  const getOtherUser = (conversation: Conversation) => {
    const isFreelancer = conversation.freelancer_id === user?.id;
    const userData = isFreelancer ? conversation.client_user : conversation.freelancer_user;
    return userData?.[0] || {};
  };

  const getDisplayName = (conversation: Conversation) => {
    const otherUser = getOtherUser(conversation);
    
    // If we have user data from the relationship, use it
    if (otherUser.display_name || otherUser.username) {
      return otherUser.display_name || otherUser.username;
    }
    
    // For client conversations, use the client_user data
    if (conversation.client_user && conversation.client_user.length > 0) {
      return conversation.client_user[0].display_name || 'Client';
    }
    
    return 'Unknown User';
  };

  const getInitials = (conversation: Conversation) => {
    const name = getDisplayName(conversation);
    return name?.substring(0, 2).toUpperCase() || 'UN';
  };

  return (
    <div className="h-full flex flex-col bg-[var(--color-bg-main)]">
      {/* Premium Background with Dot Grid */}
      <div className="fixed inset-0 dot-grid pointer-events-none" />
      
      {/* Subtle Blur Elements */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-[var(--color-primary)] subtle-blur rounded-full pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-64 h-64 bg-[var(--color-accent)] subtle-blur rounded-full pointer-events-none" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Messages</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="input pl-10 w-full sm:w-auto"
              />
            </div>
            <NotificationDropdown />
          </div>
        </div>

        <div className="flex-1 flex card overflow-hidden relative">
          {/* Conversations List - Always visible */}
          <div className={`w-full sm:w-80 flex flex-col transition-transform duration-300 ${
            showChat ? 'absolute inset-0 z-10 sm:relative sm:z-0' : 'relative'
          } ${showChat ? 'translate-x-0 sm:translate-x-0' : 'translate-x-0'}`}>
            <div className="p-4 border-b border-[var(--color-border)]">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">All Conversations</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-[var(--color-text-secondary)]">Loading conversations...</div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-[var(--color-text-secondary)]">No conversations yet</div>
              ) : (
              conversations.map((conversation) => (
                <div 
                  key={conversation.id} 
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 hover:bg-[var(--color-bg-secondary)]/50 cursor-pointer transition-colors border-b border-[var(--color-border)]/30 last:border-b-0 ${
                    selectedConversation?.id === conversation.id ? 'bg-[var(--color-primary)]/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-lg shadow-[var(--color-primary)]/20">
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
        <div className={`flex-1 overflow-hidden flex flex-col min-w-0 transition-transform duration-300 ${
          showChat ? 'translate-x-0' : 'translate-x-full'
        } ${showChat ? 'absolute inset-0 z-20 sm:relative sm:z-0' : 'absolute inset-0'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleBackToList}
                    className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-[var(--color-primary)]/20">
                    {getInitials(selectedConversation)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{getDisplayName(selectedConversation)}</h3>
                    <p className="text-xs text-[var(--color-success)]">Active now</p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors">
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
                            ? 'bg-[var(--color-primary)] text-white rounded-br-sm' 
                            : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-tl-sm'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <div className={`flex items-center gap-1 mt-2 text-xs ${
                            message.sender_id === user?.id ? 'text-white/70' : 'text-[var(--color-text-muted)]'
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
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors">
                    <Paperclip className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="input flex-1 disabled:opacity-50"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={sending || !messageInput.trim()}
                    className="btn btn-primary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 text-white" />
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
      </div>
    </div>
  );
}
