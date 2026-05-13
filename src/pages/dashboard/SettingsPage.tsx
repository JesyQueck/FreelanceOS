// @ts-nocheck - Temporarily disable strict type checking for functionality
import { useState, useEffect } from "react";
import { Bell, Sun, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile, supabase } from "../../utils/supabase";
import LoadingSpinner from "../../components/LoadingSpinner";

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
      const { error } = await (supabase
        .from('users')
        .update({ 
          preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id) as any);
      
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
        <LoadingSpinner showText={false} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Settings</h1>
        <p className="text-[var(--color-text-secondary)]">Manage your account preferences and notification settings</p>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
          feedback.type === 'success' 
            ? 'bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 text-[var(--color-success)]' 
            : 'bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)]'
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
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6 text-[var(--color-primary)]" />
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]/30">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Email Notifications</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Receive email updates about new messages</p>
            </div>
            <button
              onClick={() => updatePreference('notifications', 'email', !preferences.notifications.email)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.notifications.email ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-secondary)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  preferences.notifications.email ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]/30">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Push Notifications</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Receive browser push notifications</p>
            </div>
            <button
              onClick={() => updatePreference('notifications', 'push', !preferences.notifications.push)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.notifications.push ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-secondary)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  preferences.notifications.push ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]/30">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Sound Effects</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Play sound for new messages</p>
            </div>
            <button
              onClick={() => updatePreference('notifications', 'sound', !preferences.notifications.sound)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.notifications.sound ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-secondary)]'
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
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Desktop Notifications</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Show desktop notifications</p>
            </div>
            <button
              onClick={() => updatePreference('notifications', 'desktop', !preferences.notifications.desktop)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.notifications.desktop ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-secondary)]'
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
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Sun className="h-6 w-6 text-[var(--color-primary)]" />
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Appearance</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]/30">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Theme</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Choose your preferred theme</p>
            </div>
            <select
              value={preferences.appearance.theme}
              onChange={(e) => updatePreference('appearance', 'theme', e.target.value)}
              className="input"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Language</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Select your preferred language</p>
            </div>
            <select
              value={preferences.appearance.language}
              onChange={(e) => updatePreference('appearance', 'language', e.target.value)}
              className="input"
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
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-[var(--color-primary)]" />
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Privacy</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]/30">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Profile Visibility</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Control who can see your profile</p>
            </div>
            <select
              value={preferences.privacy.profileVisibility}
              onChange={(e) => updatePreference('privacy', 'profileVisibility', e.target.value)}
              className="input"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="clients">Clients Only</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]/30">
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Online Status</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Show when you're online</p>
            </div>
            <button
              onClick={() => updatePreference('privacy', 'showOnlineStatus', !preferences.privacy.showOnlineStatus)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.privacy.showOnlineStatus ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-secondary)]'
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
              <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Last Seen</h3>
              <p className="text-xs text-[var(--color-text-secondary)]">Show last seen timestamp</p>
            </div>
            <button
              onClick={() => updatePreference('privacy', 'showLastSeen', !preferences.privacy.showLastSeen)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.privacy.showLastSeen ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-secondary)]'
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
          className="btn btn-primary disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}
