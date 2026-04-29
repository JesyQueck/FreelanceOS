import { useState, useEffect } from "react";
import { UserCircle, Mail, Briefcase, Edit, Camera, CheckCircle2, X, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile, createOrUpdateUserProfile } from "../../utils/supabase";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const profileData = await getUserProfile(user.id);
          setProfile(profileData);
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleEditProfile = () => {
    navigate('/dashboard/profile/edit');
  };

  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setEditingValue(value);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const saveField = async () => {
    if (!user || !editingField) return;
    
    setIsSaving(true);
    try {
      let updateData: any = {
        display_name: profile?.display_name || ''
      };
      
      if (editingField === 'name') {
        updateData.name = editingValue;
      } else if (editingField === 'professional-name') {
        updateData.name = editingValue;
      } else if (editingField === 'bio') {
        updateData.bio = editingValue;
      } else if (editingField === 'skills') {
        const skillsArray = editingValue
          .split(',')
          .map((skill: string) => skill.trim())
          .filter((skill: string) => skill.length > 0);
        updateData.skills = skillsArray;
      }
      
      const result = await createOrUpdateUserProfile(
        user.id,
        user.email || '',
        updateData.display_name,
        updateData.name,
        updateData.bio,
        updateData.skills
      );
      
      if (result.error) {
        console.error('Error updating profile:', result.error);
      } else {
        setProfile(result.data);
        cancelEditing();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <button 
          onClick={handleEditProfile}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white transition-all bg-indigo-600 rounded-lg hover:bg-indigo-500 gap-2"
        >
          <Edit className="h-4 w-4" /> Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-[#151B2B] rounded-2xl p-8 border border-slate-800/60 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              {profile?.profile_image ? (
                <img 
                  src={profile.profile_image} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                  {profile?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <button className="absolute bottom-2 right-2 p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                <Camera className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2">
                {editingField === 'name' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="bg-[#0B0F19] border border-slate-800 rounded-lg px-3 py-1 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter your professional name"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={cancelEditing}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                      >
                        <X className="h-3 w-3 text-slate-400" />
                      </button>
                      <button
                        onClick={saveField}
                        disabled={isSaving}
                        className="p-1 hover:bg-indigo-600 rounded transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="h-3 w-3 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-white">
                      {profile?.name || profile?.display_name || 'User'}
                    </h2>
                    <button
                      onClick={() => startEditing('name', profile?.name || '')}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                      title="Edit name"
                    >
                      <Edit className="h-4 w-4 text-slate-400" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-slate-400">
                {profile?.bio || 'Freelancer'}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500">Verified</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">About</h3>
                <button
                  onClick={() => startEditing('bio', profile?.bio || '')}
                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                  title="Edit bio"
                >
                  <Edit className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              {editingField === 'bio' ? (
                <div className="space-y-3">
                  <textarea
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32 resize-none"
                    placeholder="Tell us about yourself and your work"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveField}
                      disabled={isSaving}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm disabled:opacity-50 flex items-center gap-1"
                    >
                      {isSaving ? (
                        <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-300 leading-relaxed">
                  {profile?.bio || 'No bio added yet. Click the edit icon to add your professional bio.'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm text-white">{user?.email || 'No email'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <UserCircle className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Display Name</p>
                  <p className="text-sm text-white">{profile?.display_name || 'Not set'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-slate-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">Professional Name</p>
                  {editingField === 'professional-name' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="bg-[#0B0F19] border border-slate-800 rounded px-2 py-1 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Enter your professional name"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={cancelEditing}
                          className="p-1 hover:bg-slate-700 rounded transition-colors"
                        >
                          <X className="h-3 w-3 text-slate-400" />
                        </button>
                        <button
                          onClick={saveField}
                          disabled={isSaving}
                          className="p-1 hover:bg-indigo-600 rounded transition-colors disabled:opacity-50"
                        >
                          {isSaving ? (
                            <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Save className="h-3 w-3 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white">{profile?.name || 'Not set'}</p>
                      <button
                        onClick={() => startEditing('professional-name', profile?.name || '')}
                        className="p-1 hover:bg-slate-700 rounded transition-colors"
                        title="Edit professional name"
                      >
                        <Edit className="h-3 w-3 text-slate-400" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <UserCircle className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Member Since</p>
                  <p className="text-sm text-white">
                    {profile?.created_at ? (
                      <span>
                        Started {new Date(profile.created_at).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    ) : (
                      <span className="text-slate-400">Recently joined</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-[#151B2B] rounded-2xl p-6 border border-slate-800/60 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Skills</h3>
          <button
            onClick={() => startEditing('skills', profile?.skills ? profile.skills.join(', ') : '')}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title="Edit skills"
          >
            <Edit className="h-4 w-4 text-slate-400" />
          </button>
        </div>
        {editingField === 'skills' ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. UI Design, React, TypeScript"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={cancelEditing}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveField}
                disabled={isSaving}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm disabled:opacity-50 flex items-center gap-1"
              >
                {isSaving ? (
                  <div className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0 ? (
              profile.skills.map((skill: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-sm">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-slate-400">No skills added yet. Click the edit icon to add your professional skills.</p>
            )}
          </div>
        )}
      </div>

      {/* Portfolio Preview */}
      <div className="bg-[#151B2B] rounded-2xl p-6 border border-slate-800/60 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Portfolio Items</h3>
          <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition-colors">
            <div className="h-32 bg-slate-700 rounded-lg mb-3 flex items-center justify-center">
              <span className="text-slate-400">No portfolio items yet</span>
            </div>
            <h4 className="text-sm font-medium text-white">Add your first project</h4>
            <p className="text-xs text-slate-400 mt-1">Click Edit Profile to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
}
