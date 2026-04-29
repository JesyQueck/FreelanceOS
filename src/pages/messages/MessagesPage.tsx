import { Search, Send, Paperclip, MoreVertical, Check, CheckCheck } from "lucide-react";

export default function MessagesPage() {
  // Mock conversations data
  const conversations = [
    {
      id: 1,
      name: "Sarah Jenkins",
      avatar: "SJ",
      lastMessage: "Thanks! Can we move forward with the high-fidelity designs?",
      time: "2 hours ago",
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: "Mike Chen",
      avatar: "MC",
      lastMessage: "The wireframes look great, let's proceed",
      time: "1 day ago",
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "ER",
      lastMessage: "When can we expect the first draft?",
      time: "2 days ago",
      unread: 1,
      online: false
    }
  ];

  // Mock messages for selected conversation
  const messages = [
    {
      id: 1,
      sender: "other",
      content: "Hi! I'm interested in your UI design services",
      time: "10:30 AM"
    },
    {
      id: 2,
      sender: "me",
      content: "Hi Sarah! I'd be happy to help. What kind of project are you working on?",
      time: "10:35 AM",
      read: true
    },
    {
      id: 3,
      sender: "other",
      content: "We need a complete redesign of our SaaS dashboard",
      time: "10:40 AM"
    },
    {
      id: 4,
      sender: "me",
      content: "That sounds like a great project. I have experience with SaaS dashboards. Can you tell me more about your current setup?",
      time: "10:45 AM",
      read: true
    },
    {
      id: 5,
      sender: "other",
      content: "Thanks! Can we move forward with the high-fidelity designs?",
      time: "11:00 AM"
    }
  ];

  return (
    <div className="h-full flex flex-col bg-[#0B0F19]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="pl-10 pr-4 py-2 bg-[#151B2B] border border-slate-800/60 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50"
          />
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Conversations List */}
        <div className="w-80 bg-[#151B2B] rounded-2xl border border-slate-800/60 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800/60">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">All Conversations</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div key={conversation.id} className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-800/30 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                      {conversation.avatar}
                    </div>
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#151B2B]"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-white truncate">{conversation.name}</h3>
                      <span className="text-xs text-slate-500">{conversation.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 truncate">{conversation.lastMessage}</p>
                      {conversation.unread > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-white text-xs font-medium rounded-full">
                          {conversation.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-[#151B2B] rounded-2xl border border-slate-800/60 overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                  SJ
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#151B2B]"></div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Sarah Jenkins</h3>
                <p className="text-xs text-green-400">Active now</p>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
              <MoreVertical className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender === 'me' 
                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-sm'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs ${
                    message.sender === 'me' ? 'text-indigo-200' : 'text-slate-500'
                  }`}>
                    <span>{message.time}</span>
                    {message.sender === 'me' && (
                      message.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-800/60">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
                <Paperclip className="h-4 w-4 text-slate-400" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50"
              />
              <button className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">
                <Send className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
