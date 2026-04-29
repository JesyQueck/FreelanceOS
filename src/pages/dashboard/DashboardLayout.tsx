import { Outlet, Link, useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  LayoutDashboard, 
  UserCircle, 
  Target, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Bell, 
  Menu, 
  X 
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useState, useEffect } from "react";
import { getUserProfile } from "../../utils/supabase";
import NotificationDropdown from "../../components/NotificationDropdown";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<{ display_name?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('Fetching profile for user:', user.id);
      getUserProfile(user.id)
        .then((profile) => {
          console.log('User profile fetched:', profile);
          setUserProfile(profile);
        })
        .catch((error) => {
          console.error('Error fetching user profile:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const displayName = userProfile?.display_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const initial = displayName.charAt(0).toUpperCase();
  
  // Show loading state while profile is being fetched
  if (loading) {
    return (
      <div className="flex h-screen bg-[#0B0F19] text-slate-50 overflow-hidden font-sans">
        <div className="flex items-center justify-center w-full">
          <div className="text-slate-400">Loading...</div>
        </div>
      </div>
    );
  }
  
  console.log('Dashboard display data:', { displayName, userEmail, userProfile });

  const handleLogout = async () => {
    try {
      const { signOut } = await import("../../utils/supabase");
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-[#0B0F19] text-slate-50 overflow-hidden font-sans">
      
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MOBILE NAVBAR */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0F1523]/80 backdrop-blur-xl border-b border-slate-800/60">
        <div className="flex items-center justify-between px-4 py-3">
          <Link 
            className="flex items-center gap-2.5 group" 
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-sm shadow-indigo-600/20 group-hover:shadow-indigo-600/40 transition-shadow">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">FreelanceOS</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-[#151B2B]/50 hover:bg-[#151B2B] transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 border-r border-slate-800/60 bg-[#0F1523]/50 backdrop-blur-xl flex-shrink-0 flex flex-col 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-20 flex items-center px-6 border-b border-transparent">
          <Link 
          className="flex items-center gap-2.5 group" 
          to="/dashboard"
          onClick={() => setSidebarOpen(false)}
        >
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
            <Link 
              to="/dashboard" 
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors group"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Dashboard</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <Link 
              to="/dashboard/profile" 
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors group"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center gap-3">
                <UserCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Profile</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <Link 
              to="/dashboard/services" 
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors group"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Services</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <Link 
              to="/dashboard/messages" 
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors group"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Messages</span>
              </div>
              <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </nav>
          
          <div className="mt-8">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Settings
            </p>
            <nav className="space-y-1">
              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-colors group">
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Settings</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">Log out</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </nav>
          </div>
        </div>
        
        {/* User Profile Section */}
        <div className="mt-auto p-4 border-t border-slate-800/60">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
              {loading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
              ) : (
                initial
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {loading ? 'Loading...' : displayName}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {loading ? 'Loading...' : userEmail}
              </p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
              <Bell className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pt-20 lg:pt-6 p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
