import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  Briefcase, 
  LayoutDashboard, 
  UserCircle, 
  Target, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Bell 
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase, getUserDataSafe } from "../../utils/supabase";
import NotificationDropdown from "../../components/NotificationDropdown";
import MobileBottomNav from "../../components/MobileBottomNav";

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [initial, setInitial] = useState('');
  const [loading, setLoading] = useState(true);
  const [userDataFetched, setUserDataFetched] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || userDataFetched) {
        setLoading(false);
        return;
      }

      try {
        const { data, exists } = await getUserDataSafe(user.id, 'display_name, email');

        if (!exists || !data) {
          // User doesn't exist in users table, use auth data
          setDisplayName(user.email?.split('@')[0] || 'User');
          setUserEmail(user.email || '');
          setInitial(user.email?.charAt(0).toUpperCase() || 'U');
        } else {
          setDisplayName(data.display_name || user.email?.split('@')[0] || 'User');
          setUserEmail(data.email || user.email || '');
          setInitial((data.display_name || user.email || 'U').charAt(0).toUpperCase());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setDisplayName(user.email?.split('@')[0] || 'User');
        setUserEmail(user.email || '');
        setInitial(user.email?.charAt(0).toUpperCase() || 'U');
      } finally {
        setLoading(false);
        setUserDataFetched(true); // Prevent repeated requests
      }
    };

    fetchUserData();
  }, [user, userDataFetched]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/dashboard/profile', icon: UserCircle },
    { name: 'Services', href: '/dashboard/services', icon: Target },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* DESKTOP SIDEBAR - Always Visible */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-[#1A1A1A] lg:bg-[#0A0A0A]/50 lg:backdrop-blur-xl lg:flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-transparent">
          <Link 
            className="flex items-center gap-2.5 group" 
            to="/dashboard"
          >
            <div className="bg-[#FFD700] p-1.5 rounded-lg shadow-sm shadow-[#FFD700]/20 group-hover:shadow-[#FFD700]/40 transition-shadow">
              <Briefcase className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight">FreelanceOS</span>
          </Link>
        </div>
        
        <div className="px-4 py-4">
          <p className="px-3 text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider mb-2">
            Overview
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group ${
                  location.pathname === item.href
                    ? 'bg-[#FFD700]/20 text-white'
                    : 'text-[#A0A0A0] hover:bg-[#0A0A0A]/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </nav>

          <div className="mt-8">
            <nav className="space-y-1">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[#A0A0A0] hover:bg-red-500/10 hover:text-red-400 transition-colors group"
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
        <div className="mt-auto p-4 border-t border-[#1A1A1A]/60">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-black text-sm font-semibold">
              {loading ? (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                initial
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {loading ? 'Loading...' : displayName}
              </p>
              <p className="text-xs text-[#A0A0A0] truncate">
                {loading ? 'Loading...' : userEmail}
              </p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-[#0A0A0A]/50 transition-colors">
              <Bell className="h-4 w-4 text-[#A0A0A0]" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE SIDEBAR - Slide out overlay */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 border-r border-[#1A1A1A] bg-[#0A0A0A]/50 backdrop-blur-xl flex-shrink-0 flex flex-col
        lg:hidden
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-20 flex items-center px-6 border-b border-transparent">
          <Link 
            className="flex items-center gap-2.5 group" 
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="bg-[#FFD700] p-1.5 rounded-lg shadow-sm shadow-[#FFD700]/20 group-hover:shadow-[#FFD700]/40 transition-shadow">
              <Briefcase className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight">FreelanceOS</span>
          </Link>
        </div>
        
        <div className="px-4 py-4">
          <p className="px-3 text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider mb-2">
            Overview
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors group ${
                  location.pathname === item.href
                    ? 'bg-[#FFD700]/20 text-white'
                    : 'text-[#A0A0A0] hover:bg-[#0A0A0A]/50 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </nav>

          <div className="mt-8">
            <nav className="space-y-1">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[#A0A0A0] hover:bg-red-500/10 hover:text-red-400 transition-colors group"
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
        <div className="mt-auto p-4 border-t border-[#1A1A1A]/60">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center text-black text-sm font-semibold">
              {loading ? (
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                initial
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {loading ? 'Loading...' : displayName}
              </p>
              <p className="text-xs text-[#A0A0A0] truncate">
                {loading ? 'Loading...' : userEmail}
              </p>
            </div>
            <button className="p-1.5 rounded-lg hover:bg-[#0A0A0A]/50 transition-colors">
              <Bell className="h-4 w-4 text-[#A0A0A0]" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE NAVBAR */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-[#1A1A1A]">
        <div className="flex items-center justify-between px-4 py-3">
          <Link 
            className="flex items-center gap-2.5 group" 
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="bg-[#FFD700] p-1.5 rounded-lg shadow-sm shadow-[#FFD700]/20 group-hover:shadow-[#FFD700]/40 transition-shadow">
              <Briefcase className="h-4 w-4 text-black" />
            </div>
            <span className="font-bold text-sm tracking-tight">FreelanceOS</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <Link
              to="/dashboard/settings"
              className="p-2 rounded-lg bg-[#1A1A1A]/50 hover:bg-[#1A1A1A] transition-colors"
            >
              <Settings className="h-5 w-5 text-white" />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-500/50 hover:bg-red-500/70 transition-colors"
            >
              <LogOut className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - Takes remaining space after sidebar */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pt-20 lg:pt-6 p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <MobileBottomNav />
    </div>
  );
}
