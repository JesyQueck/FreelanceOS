import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  UserCircle, 
  Mail, 
  Briefcase, 
  Phone, 
  Building, 
  Edit, 
  Camera, 
  CheckCircle2, 
  X, 
  Save, 
  LogOut, 
  Bell, 
  ChevronRight,
  MessageSquare,
  Search
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../utils/supabase";
import NotificationDropdown from "../../components/NotificationDropdown";

interface ClientProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  bio?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export default function ClientProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [initial, setInitial] = useState('');

  // Fetch user data for navbar
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('users')
          .select('display_name, email')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
          setDisplayName(user.email?.split('@')[0] || 'User');
          setUserEmail(user.email || '');
          setInitial(user.email?.charAt(0).toUpperCase() || 'U');
        } else {
          setDisplayName(data.display_name || user.email?.split('@')[0] || 'User');
          setUserEmail(data.email || user.email || '');
          setInitial((data.display_name || user.email || 'U').charAt(0).toUpperCase());
        }
      } catch (error) {
        console.error('Unexpected error fetching user data:', error);
        setDisplayName(user.email?.split('@')[0] || 'User');
        setUserEmail(user.email || '');
        setInitial(user.email?.charAt(0).toUpperCase() || 'U');
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchClientProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching client profile:', error);
          // Create a new client profile if it doesn't exist
          const { data: newClient, error: createError } = await supabase
            .from('clients')
            .insert({
              user_id: user.id,
              full_name: user.email?.split('@')[0] || 'Client',
              email: user.email || '',
            })
            .select('*')
            .single();

          if (createError) {
            console.error('Error creating client profile:', createError);
          } else {
            setProfile(newClient);
          }
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Unexpected error fetching client profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, [user]);

  const handleEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditingValue(currentValue);
  };

  const handleSave = async (field: string) => {
    if (!profile) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({ [field]: editingValue })
        .eq('id', profile.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating profile:', error);
      } else {
        setProfile(data);
        setEditingField(null);
        setEditingValue('');
      }
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        navigate('/client-login');
      }
    } catch (error) {
      console.error('Unexpected error during logout:', error);
    }
  };

  // Client navigation items
  const clientNavigation = [
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Discover Freelancers', href: '/discover', icon: Search },
    { name: 'Profile', href: '/client-profile', icon: UserCircle },
  ];

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInDays < 30) {
      return 'Recently joined';
    } else if (diffInMonths === 1) {
      return '1 month ago';
    } else if (diffInMonths <= 11) {
      return `${diffInMonths} months ago`;
    } else if (diffInYears === 1) {
      return '1 year ago';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-black text-white items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      
      {/* MOBILE OVERLAY */}
      <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30" />

      {/* DESKTOP SIDEBAR - Always Visible */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-[#1A1A1A] lg:bg-[#0A0A0A]/50 lg:backdrop-blur-xl lg:flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-transparent">
          <div className="flex items-center gap-2.5 group">
            <div className="bg-[#FFD700] p-1.5 rounded-lg shadow-sm shadow-[#FFD700]/20 group-hover:shadow-[#FFD700]/40 transition-shadow">
              <Briefcase className="h-5 w-5 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tight">FreelanceOS</span>
          </div>
        </div>
        
        <div className="px-4 py-4">
          <p className="px-3 text-xs font-semibold text-[#A0A0A0] uppercase tracking-wider mb-2">
            Client Portal
          </p>
          <nav className="space-y-1">
            {clientNavigation.map((item) => (
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
              {userLoading ? (
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
                {userLoading ? 'Loading...' : displayName}
              </p>
              <p className="text-xs text-[#A0A0A0] truncate">
                {userLoading ? 'Loading...' : userEmail}
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
          <div className="flex items-center gap-2.5 group">
            <div className="bg-[#FFD700] p-1.5 rounded-lg shadow-sm shadow-[#FFD700]/20 group-hover:shadow-[#FFD700]/40 transition-shadow">
              <Briefcase className="h-4 w-5 text-black" />
            </div>
            <span className="font-bold text-sm tracking-tight">FreelanceOS</span>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-red-500/50 hover:bg-red-500/70 transition-colors"
            >
              <LogOut className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col lg:ml-0 pt-16 lg:pt-0 min-h-screen lg:min-h-0">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Client Profile</h1>
              <p className="text-[#A0A0A0]">Manage your personal information and preferences</p>
            </div>

            {/* Profile Card */}
            <div className="bg-[#0A0A0A] rounded-2xl border border-[#1A1A1A] p-8 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                {/* Profile Image */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-[#FFD700] flex items-center justify-center text-black text-2xl font-bold">
                    {profile?.profile_image ? (
                      <img 
                        src={profile.profile_image} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      profile?.full_name?.charAt(0).toUpperCase() || 'C'
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-[#1A1A1A] rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-4 w-4 text-white" />
                  </button>
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">{profile?.full_name || 'Client'}</h2>
                  <p className="text-[#A0A0A0] mb-2">Client since {profile?.created_at ? getRelativeTime(profile.created_at) : 'Recently'}</p>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-[#FFD700]/20 text-[#FFD700] rounded-full text-sm font-medium">
                      Active Client
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="space-y-6">
                {/* Full Name */}
                <div className="flex items-center justify-between p-4 bg-[#1A1A1A]/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <UserCircle className="h-5 w-5 text-[#FFD700]" />
                    <div>
                      <p className="text-sm font-medium text-white">Full Name</p>
                      {editingField === 'full_name' ? (
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="mt-1 w-full px-3 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50"
                          autoFocus
                        />
                      ) : (
                        <p className="text-[#A0A0A0]">{profile?.full_name || 'Not set'}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingField === 'full_name' ? (
                      <>
                        <button
                          onClick={() => handleSave('full_name')}
                          disabled={isSaving}
                          className="p-2 bg-[#FFD700] hover:bg-[#FFC700] rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isSaving ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save className="h-4 w-4 text-black" />
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit('full_name', profile?.full_name || '')}
                        className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4 text-[#A0A0A0]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between p-4 bg-[#1A1A1A]/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-[#FFD700]" />
                    <div>
                      <p className="text-sm font-medium text-white">Email</p>
                      <p className="text-[#A0A0A0]">{profile?.email || user?.email}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-[#1A1A1A] rounded-lg">
                    <p className="text-xs text-[#A0A0A0]">Read-only</p>
                  </div>
                </div>

                {/* Company */}
                <div className="flex items-center justify-between p-4 bg-[#1A1A1A]/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-[#FFD700]" />
                    <div>
                      <p className="text-sm font-medium text-white">Company</p>
                      {editingField === 'company' ? (
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="mt-1 w-full px-3 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50"
                          placeholder="Enter your company name"
                          autoFocus
                        />
                      ) : (
                        <p className="text-[#A0A0A0]">{profile?.company || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingField === 'company' ? (
                      <>
                        <button
                          onClick={() => handleSave('company')}
                          disabled={isSaving}
                          className="p-2 bg-[#FFD700] hover:bg-[#FFC700] rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isSaving ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save className="h-4 w-4 text-black" />
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit('company', profile?.company || '')}
                        className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4 text-[#A0A0A0]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between p-4 bg-[#1A1A1A]/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-[#FFD700]" />
                    <div>
                      <p className="text-sm font-medium text-white">Phone</p>
                      {editingField === 'phone' ? (
                        <input
                          type="tel"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="mt-1 w-full px-3 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50"
                          placeholder="Enter your phone number"
                          autoFocus
                        />
                      ) : (
                        <p className="text-[#A0A0A0]">{profile?.phone || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingField === 'phone' ? (
                      <>
                        <button
                          onClick={() => handleSave('phone')}
                          disabled={isSaving}
                          className="p-2 bg-[#FFD700] hover:bg-[#FFC700] rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isSaving ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save className="h-4 w-4 text-black" />
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit('phone', profile?.phone || '')}
                        className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4 text-[#A0A0A0]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="p-4 bg-[#1A1A1A]/30 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <UserCircle className="h-5 w-5 text-[#FFD700]" />
                      <p className="text-sm font-medium text-white">Bio</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingField === 'bio' ? (
                        <>
                          <button
                            onClick={() => handleSave('bio')}
                            disabled={isSaving}
                            className="p-2 bg-[#FFD700] hover:bg-[#FFC700] rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isSaving ? (
                              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Save className="h-4 w-4 text-black" />
                            )}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4 text-white" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit('bio', profile?.bio || '')}
                          className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4 text-[#A0A0A0]" />
                        </button>
                      )}
                    </div>
                  </div>
                  {editingField === 'bio' ? (
                    <textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50 resize-none"
                      rows={4}
                      placeholder="Tell us about yourself and what you're looking for..."
                      autoFocus
                    />
                  ) : (
                    <p className="text-[#A0A0A0] whitespace-pre-wrap">
                      {profile?.bio || 'No bio added yet. Tell freelancers about yourself and what you\'re looking for.'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-[#0A0A0A] rounded-2xl border border-[#1A1A1A] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Account Type</span>
                  <span className="text-[#FFD700] font-medium">Client</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Member Since</span>
                  <span className="text-white">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#A0A0A0]">Last Updated</span>
                  <span className="text-white">{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
