import { useState, useEffect } from "react";
import { Bell, Sun, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile, supabase } from "../../utils/supabase";

interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
    desktop: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'clients';
    showOnlineStatus: boolean;
    showLastSeen: boolean;
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      email: true,
      push: true,
      sound: true,
      desktop: true,
    },
    appearance: {
      theme: 'dark',
      language: 'en',
    },
    privacy: {
      profileVisibility: 'public',
      showOnlineStatus: true,
      showLastSeen: true,
    },
  });

  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        try {
          const profile = await getUserProfile(user.id);
          if (profile?.preferences) {
            setPreferences(profile.preferences);
          }
        } catch (error) {
          console.error('Error loading preferences:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPreferences();
  }, [user]);

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setSaving(true);
    setFeedback(null);
    
    try {
      // Update preferences using the correct table name and including all required fields
      const { error } = await supabase
        .from('users')
        .update({ 
          preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setFeedback({
        type: 'success',
        message: 'Preferences saved successfully!'
      });
      
      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback(null), 3000);
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      setFeedback({
        type: 'error',
        message: 'Failed to save preferences. Please try again.'
      });
      
      // Clear feedback after 5 seconds
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (category: keyof UserPreferences, key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFC700] rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-[#A0A0A0]">Manage your account preferences and notification settings</p>
          </div>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm border transition-all duration-300 ${
          feedback.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Notifications */}
      <div className="bg-[#0A0A0A]/50 backdrop-blur-sm rounded-xl border border-[#1A1A1A]/50 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FFD700] to-[#FFC700] rounded-lg flex items-center justify-center">
            <Bell className="h-4 w-4 text-black" />
          </div>
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]/30">
            <div>
              <h3 className="text-sm font-medium text-white">Email Notifications</h3>
              <p className="text-xs text-[#A0A0A0]">Receive email updates about new messages</p>
            </div>
            <button
              onClick={() => updatePreference('notifications', 'email', !preferences.notifications.email)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                preferences.notifications.email ? 'bg-gradient-to-r from-[#FFD700] to-[#FFC700]' : 'bg-[#1A1A1A]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
                  preferences.notifications.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]/30">
            <div>
              <h3 className="text-sm font-medium text-white">Push Notifications</h3>
              <p className="text-xs text-[#A0A0A0]">Receive browser push notifications</p>
            </div>
            <button
              onClick={() => updatePreference('notifications', 'push', !preferences.notifications.push)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                preferences.notifications.push ? 'bg-gradient-to-r from-[#FFD700] to-[#FFC700]' : 'bg-[#1A1A1A]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
                  preferences.notifications.push ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]/30">
            <div>
              <h3 className="text-sm font-medium text-white">Sound Effects</h3>
              <p className="text-xs text-[#A0A0A0]">Play sound for new messages</p>
            </div>
            <button
              onClick={() => updatePreference('notifications', 'sound', !preferences.notifications.sound)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                preferences.notifications.sound ? 'bg-gradient-to-r from-[#FFD700] to-[#FFC700]' : 'bg-[#1A1A1A]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
                  preferences.notifications.sound ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="text-sm font-medium text-white">Desktop Notifications</h3>
              <p className="text-xs text-[#A0A0A0]">Show desktop notifications</p>
            </div>
            <button
              onClick={() => updatePreference('notifications', 'desktop', !preferences.notifications.desktop)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                preferences.notifications.desktop ? 'bg-gradient-to-r from-[#FFD700] to-[#FFC700]' : 'bg-[#1A1A1A]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
                  preferences.notifications.desktop ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-[#0A0A0A]/50 backdrop-blur-sm rounded-xl border border-[#1A1A1A]/50 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FFD700] to-[#FFC700] rounded-lg flex items-center justify-center">
            <Sun className="h-4 w-4 text-black" />
          </div>
          <h2 className="text-xl font-semibold text-white">Appearance</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]/30">
            <div>
              <h3 className="text-sm font-medium text-white">Theme</h3>
              <p className="text-xs text-[#A0A0A0]">Choose your preferred theme</p>
            </div>
            <select
              value={preferences.appearance.theme}
              onChange={(e) => updatePreference('appearance', 'theme', e.target.value)}
              className="bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#2A2A2A]/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-200"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="text-sm font-medium text-white">Language</h3>
              <p className="text-xs text-[#A0A0A0]">Select your preferred language</p>
            </div>
            <select
              value={preferences.appearance.language}
              onChange={(e) => updatePreference('appearance', 'language', e.target.value)}
              className="bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#2A2A2A]/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-200"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy */}
      <div className="bg-[#0A0A0A]/50 backdrop-blur-sm rounded-xl border border-[#1A1A1A]/50 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-[#FFD700] to-[#FFC700] rounded-lg flex items-center justify-center">
            <Shield className="h-4 w-4 text-black" />
          </div>
          <h2 className="text-xl font-semibold text-white">Privacy</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]/30">
            <div>
              <h3 className="text-sm font-medium text-white">Profile Visibility</h3>
              <p className="text-xs text-[#A0A0A0]">Control who can see your profile</p>
            </div>
            <select
              value={preferences.privacy.profileVisibility}
              onChange={(e) => updatePreference('privacy', 'profileVisibility', e.target.value)}
              className="bg-[#1A1A1A]/50 backdrop-blur-sm border border-[#2A2A2A]/50 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-200"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="clients">Clients Only</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]/30">
            <div>
              <h3 className="text-sm font-medium text-white">Online Status</h3>
              <p className="text-xs text-[#A0A0A0]">Show when you're online</p>
            </div>
            <button
              onClick={() => updatePreference('privacy', 'showOnlineStatus', !preferences.privacy.showOnlineStatus)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                preferences.privacy.showOnlineStatus ? 'bg-gradient-to-r from-[#FFD700] to-[#FFC700]' : 'bg-[#1A1A1A]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
                  preferences.privacy.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="text-sm font-medium text-white">Last Seen</h3>
              <p className="text-xs text-[#A0A0A0]">Show last seen timestamp</p>
            </div>
            <button
              onClick={() => updatePreference('privacy', 'showLastSeen', !preferences.privacy.showLastSeen)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                preferences.privacy.showLastSeen ? 'bg-gradient-to-r from-[#FFD700] to-[#FFC700]' : 'bg-[#1A1A1A]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-300 ${
                  preferences.privacy.showLastSeen ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSavePreferences}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-br from-[#FFD700] to-[#FFC700] hover:from-[#FFC700] hover:to-[#FFD700] disabled:from-[#FFD700]/50 disabled:to-[#FFC700]/50 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 disabled:hover:scale-100"
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span>Saving...</span>
            </div>
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </div>
  );
}
