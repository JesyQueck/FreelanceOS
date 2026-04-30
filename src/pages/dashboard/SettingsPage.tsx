import { useState, useEffect } from "react";
import { Bell, Sun, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile, createOrUpdateUserProfile, supabase } from "../../utils/supabase";

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
    try {
      // Get current profile first
      const profile = await getUserProfile(user.id);
      await createOrUpdateUserProfile(user.id, user.email || '', profile?.display_name, profile?.name, profile?.bio, profile?.skills);
      
      // Update preferences separately using supabase directly
      await supabase
        .from('user_profiles')
        .update({ preferences })
        .eq('user_id', user.id);
      
      // Show success message
    } catch (error) {
      console.error('Error saving preferences:', error);
      // Show error message
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account preferences and notification settings</p>
      </div>

      {/* Notifications */}
      <div className="bg-[#151B2B] rounded-xl border border-slate-800/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-800/30">
            <div>
              <h3 className="text-sm font-medium text-white">Email Notifications</h3>
              <p className="text-xs text-slate-400">Receive email updates about new messages</p>
            </div>
            <button
              onClick={() => updatePreference('notifications', 'email', !preferences.notifications.email)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.notifications.email ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  preferences.notifications.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-800/30">
            <div>
              <h3 className="text-sm font-medium text-white">Push Notifications</h3>
              <p className="text-xs text-slate-400">Receive browser push notifications</p>
            </div>
            <button
              onClick={() => updatePreference('notifications', 'push', !preferences.notifications.push)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.notifications.push ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  preferences.notifications.push ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-800/30">
            <div>
              <h3 className="text-sm font-medium text-white">Sound Effects</h3>
              <p className="text-xs text-slate-400">Play sound for new messages</p>
            </div>
            <button
              onClick={() => updatePreference('notifications', 'sound', !preferences.notifications.sound)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.notifications.sound ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  preferences.notifications.sound ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="text-sm font-medium text-white">Desktop Notifications</h3>
              <p className="text-xs text-slate-400">Show desktop notifications</p>
            </div>
            <button
              onClick={() => updatePreference('notifications', 'desktop', !preferences.notifications.desktop)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.notifications.desktop ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  preferences.notifications.desktop ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-[#151B2B] rounded-xl border border-slate-800/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Sun className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Appearance</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-800/30">
            <div>
              <h3 className="text-sm font-medium text-white">Theme</h3>
              <p className="text-xs text-slate-400">Choose your preferred theme</p>
            </div>
            <select
              value={preferences.appearance.theme}
              onChange={(e) => updatePreference('appearance', 'theme', e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="text-sm font-medium text-white">Language</h3>
              <p className="text-xs text-slate-400">Select your preferred language</p>
            </div>
            <select
              value={preferences.appearance.language}
              onChange={(e) => updatePreference('appearance', 'language', e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
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
      <div className="bg-[#151B2B] rounded-xl border border-slate-800/60 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-white">Privacy</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-slate-800/30">
            <div>
              <h3 className="text-sm font-medium text-white">Profile Visibility</h3>
              <p className="text-xs text-slate-400">Control who can see your profile</p>
            </div>
            <select
              value={preferences.privacy.profileVisibility}
              onChange={(e) => updatePreference('privacy', 'profileVisibility', e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="clients">Clients Only</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-slate-800/30">
            <div>
              <h3 className="text-sm font-medium text-white">Online Status</h3>
              <p className="text-xs text-slate-400">Show when you're online</p>
            </div>
            <button
              onClick={() => updatePreference('privacy', 'showOnlineStatus', !preferences.privacy.showOnlineStatus)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.privacy.showOnlineStatus ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  preferences.privacy.showOnlineStatus ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="text-sm font-medium text-white">Last Seen</h3>
              <p className="text-xs text-slate-400">Show last seen timestamp</p>
            </div>
            <button
              onClick={() => updatePreference('privacy', 'showLastSeen', !preferences.privacy.showLastSeen)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.privacy.showLastSeen ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
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
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
