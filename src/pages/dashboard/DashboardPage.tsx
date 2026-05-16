import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Target, Eye, Plus, Sparkles } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getServicesCount, getPortfoliosCount, getConversationsCount, getActiveClientsCount, getUserProfile, getFreelancerProfile, getRecentActivity, ActivityItem, getConversations, Conversation, calculateProfileCompletion } from "../../utils/supabase";
import MessagingOverlay from "../../components/MessagingOverlay";
import LoadingSpinner from "../../components/LoadingSpinner";

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
  const { user } = useAuth();
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
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const [profile, freelancerProfile, servicesCount, portfoliosCount, convosCount, activeClientsCount] = await Promise.all([
          getUserProfile(user.id),
          getFreelancerProfile(user.id),
          getServicesCount(user.id),
          getPortfoliosCount(user.id),
          getConversationsCount(user.id),
          getActiveClientsCount(user.id)
        ]);

        // Calculate response rate (in a real app, this would be calculated from actual data)
        const responseRate = activeClientsCount > 0 ? Math.floor(Math.random() * 30) + 70 : 0;

        const recentActivity = await getRecentActivity(user.id);
        
        // Calculate real profile completion percentage using shared function
        const progressPercent = calculateProfileCompletion(profile, freelancerProfile);
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
  }, [user]);

  // Load conversations for messaging overlay
  useEffect(() => {
    const loadConversations = async () => {
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
  }, [user]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-[var(--color-error)] mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Premium Background with Dot Grid */}
      <div className="fixed inset-0 dot-grid pointer-events-none" />
      
      {/* Subtle Blur Elements */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-[var(--color-primary)] subtle-blur rounded-full pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-64 h-64 bg-[var(--color-accent)] subtle-blur rounded-full pointer-events-none" />
      
      {/* Main Content */}
      <div className="relative z-10">
        {/* Header & Welcome */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2">
              Good afternoon, {data.displayName}
            </h1>
            <p className="text-[var(--color-text-secondary)] text-lg">
              Here's what is happening with your freelance business today.
            </p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/services')}
            className="btn btn-primary"
          >
            <Plus className="h-5 w-5" /> Add Service
          </button>
        </div>

        {/* Profile Completion Indicator - Only show if not 100% complete */}
        {data.progressPercent < 100 && (
          <div className="card p-6 relative overflow-hidden group mb-8 animate-scale-in">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-[var(--color-primary)]" />
                  <h3 className="font-semibold text-lg text-[var(--color-text-primary)]">Profile is {data.progressPercent}% complete</h3>
                </div>
                <div className="w-full bg-[var(--color-bg-secondary)] rounded-lg h-2 mb-3">
                  <div 
                    className="bg-[var(--color-primary)] h-2 rounded-lg transition-all duration-500"
                    style={{ width: `${data.progressPercent}%` }}
                  />
                </div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Complete your profile to attract more clients and appear in search results.
                </p>
              </div>
              <button 
                onClick={() => navigate('/dashboard/profile')}
                className="btn btn-secondary"
              >
                Complete Profile
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 hover:scale-[1.02] animate-slide-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[var(--color-primary)]/10 rounded-lg">
                <Target className="h-5 w-5 text-[var(--color-primary)]" />
              </div>
              <span className="text-xs text-[var(--color-text-secondary)] font-medium">{data.servicesCount > 0 ? '+12%' : '0%'}</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">{data.servicesCount}</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Active Services</p>
          </div>

          <div className="card p-4 hover:scale-[1.02] animate-slide-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[var(--color-success)]/10 rounded-lg">
                <Eye className="h-5 w-5 text-[var(--color-success)]" />
              </div>
              <span className="text-xs text-[var(--color-text-secondary)] font-medium">{data.portfoliosCount > 0 ? '+25%' : '0%'}</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">{data.portfoliosCount}</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Portfolio Items</p>
          </div>

          <div className="card p-4 hover:scale-[1.02] animate-slide-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[var(--color-accent)]/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-[var(--color-accent)]" />
              </div>
              <span className="text-xs text-[var(--color-text-secondary)] font-medium">{data.activeClientsCount > 0 ? '+8%' : '0%'}</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">{data.activeClientsCount}</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Active Clients</p>
          </div>

          <div className="card p-4 hover:scale-[1.02] animate-slide-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-[var(--color-success)]/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-[var(--color-success)]" />
              </div>
              <span className="text-xs text-[var(--color-text-secondary)] font-medium">{data.responseRate > 0 ? '+5%' : '0%'}</span>
            </div>
            <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">{data.responseRate}%</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">Response Rate</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">Recent Activity</h2>
          <div className="space-y-4 animate-fade-in-up">
            {data.recentActivity.map((activity: ActivityItem) => (
              <div 
                key={activity.id} 
                className={`card p-6 flex items-center justify-between transition-colors ${
                  activity.type === 'message' ? 'hover:bg-[var(--color-bg-secondary)]/30 cursor-pointer' : 'hover:bg-[var(--color-bg-secondary)]/30'
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
                    activity.type === 'message' ? 'bg-[var(--color-success)]' :
                    activity.type === 'system' ? 'bg-[var(--color-info)]' : 'bg-[var(--color-warning)]'
                  }`}></div>
                  <div>
                    <p className="text-base font-medium text-[var(--color-text-primary)]">
                      {activity.type === 'message' ? (
                        <span className="hover:text-[var(--color-primary)] transition-colors">{activity.name}</span>
                      ) : (
                        activity.name
                      )}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">{activity.time}</p>
                  </div>
                </div>
                {activity.type === 'message' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">View chat</span>
                    <MessageSquare className="h-5 w-5 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                ) : activity.type === 'system' ? (
                  <Eye className="h-5 w-5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" />
                ) : (
                  <Target className="h-5 w-5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Messaging Overlay */}
        <MessagingOverlay 
          isOpen={showMessagingOverlay}
          onClose={() => setShowMessagingOverlay(false)}
          conversation={selectedConversation}
        />
      </div>
    </>
  );
}
