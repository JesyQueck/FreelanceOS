import { useState, useEffect } from "react";
import { MessageSquare, Target, Eye, ArrowUpRight, Plus, Sparkles } from "lucide-react";
import { getUser, getServicesCount, getPortfoliosCount, getConversationsCount, getUserProfile, getRecentActivity, ActivityItem } from "../../utils/supabase";

interface DashboardData {
  displayName: string;
  servicesCount: number;
  portfoliosCount: number;
  convosCount: number;
  stepsCompleted: number;
  progressPercent: number;
  recentActivity: ActivityItem[];
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData>({
    displayName: '',
    servicesCount: 0,
    portfoliosCount: 0,
    convosCount: 0,
    stepsCompleted: 0,
    progressPercent: 0,
    recentActivity: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const user = await getUser();
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const [profile, servicesCount, portfoliosCount, convosCount] = await Promise.all([
          getUserProfile(user.id),
          getServicesCount(user.id),
          getPortfoliosCount(user.id),
          getConversationsCount(user.id)
        ]);

        const recentActivity = await getRecentActivity(user.id);
        const stepsCompleted = servicesCount > 0 ? 3 : 2;
        const progressPercent = (stepsCompleted / 5) * 100;

        setData({
          displayName: profile?.name || (user.email && user.email.split('@')[0]) || 'User',
          servicesCount,
          portfoliosCount,
          convosCount,
          stepsCompleted,
          progressPercent,
          recentActivity
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <>
      {/* Header & Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Good afternoon, {data.displayName}
          </h1>
          <p className="text-slate-400 text-lg">
            Here's what is happening with your freelance business today.
          </p>
        </div>
        <button className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 gap-2">
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      {/* Profile Completion Indicator */}
      <div className="bg-[#151B2B] rounded-xl p-8 border border-slate-800/60 shadow-sm relative overflow-hidden group mb-8">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-lg text-white">Profile is {data.progressPercent}% complete</h3>
            </div>
            <div className="w-full bg-slate-800 rounded-lg h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-lg transition-all duration-500"
                style={{ width: `${data.progressPercent}%` }}
              />
            </div>
            <p className="text-base text-slate-400">
              Complete your profile to attract more clients and appear in search results.
            </p>
          </div>
          <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Complete Profile
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#151B2B] rounded-xl p-8 border border-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-indigo-600/10 rounded-lg">
              <Target className="h-6 w-6 text-indigo-400" />
            </div>
            <span className="text-xs text-slate-500 font-medium">{data.servicesCount > 0 ? '+12%' : '0%'}</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{data.servicesCount}</h3>
          <p className="text-base text-slate-400">Active Services</p>
        </div>

        <div className="bg-[#151B2B] rounded-xl p-8 border border-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-green-600/10 rounded-lg">
              <Eye className="h-6 w-6 text-green-400" />
            </div>
            <span className="text-xs text-slate-500 font-medium">{data.portfoliosCount > 0 ? '+25%' : '0%'}</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{data.portfoliosCount}</h3>
          <p className="text-base text-slate-400">Portfolio Items</p>
        </div>

        <div className="bg-[#151B2B] rounded-xl p-8 border border-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-purple-600/10 rounded-lg">
              <MessageSquare className="h-6 w-6 text-purple-400" />
            </div>
            <span className="text-xs text-slate-500 font-medium">{data.convosCount > 0 ? '+8%' : '0%'}</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{data.convosCount}</h3>
          <p className="text-base text-slate-400">Conversations</p>
        </div>

        <div className="bg-[#151B2B] rounded-xl p-8 border border-slate-800/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="p-3 bg-amber-600/10 rounded-lg">
              <ArrowUpRight className="h-6 w-6 text-amber-400" />
            </div>
            <span className="text-xs text-slate-500 font-medium">{data.convosCount > 0 ? '+18%' : '0%'}</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">${data.servicesCount > 0 ? '$4,250' : '$0'}</h3>
          <p className="text-base text-slate-400">Monthly Revenue</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="bg-[#151B2B] rounded-xl border border-slate-800/60 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-800/60">
            {data.recentActivity.map((activity: ActivityItem) => (
              <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-lg ${
                    activity.type === 'message' ? 'bg-green-500' :
                    activity.type === 'system' ? 'bg-blue-500' : 'bg-amber-500'
                  }`}></div>
                  <div>
                    <p className="text-base font-medium text-white">{activity.name}</p>
                    <p className="text-sm text-slate-400">{activity.time}</p>
                  </div>
                </div>
                {activity.type === 'message' ? (
                  <MessageSquare className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                ) : activity.type === 'system' ? (
                  <Eye className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                ) : (
                  <Target className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
