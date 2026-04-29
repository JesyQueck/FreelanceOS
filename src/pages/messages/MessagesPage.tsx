import { useState, useEffect, useRef } from "react";
import { Search, Send, Paperclip, MoreVertical } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getConversations, getMessages, createMessage, Conversation, Message } from "../../utils/supabase";
import { supabase } from "../../utils/supabase";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const subscriptionRef = useRef<any>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time message subscription
  useEffect(() => {
    if (!selectedConversation) return;

    const channel = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [selectedConversation]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (user) {
        try {
          const conversationsData = await getConversations(user.id);
          setConversations(conversationsData);
          if (conversationsData.length > 0) {
            setSelectedConversation(conversationsData[0]);
            const messagesData = await getMessages(conversationsData[0].id!);
            setMessages(messagesData);
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

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    try {
      const messagesData = await getMessages(conversation.id!);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
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
    
    // For client IDs (starting with 'client-'), extract name from the client_id
    if (conversation.client_id?.startsWith('client-')) {
      // Extract name from client_id (e.g., "client-john-doe" -> "John Doe")
      const namePart = conversation.client_id.replace('client-', '').replace(/-/g, ' ');
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    
    return 'Unknown User';
  };

  const getInitials = (conversation: Conversation) => {
    const name = getDisplayName(conversation);
    return name?.substring(0, 2).toUpperCase() || 'UN';
  };

  return (
    <div className="h-full flex flex-col bg-[#0B0F19]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="pl-10 pr-4 py-2 bg-[#151B2B] border border-slate-800/60 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 w-full sm:w-auto"
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        {/* Conversations List */}
        <div className="w-full lg:w-80 bg-[#151B2B] rounded-2xl border border-slate-800/60 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800/60">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">All Conversations</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-400">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-slate-400">No conversations yet</div>
            ) : (
              conversations.map((conversation) => (
                <div 
                  key={conversation.id} 
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-800/30 last:border-b-0 ${
                    selectedConversation?.id === conversation.id ? 'bg-slate-800/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(conversation)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-white truncate">{getDisplayName(conversation)}</h3>
                        <span className="text-xs text-slate-500">{formatTimeAgo(conversation.last_message_at)}</span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">Click to view messages</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-[#151B2B] rounded-2xl border border-slate-800/60 overflow-hidden flex flex-col min-w-0">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials(selectedConversation)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{getDisplayName(selectedConversation)}</h3>
                    <p className="text-xs text-green-400">Active now</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                  <MoreVertical className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">No messages yet. Start the conversation!</div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender_id === user?.id 
                            ? 'bg-indigo-600 text-white rounded-br-sm' 
                            : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center gap-1 mt-1 text-xs ${
                            message.sender_id === user?.id ? 'text-indigo-200' : 'text-slate-500'
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
              <div className="p-4 border-t border-slate-800/60">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                    <Paperclip className="h-4 w-4 text-slate-400" />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    disabled={sending}
                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 disabled:opacity-50"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={sending || !messageInput.trim()}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
