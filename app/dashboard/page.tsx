import { createClient } from "@/utils/supabase/server";
import { MessageSquare, Target, Eye, ArrowUpRight, Plus, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch counts and profile from DB
  const [
    { data: profile },
    { count: servicesCount },
    { count: portfoliosCount },
    { count: convosCount }
  ] = await Promise.all([
    supabase.from("users").select("name").eq("id", user?.id).single(),
    supabase.from("services").select("*", { count: 'exact', head: true }).eq("user_id", user?.id),
    supabase.from("portfolios").select("*", { count: 'exact', head: true }).eq("user_id", user?.id),
    supabase.from("conversations").select("*", { count: 'exact', head: true }).or(`freelancer_id.eq.${user?.id},client_id.eq.${user?.id}`)
  ]);

  const displayName = profile?.name || user?.email?.split('@')[0] || 'User';
  const stepsCompleted = (servicesCount || 0) > 0 ? 3 : 2; 
  const progressPercent = (stepsCompleted / 5) * 100;

  return (
    <>
      {/* Header & Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
            Good afternoon, {displayName}
          </h1>
          <p className="text-slate-400">
            Here's what is happening with your freelance business today.
          </p>
        </div>
        <button className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white transition-all bg-indigo-600 rounded-full hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 gap-2">
          <Plus className="h-4 w-4" /> Add Service
        </button>
      </div>

      {/* Profile Completion Indicator */}
      <div className="bg-[#151B2B] rounded-2xl p-6 border border-slate-800/60 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-lg text-white">Profile is {progressPercent}% complete</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Add a professional bio and at least 3 services to unlock your public portfolio link.
            </p>
            
            <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2 overflow-hidden border border-slate-700/50">
              <div 
                className="bg-amber-500 h-2.5 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 font-medium text-right">{stepsCompleted} of 5 steps completed</p>
          </div>
          <Link href="/dashboard/profile" className="flex-shrink-0 bg-slate-800 border border-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm">
            Complete Profile
          </Link>
        </div>
      </div>

      {/* Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-[#151B2B] p-6 rounded-2xl border border-slate-800/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              12%
            </span>
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Active Conversations</p>
          <h4 className="text-3xl font-bold text-white">{convosCount || 0}</h4>
        </div>

        {/* Card 2 */}
        <div className="bg-[#151B2B] p-6 rounded-2xl border border-slate-800/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Total Services</p>
          <h4 className="text-3xl font-bold text-white">{servicesCount || 0}</h4>
        </div>

        {/* Card 3 */}
        <div className="bg-[#151B2B] p-6 rounded-2xl border border-slate-800/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
              <Eye className="h-5 w-5" />
            </div>
            <span className="flex items-center text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-lg">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              48%
            </span>
          </div>
          <p className="text-sm font-medium text-slate-400 mb-1">Profile Views</p>
          <h4 className="text-3xl font-bold text-white">428</h4>
        </div>
      </div>

      {/* Bottom Section Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Messages Area */}
        <div className="lg:col-span-2 bg-[#151B2B] border border-slate-800/60 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#151B2B]">
            <h2 className="text-lg font-semibold text-white">Recent Messages</h2>
            <Link href="/dashboard/messages" className="text-sm font-medium text-indigo-400 hover:underline">
              View Inbox
            </Link>
          </div>
          <div className="flex-1 p-8 text-center flex flex-col items-center justify-center bg-[#0B0F19]/50">
            <div className="h-16 w-16 bg-slate-800 border border-slate-700 shadow-sm rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Inbox zero</h3>
            <p className="text-slate-400 text-sm max-w-[250px]">
              You don't have any active threads right now. Share your profile to get started.
            </p>
          </div>
        </div>

        {/* Quick Links / Portfolio Card */}
        <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl shadow-lg border border-primary-500 flex flex-col text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-16 bg-white/10 blur-[50px] rounded-full" />
          <div className="absolute bottom-0 left-0 p-16 bg-indigo-900/40 blur-[50px] rounded-full" />
          
          <div className="p-6 relative z-10 flex-1 flex flex-col">
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/20">
              <ExternalLink className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Your Public Profile</h2>
            <p className="text-primary-100 text-sm mb-8 leading-relaxed">
              Your Notion-like profile is the center of your universe. Send it to clients so they can hire you seamlessly.
            </p>
            <div className="mt-auto">
              <button disabled className="w-full bg-white/10 text-white border border-white/20 py-2.5 rounded-xl text-sm font-medium backdrop-blur-md opacity-70 cursor-not-allowed">
                Link Locked (Complete Profile)
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
