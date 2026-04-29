import Link from "next/link";
import { Briefcase, LayoutDashboard, UserCircle, Target, MessageSquare, Settings, LogOut, ChevronRight, Bell } from "lucide-react";
import { signout } from "@/app/login/actions";
import { createClient } from "@/utils/supabase/server";

import NotificationBell from "@/components/NotificationBell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex h-screen bg-[#0B0F19] text-slate-50 overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800/60 bg-[#0F1523]/50 backdrop-blur-xl flex-shrink-0 flex flex-col z-20">
        <div className="h-20 flex items-center px-6 border-b border-transparent">
          <Link className="flex items-center gap-2.5 group" href="/dashboard">
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm shadow-indigo-600/20 group-hover:shadow-indigo-600/40 transition-shadow">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">FreelanceOS</span>
          </Link>
        </div>
        
        <div className="px-4 py-4">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Overview
          </p>
          <nav className="space-y-1">
            <Link href="/dashboard" className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors group">
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Dashboard</span>
              </div>
            </Link>
          </nav>
        </div>

        <div className="px-4 py-2 flex-1">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Management
          </p>
          <nav className="space-y-1">
            <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors group">
              <UserCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">My Profile</span>
            </Link>
            <Link href="/dashboard/services" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors group">
              <Target className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">My Services</span>
            </Link>
            <Link href="/dashboard/messages" className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors group">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Deal Rooms</span>
              </div>
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors group">
              <Settings className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-semibold text-white shadow-sm ring-2 ring-slate-900">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.email || 'user@example.com'}
              </p>
              <p className="text-xs text-slate-500 truncate">Free Plan</p>
            </div>
          </div>
          <form action={signout}>
            <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Background Decorative Blob */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

        <header className="h-20 flex justify-end items-center px-8 flex-shrink-0 z-10 border-b border-transparent">
          <NotificationBell />
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 w-full scroll-smooth">
          <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
