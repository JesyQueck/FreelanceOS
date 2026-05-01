import { useState, useEffect, useRef } from "react";
import { X, Send, Paperclip, MoreVertical, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getMessages, createMessage, Message, Conversation } from "../utils/supabase";
import { supabase } from "../utils/supabase";

interface MessagingOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  conversation?: Conversation;
}

export default function MessagingOverlay({ isOpen, onClose, conversation }: MessagingOverlayProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversation) return;

    const loadMessages = async () => {
      try {
        const messagesData = await getMessages(conversation.id!);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [conversation]);

  // Real-time message subscription
  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversation || !user) return;
    
    setSending(true);
    try {
      const result = await createMessage({
        conversation_id: conversation.id!,
        sender_id: user.id,
        content: messageInput.trim()
      });
      
      if (result.error) {
        console.error('Error sending message:', result.error);
      } else {
        setMessageInput('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getDisplayName = (conv: Conversation) => {
    // For freelancer side, show client info
    if (conv.client_id && conv.client_id !== user?.id) {
      return conv.client_id;
    }
    return 'Unknown';
  };

  if (!isOpen || !conversation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center sm:items-center sm:justify-center">
      <div className="bg-[#151B2B] w-full sm:w-full sm:max-w-md sm:h-[600px] h-[70vh] sm:h-auto rounded-t-2xl sm:rounded-2xl border border-slate-800/60 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="sm:hidden p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
              {getDisplayName(conversation).charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">{getDisplayName(conversation)}</h3>
              <p className="text-xs text-green-400">Active now</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden sm:block p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
              <MoreVertical className="h-4 w-4 text-slate-400" />
            </button>
            <button 
              onClick={onClose}
              className="hidden sm:block p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-2">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender_id === user?.id 
                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${
                    message.sender_id === user?.id ? 'text-indigo-200' : 'text-slate-500'
                  }`}>
                    <span>{formatTime(message.created_at!)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
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
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 disabled:opacity-50"
              autoFocus
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
      </div>
    </div>
  );
}
