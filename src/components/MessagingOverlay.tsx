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
      {/* Premium Background with Dot Grid */}
      <div className="fixed inset-0 dot-grid pointer-events-none" />
      
      {/* Subtle Blur Elements */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-[var(--color-primary)] subtle-blur rounded-full pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-64 h-64 bg-[var(--color-accent)] subtle-blur rounded-full pointer-events-none" />
      
      <div className="card w-full sm:w-full sm:max-w-md sm:h-[600px] h-[70vh] sm:h-auto rounded-t-2xl sm:rounded-2xl flex flex-col animate-scale-in relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="sm:hidden p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-[var(--color-text-secondary)]" />
            </button>
            <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-semibold shadow-lg shadow-[var(--color-primary)]/20">
              {getDisplayName(conversation).charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">{getDisplayName(conversation)}</h3>
              <p className="text-xs text-[var(--color-success)]">Active now</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden sm:block p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors">
              <MoreVertical className="h-4 w-4 text-[var(--color-text-secondary)]" />
            </button>
            <button 
              onClick={onClose}
              className="hidden sm:block p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors"
            >
              <X className="h-4 w-4 text-[var(--color-text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--color-text-secondary)]">No messages yet</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender_id === user?.id 
                    ? 'bg-[var(--color-primary)] text-white rounded-br-sm' 
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-tl-sm'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${
                    message.sender_id === user?.id ? 'text-white/80' : 'text-[var(--color-text-muted)]'
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
        <div className="p-4 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors">
              <Paperclip className="h-4 w-4 text-[var(--color-text-secondary)]" />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Type a message..."
              disabled={sending}
              className="input flex-1"
              autoFocus
            />
            <button 
              onClick={handleSendMessage}
              disabled={sending || !messageInput.trim()}
              className="btn btn-primary p-2"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
