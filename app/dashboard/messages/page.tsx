"use client";

import { useEffect, useState, useRef } from "react";
import { Send, Search, MoreVertical, Paperclip, Smile } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Mock Data for UI presentation
const mockConversations = [
  { 
    id: "conv-1", 
    freelancer_id: "me", 
    client_id: "client-1",
    client_name: "Sarah Jenkins", 
    last_message_at: new Date(Date.now() - 100000).toISOString(),
    last_message: "Looks great, let's proceed."
  },
  { 
    id: "conv-2", 
    freelancer_id: "me", 
    client_id: "client-2",
    client_name: "Michael Chen", 
    last_message_at: new Date(Date.now() - 500000).toISOString(),
    last_message: "When can we schedule a call?"
  },
];

const mockInitialMessages = [
  { id: "msg1", conversation_id: "conv-1", sender_id: "client-1", content: "Hi! I just saw your portfolio. Are you available for a new project?", created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "msg2", conversation_id: "conv-1", sender_id: "me", content: "Hi Sarah! Yes, I currently have availability starting next week. What do you need help with?", created_at: new Date(Date.now() - 3500000).toISOString() },
  { id: "msg3", conversation_id: "conv-1", sender_id: "client-1", content: "We need a complete redesign of our internal dashboard.", created_at: new Date(Date.now() - 3400000).toISOString() },
  { id: "msg4", conversation_id: "conv-1", sender_id: "client-1", content: "Looks great, let's proceed.", created_at: new Date(Date.now() - 100000).toISOString() },
];

export default function MessagesDashboardPage() {
  const supabase = createClient();
  const [messages, setMessages] = useState<any[]>(mockInitialMessages);
  const [conversations, setConversations] = useState<any[]>(mockConversations);
  const [newMessage, setNewMessage] = useState("");
  const [activeConversation, setActiveConversation] = useState(mockConversations[0]);
  const [myUserId, setMyUserId] = useState<string>("me");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Actual Supabase Logic for Deal Room (Uncomment when fully authenticated)
  useEffect(() => {
    const fetchRealData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setMyUserId(user.id);
      
      // Fetch Conversations
      const { data: convs } = await supabase
        .from("conversations")
        .select("*")
        .or(`freelancer_id.eq.${user.id},client_id.eq.${user.id}`)
        .order("last_message_at", { ascending: false });
        
      if (convs && convs.length > 0) {
        setConversations(convs);
        setActiveConversation(convs[0]);
      }
    };
    
    fetchRealData();

    // Subscribe to new messages for deal room real-time chat
    const channel = supabase
      .channel('realtime_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        // If the message belongs to the currently active conversation, display it
        if (payload.new.conversation_id === activeConversation?.id) {
          setMessages((prev) => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, activeConversation?.id]); // Re-bind the channel/if check when activeConversation changes

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Optimistic UI Update
    const mockMsg = {
      id: Math.random().toString(),
      conversation_id: activeConversation.id,
      sender_id: myUserId,
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, mockMsg]);
    setNewMessage("");

    // Actual Database Insert
    /*
    await supabase.from("messages").insert({
      conversation_id: activeConversation.id,
      sender_id: myUserId,
      content: mockMsg.content,
    });
    
    // Update last_message_at on the conversation
    await supabase.from("conversations")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", activeConversation.id);
    */
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-140px)] bg-white dark:bg-[#151B2B] flex overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm mx-auto max-w-6xl">
      
      {/* LEFT: Conversation List */}
      <div className="w-80 flex-shrink-0 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col bg-slate-50/50 dark:bg-[#0B0F19]/50">
        <div className="h-16 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-6">
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">Deal Rooms</h2>
        </div>
        
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search workspaces..." 
              className="w-full bg-slate-200/50 dark:bg-slate-800/80 border-transparent rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white placeholder:text-slate-500 transition-shadow"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => {
            const isActive = activeConversation.id === conv.id;
            return (
              <div 
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={`px-4 py-4 cursor-pointer transition-colors border-l-2 ${
                  isActive 
                  ? "bg-white dark:bg-slate-800 border-primary-500" 
                  : "border-transparent hover:bg-slate-200/30 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex gap-3 items-center">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-400 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm">
                      {conv.client_name?.charAt(0) || "C"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">{conv.client_name || "Client"}</h4>
                      <span className="text-[10px] text-slate-500 flex-shrink-0 ml-2">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{conv.last_message || "Active deal room"}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT: Active Chat / Deal Room */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-[#0B0F19] relative">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l1.373 1.373v57.254l-1.373 1.373H1.373L0 58.627V1.373L1.373 0h53.254zM2 2v56h56V2H2zm2 2h52v52H4V4zm9.373 11L12 16.373V44.627L13.373 46h33.254L48 44.627V16.373L46.627 15H13.373zM15 17h30v26H15V17z' fill='%23000000' fill-rule='evenodd'/%3E%3C/svg%3E")`}} />

        <div className="h-16 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-[#151B2B]/90 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-400 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm">
              {activeConversation.client_name?.charAt(0) || "C"}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">{activeConversation.client_name || "Client"}</h3>
              <p className="text-xs text-slate-500 font-medium tracking-wide">Deal Room Active</p>
            </div>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 z-10 space-y-6">
          <div className="flex justify-center mb-8">
            <span className="text-xs font-medium bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 py-1 px-3 rounded-full">
              Deal room created
            </span>
          </div>
          {messages.map((msg) => {
            const isMe = msg.sender_id === myUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out fill-mode-backwards`} style={{ animationDelay: '50ms' }}>
                <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${
                  isMe 
                  ? 'bg-primary-600 text-white rounded-br-sm' 
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/50 rounded-bl-sm'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <span className={`text-[10px] block mt-1.5 font-medium ${isMe ? 'text-primary-200 text-right' : 'text-slate-400'}`}>
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white dark:bg-[#151B2B] border-t border-slate-200/60 dark:border-slate-800/60 z-10">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <Paperclip className="h-5 w-5" />
            </button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Message in Deal Room..."
                className="w-full bg-slate-100 dark:bg-[#0B0F19] border border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-primary-500 rounded-full py-3 px-5 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 transition-all outline-none"
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Smile className="h-5 w-5" />
              </button>
            </div>
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="p-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 dark:disabled:bg-primary-800 disabled:cursor-not-allowed text-white rounded-full transition-all shadow-sm flex items-center justify-center min-w-[48px]"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
      
    </div>
  );
}
