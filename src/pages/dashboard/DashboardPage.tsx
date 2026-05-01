import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Target, Eye, Plus, Sparkles } from "lucide-react";
import { getUser, getServicesCount, getPortfoliosCount, getConversationsCount, getActiveClientsCount, getUserProfile, getRecentActivity, ActivityItem, getConversations, Conversation } from "../../utils/supabase";
import MessagingOverlay from "../../components/MessagingOverlay";

interface DashboardData {
  displayName: string;
  servicesCount: number;
  portfoliosCount: number;
  convosCount: number;
  activeClientsCount: number;
  responseRate: number;
  stepsCompleted: number;
  progressPercent: number;
  recentActivity: ActivityItem[];
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMessagingOverlay, setShowMessagingOverlay] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | undefined>(undefined);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [data, setData] = useState<DashboardData>({
    displayName: '',
    servicesCount: 0,
    portfoliosCount: 0,
    convosCount: 0,
    activeClientsCount: 0,
    responseRate: 0,
    stepsCompleted: 0,
    progressPercent: 0,
    recentActivity: []
  });

  useEffect(() => {
    const loadDashboardData = async (retryCount = 0) => {
      try {
        const user = await getUser();
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const [profile, servicesCount, portfoliosCount, convosCount, activeClientsCount] = await Promise.all([
          getUserProfile(user.id),
          getServicesCount(user.id),
          getPortfoliosCount(user.id),
          getConversationsCount(user.id),
          getActiveClientsCount(user.id)
        ]);

        // Calculate response rate (in a real app, this would be calculated from actual data)
        const responseRate = activeClientsCount > 0 ? Math.floor(Math.random() * 30) + 70 : 0;

        const recentActivity = await getRecentActivity(user.id);
        
        // Calculate real profile completion percentage
        const calculateProfileCompletion = (profile: any) => {
          let completedFields = 0;
          const totalFields = 6;
          
          // Check display_name (set during signup)
          if (profile?.display_name && profile.display_name.trim().length > 0) {
            completedFields++;
          }
          
          // Check name (professional name)
          if (profile?.name && profile.name.trim().length > 0) {
            completedFields++;
          }
          
          // Check bio
          if (profile?.bio && profile.bio.trim().length > 0) {
            completedFields++;
          }
          
          // Check profile_image
          if (profile?.profile_image && profile.profile_image.trim().length > 0) {
            completedFields++;
          }
          
          // Check skills array
          if (profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0) {
            completedFields++;
          }
          
          // Check username (for portfolio sharing)
          if (profile?.username && profile.username.trim().length > 0) {
            completedFields++;
          }
          
          return Math.round((completedFields / totalFields) * 100);
        };
        
        const progressPercent = calculateProfileCompletion(profile);
        const stepsCompleted = Math.floor((progressPercent / 100) * 5);

        setData({
          displayName: profile?.display_name || (user.email && user.email.split('@')[0]) || 'User',
          servicesCount,
          portfoliosCount,
          convosCount,
          activeClientsCount,
          responseRate,
          stepsCompleted,
          progressPercent,
          recentActivity
        });
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('Dashboard error:', err);
        
        // Retry logic for network errors
        if (retryCount < 2 && (
          err instanceof Error && 
          (err.message.includes('fetch') || 
           err.message.includes('network') || 
           err.message.includes('timeout'))
        )) {
          console.log(`Retrying dashboard load... Attempt ${retryCount + 1}`);
          setTimeout(() => loadDashboardData(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        
        setError('Failed to load dashboard data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Load conversations for messaging overlay
  useEffect(() => {
    const loadConversations = async () => {
      const user = await getUser();
      if (user) {
        try {
          const conversationsData = await getConversations(user.id);
          setConversations(conversationsData);
        } catch (error) {
          console.error('Error loading conversations:', error);
        }
      }
    };

    loadConversations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header & Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F9FAFB] mb-2">
            Good afternoon, {data.displayName}
          </h1>
          <p className="text-[#9CA3AF] text-lg">
            Here's what is happening with your freelance business today.
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard/services')}
          className="inline-flex items-center justify-center px-6 py-4 text-sm font-medium text-black transition-all bg-[#FFD700] rounded-xl hover:bg-[#FFC700] shadow-lg shadow-[#FFD700]/20 gap-2 min-h-[48px]"
        >
          <Plus className="h-5 w-5" /> Add Service
        </button>
      </div>

      {/* Profile Completion Indicator */}
      <div className="bg-[#0A0A0A] rounded-xl p-6 border border-[#1A1A1A] shadow-sm relative overflow-hidden group mb-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-[#FFD700]" />
              <h3 className="font-semibold text-lg text-white">Profile is {data.progressPercent}% complete</h3>
            </div>
            <div className="w-full bg-[#1A1A1A] rounded-lg h-2 mb-3">
              <div 
                className="bg-[#FFD700] h-2 rounded-lg transition-all duration-500"
                style={{ width: `${data.progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-[#A0A0A0]">
              Complete your profile to attract more clients and appear in search results.
            </p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/profile')}
            className="px-4 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-xl text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors cursor-pointer min-h-[44px]"
          >
            Complete Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[#1A1A1A] shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-[#FFD700]/10 rounded-lg">
              <Target className="h-5 w-5 text-[#FFD700]" />
            </div>
            <span className="text-xs text-[#A0A0A0] font-medium">{data.servicesCount > 0 ? '+12%' : '0%'}</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{data.servicesCount}</h3>
          <p className="text-sm text-[#A0A0A0]">Active Services</p>
        </div>

        <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[#1A1A1A] shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-600/10 rounded-lg">
              <Eye className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-xs text-[#A0A0A0] font-medium">{data.portfoliosCount > 0 ? '+25%' : '0%'}</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{data.portfoliosCount}</h3>
          <p className="text-sm text-[#A0A0A0]">Portfolio Items</p>
        </div>

        <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[#1A1A1A] shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-600/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-xs text-[#A0A0A0] font-medium">{data.activeClientsCount > 0 ? '+8%' : '0%'}</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{data.activeClientsCount}</h3>
          <p className="text-sm text-[#A0A0A0]">Active Clients</p>
        </div>

        <div className="bg-[#0A0A0A] rounded-xl p-4 border border-[#1A1A1A] shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-600/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-400" />
            </div>
            <span className="text-xs text-[#A0A0A0] font-medium">{data.responseRate > 0 ? '+5%' : '0%'}</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{data.responseRate}%</h3>
          <p className="text-sm text-[#A0A0A0]">Response Rate</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="bg-[#0A0A0A] rounded-xl border border-[#1A1A1A] shadow-sm overflow-hidden">
          <div className="divide-y divide-[#1A1A1A]/60">
            {data.recentActivity.map((activity: ActivityItem) => (
              <div 
                key={activity.id} 
                className={`p-6 flex items-center justify-between transition-colors ${
                  activity.type === 'message' ? 'hover:bg-[#1A1A1A]/30 cursor-pointer' : 'hover:bg-[#1A1A1A]/30'
                }`}
                onClick={() => {
                  if (activity.type === 'message') {
                    const conversation = conversations.find(conv => conv.id === activity.id);
                    if (conversation) {
                      setSelectedConversation(conversation);
                      setShowMessagingOverlay(true);
                    }
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-lg ${
                    activity.type === 'message' ? 'bg-green-500' :
                    activity.type === 'system' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}></div>
                  <div>
                    <p className="text-base font-medium text-white">
                      {activity.type === 'message' ? (
                        <span className="hover:text-[#FFD700] transition-colors">{activity.name}</span>
                      ) : (
                        activity.name
                      )}
                    </p>
                    <p className="text-sm text-[#A0A0A0]">{activity.time}</p>
                  </div>
                </div>
                {activity.type === 'message' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#FFD700] hover:text-[#FFC700] transition-colors">View chat</span>
                    <MessageSquare className="h-5 w-5 text-[#A0A0A0] hover:text-[#FFD700] transition-colors" />
                  </div>
                ) : activity.type === 'system' ? (
                  <Eye className="h-5 w-5 text-[#A0A0A0] hover:text-white transition-colors" />
                ) : (
                  <Target className="h-5 w-5 text-[#A0A0A0] hover:text-white transition-colors" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messaging Overlay */}
      <MessagingOverlay 
        isOpen={showMessagingOverlay}
        onClose={() => setShowMessagingOverlay(false)}
        conversation={selectedConversation}
      />
    </>
  );
}
