import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Target, 
  UserCircle 
} from 'lucide-react';

export default function MobileBottomNav() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
    { name: 'Services', href: '/dashboard/services', icon: Target },
    { name: 'Profile', href: '/dashboard/profile', icon: UserCircle },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-[#1A1A1A]">
      <div className="flex items-center justify-around h-16 px-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive
                  ? 'text-white'
                  : 'text-[#A0A0A0] hover:text-white'
              }`}
            >
              <div className={`relative transition-transform duration-200 ${
                isActive ? 'scale-110' : 'scale-100'
              }`}>
                {isActive && (
                  <div className="absolute -inset-1 bg-[#FFD700] rounded-lg opacity-20 blur-sm"></div>
                )}
                <item.icon className={`h-5 w-5 relative transition-colors duration-200 ${
                  isActive ? 'text-[#FFD700]' : 'text-[#A0A0A0]'
                }`} />
              </div>
              <span className={`text-xs font-medium transition-all duration-200 ${
                isActive ? 'text-[#FFD700]' : 'text-[#A0A0A0]'
              }`}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#FFD700] rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
