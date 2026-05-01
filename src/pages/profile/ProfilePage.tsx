import { useState, useEffect } from "react";
import { UserCircle, Mail, Briefcase, Edit, Camera, CheckCircle2, X, Save, Plus, ExternalLink, Trash2, Share2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile, createOrUpdateUserProfile, UserProfile, PortfolioItem, getPortfolioItems, createPortfolioItem, deletePortfolioItem, generateShareLink, ensureUserHasSlug } from "../../utils/supabase";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Portfolio state
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState<Partial<PortfolioItem>>({
    title: '',
    description: '',
    image_url: '',
    external_link: ''
  });

  // Helper function to get relative time
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

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        try {
          // First ensure user has username and slug
          const slugResult = await ensureUserHasSlug(user.id, profile?.display_name, user.email || '');
          
          if (slugResult.error) {
            console.error('Error ensuring user has slug:', slugResult.error);
          }
          
          // Then fetch profile data
          const [profileData, portfolioData] = await Promise.all([
            getUserProfile(user.id),
            getPortfolioItems(user.id)
          ]);
          setProfile(profileData);
          setPortfolioItems(portfolioData);
        } catch (error) {
          console.error('Error fetching profile data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [user]);

  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setEditingValue(value);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const removeSkill = async (skillToRemove: string) => {
    if (!user || !profile?.skills) return;
    
    setIsSaving(true);
    try {
      const updatedSkills = profile.skills.filter((skill: string) => skill !== skillToRemove);
      
      const result = await createOrUpdateUserProfile(
        user.id,
        user.email || '',
        profile?.display_name || '',
        profile?.name,
        profile?.bio,
        updatedSkills
      );
      
      if (result.error) {
        console.error('Error removing skill:', result.error);
      } else {
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Error removing skill:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Portfolio functions
  const handleAddPortfolio = async () => {
    if (!user || !newPortfolio.title?.trim()) return;
    
    setIsSaving(true);
    try {
      const result = await createPortfolioItem(newPortfolio as Omit<PortfolioItem, 'id' | 'user_id' | 'created_at'>, user.id);
      
      if (result.error) {
        console.error('Error creating portfolio item:', result.error);
      } else if (result.data) {
        setPortfolioItems(prev => [result.data!, ...prev]);
        setNewPortfolio({
          title: '',
          description: '',
          image_url: '',
          external_link: ''
        });
        setShowAddPortfolio(false);
      }
    } catch (error) {
      console.error('Error creating portfolio item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const result = await deletePortfolioItem(id);
      
      if (result.error) {
        console.error('Error deleting portfolio item:', result.error);
      } else {
        setPortfolioItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareProfile = async () => {
    if (!user) return;
    
    try {
      // First ensure user has username and slug
      const slugResult = await ensureUserHasSlug(user.id, profile?.display_name, user.email || '');
      
      if (slugResult.error) {
        // Show error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm';
        errorDiv.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Error generating portfolio link. Please try again.</span>
          </div>
        `;
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
        return;
      }
      
      // Refresh profile data to get the new username/slug
      const updatedProfile = await getUserProfile(user.id);
      setProfile(updatedProfile);
      
      const shareLink = generateShareLink(updatedProfile?.username);
      console.log('Generated share link:', shareLink); // Debug log
      console.log('User profile:', updatedProfile); // Debug log
      if (shareLink) {
        // Copy to clipboard and show success notification
        navigator.clipboard.writeText(shareLink).then(() => {
          // Show success notification
          const successDiv = document.createElement('div');
          successDiv.className = 'fixed top-4 right-4 z-50 bg-[#FFD700] text-black px-4 py-3 rounded-lg shadow-lg max-w-sm';
          successDiv.innerHTML = `
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-semibold">Portfolio link copied!</span>
              </div>
              <div class="text-xs opacity-80 break-all">${shareLink}</div>
            </div>
          `;
          document.body.appendChild(successDiv);
          setTimeout(() => successDiv.remove(), 1000);
        }).catch(() => {
          // Fallback if clipboard API fails
          const fallbackDiv = document.createElement('div');
          fallbackDiv.className = 'fixed top-4 right-4 z-50 bg-[#FFD700] text-black px-4 py-3 rounded-lg shadow-lg max-w-sm';
          fallbackDiv.innerHTML = `
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
                <span class="font-semibold">Copy this link:</span>
              </div>
              <div class="text-xs bg-black/10 px-2 py-1 rounded break-all">${shareLink}</div>
            </div>
          `;
          document.body.appendChild(fallbackDiv);
          setTimeout(() => fallbackDiv.remove(), 1000);
        });
      } else {
        // Show no link available notification
        const noLinkDiv = document.createElement('div');
        noLinkDiv.className = 'fixed top-4 right-4 z-50 bg-[#1A1A1A] text-white px-4 py-3 rounded-lg shadow-lg max-w-sm';
        noLinkDiv.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>No portfolio link available. Please complete your profile first.</span>
          </div>
        `;
        document.body.appendChild(noLinkDiv);
        setTimeout(() => noLinkDiv.remove(), 1000);
      }
    } catch (error) {
      console.error('Share profile error:', error);
      // Show generic error notification
      const errorDiv = document.createElement('div');
      errorDiv.className = 'fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm';
      errorDiv.innerHTML = `
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Something went wrong. Please try again.</span>
        </div>
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 1000);
    }
  };

  const saveField = async () => {
    if (!user || !editingField) return;
    
    setIsSaving(true);
    try {
      // Get current profile to preserve existing data
      const currentProfile = await getUserProfile(user.id);
      
      // Create update data with all existing fields
      const updateData: UserProfile = {
        display_name: currentProfile?.display_name || profile?.display_name || '',
        name: currentProfile?.name || profile?.name,
        bio: currentProfile?.bio || profile?.bio,
        skills: currentProfile?.skills || profile?.skills,
        profile_image: currentProfile?.profile_image || profile?.profile_image,
        created_at: currentProfile?.created_at || profile?.created_at,
        email: currentProfile?.email || profile?.email,
        id: currentProfile?.id || profile?.id,
        updated_at: new Date().toISOString()
      };
      
      // Only update the field being edited
      if (editingField === 'name') {
        updateData.name = editingValue;
      } else if (editingField === 'professional-name') {
        updateData.name = editingValue;
      } else if (editingField === 'bio') {
        updateData.bio = editingValue;
      } else if (editingField === 'skills') {
        // Handle individual skill addition
        const newSkill = editingValue.trim();
        if (newSkill && !updateData.skills?.includes(newSkill)) {
          updateData.skills = [...(updateData.skills || []), newSkill];
        }
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
      <div className="flex flex-col items-center justify-center h-64">
        <div className="flex gap-1 mb-4">
          <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-[#FFD700] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <div className="text-[#A0A0A0]">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <button 
          onClick={handleShareProfile}
          className="flex items-center gap-2 px-4 py-2 bg-[#FFD700] hover:bg-[#FFC700] text-black rounded-lg text-sm transition-colors shadow-sm"
        >
          <Share2 className="h-4 w-4" />
          Share Portfolio
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#1A1A1A] shadow-sm">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              {profile?.profile_image ? (
                <img 
                  src={profile?.profile_image} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-[#FFD700] flex items-center justify-center text-black text-3xl font-bold">
                  {profile?.name?.charAt(0).toUpperCase() || profile?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <button className="absolute bottom-2 right-2 p-2 bg-[#1A1A1A] rounded-lg hover:bg-[#2A2A2A] transition-colors z-10">
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
                      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-1 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                      placeholder="Enter your professional name"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={cancelEditing}
                        className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                      >
                        <X className="h-3 w-3 text-[#A0A0A0]" />
                      </button>
                      <button
                        onClick={saveField}
                        disabled={isSaving}
                        className="p-1 hover:bg-[#FFD700] rounded transition-colors disabled:opacity-50"
                      >
                        {isSaving ? (
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        ) : (
                          <Save className="h-3 w-3 text-black" />
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
                      className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                      title="Edit name"
                    >
                      <Edit className="h-4 w-4 text-[#A0A0A0]" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-[#A0A0A0]">
                Freelancer
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
                  className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                  title="Edit bio"
                >
                  <Edit className="h-4 w-4 text-[#A0A0A0]" />
                </button>
              </div>
              {editingField === 'bio' ? (
                <div className="space-y-3">
                  <textarea
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent h-32 resize-none"
                    placeholder="Tell us about yourself and your work"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveField}
                      disabled={isSaving}
                      className="px-3 py-1 bg-[#FFD700] hover:bg-[#FFC700] text-black rounded text-sm disabled:opacity-50 flex items-center gap-1"
                    >
                      {isSaving ? (
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      ) : (
                        <Save className="h-3 w-3" />
                      )}
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[#A0A0A0] leading-relaxed">
                  {profile?.bio || 'No bio added yet. Click the edit icon to add your professional bio.'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#FFD700]" />
                <div>
                  <p className="text-xs text-[#A0A0A0]">Email</p>
                  <p className="text-sm text-white">{user?.email || 'No email'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <UserCircle className="h-5 w-5 text-[#FFD700]" />
                <div>
                  <p className="text-xs text-[#A0A0A0]">Display Name</p>
                  <p className="text-sm text-white">{profile?.display_name || 'Not set'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-[#FFD700]" />
                <div className="flex-1">
<<<<<<< HEAD
                  <p className="text-xs text-[#A0A0A0]">Professional Name</p>
=======
                  <p className="text-xs text-slate-500">Professional Name</p>
>>>>>>> origin/main
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
                            <div className="flex gap-1">
                              <div className="w-1 h-1 bg-white animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-1 h-1 bg-white animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-1 h-1 bg-white animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
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
                <UserCircle className="h-5 w-5 text-[#FFD700]" />
                <div>
                  <p className="text-xs text-[#A0A0A0]">Member Since</p>
                  <p className="text-sm text-white">
                    {profile?.created_at ? (
                      <span>{getRelativeTime(profile?.created_at)}</span>
                    ) : (
                      <span className="text-[#A0A0A0]">Recently joined</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-[#1A1A1A] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Skills</h3>
          <button
            onClick={() => startEditing('skills', '')}
            className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
            title="Edit skills"
          >
            <Edit className="h-4 w-4 text-[#A0A0A0]" />
          </button>
        </div>
        {editingField === 'skills' ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                placeholder="Enter a skill"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    saveField();
                  }
                }}
              />
              <button
                onClick={saveField}
                disabled={isSaving || !editingValue.trim()}
                className="px-4 py-3 bg-[#FFD700] hover:bg-[#FFC700] text-black rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                ) : (
                  <span>Add</span>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.map((skill: string, index: number) => (
                <div key={index} className="flex items-center gap-1 px-3 py-1 bg-[#1A1A1A] text-white rounded-lg text-sm group">
                  <span>{skill}</span>
                  <button
                    onClick={() => removeSkill(skill)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#A0A0A0] hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={cancelEditing}
              className="px-3 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0 ? (
              profile.skills.map((skill: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-[#1A1A1A] text-white rounded-lg text-sm">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-[#A0A0A0]">No skills added yet. Click the edit icon to add your professional skills.</p>
            )}
          </div>
        )}
      </div>

      {/* Portfolio Section */}
      <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-[#1A1A1A] shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Portfolio</h3>
          <button 
            onClick={() => setShowAddPortfolio(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFD700] hover:bg-[#FFC700] text-black rounded-lg text-sm transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        </div>
        
        {/* Modal Overlay */}
        {showAddPortfolio && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-[#1A1A1A] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FFD700]/20 rounded-lg flex items-center justify-center">
                    <Plus className="h-5 w-5 text-[#FFD700]" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Add New Project</h4>
                    <p className="text-[#A0A0A0] text-sm">Showcase your best work</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAddPortfolio(false);
                    setNewPortfolio({
                      title: '',
                      description: '',
                      image_url: '',
                      external_link: ''
                    });
                  }}
                  className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-[#A0A0A0]" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">Project Title *</label>
                  <input
                    type="text"
                    value={newPortfolio.title}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all"
                    placeholder="Enter project title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">Description</label>
                  <textarea
                    value={newPortfolio.description}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent h-32 resize-none transition-all"
                    placeholder="Describe your project, what you built, and your role"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Project Image URL</label>
                  <input
                    type="url"
                    value={newPortfolio.image_url}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, image_url: e.target.value }))}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">External Link</label>
                  <input
                    type="url"
                    value={newPortfolio.external_link}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, external_link: e.target.value }))}
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent transition-all"
                    placeholder="https://www.project.com"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddPortfolio(false);
                    setNewPortfolio({
                      title: '',
                      description: '',
                      image_url: '',
                      external_link: ''
                    });
                  }}
                  className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPortfolio}
                  disabled={isSaving || !newPortfolio.title?.trim()}
                  className="px-6 py-3 bg-[#FFD700] hover:bg-[#FFC700] text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  {isSaving ? (
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-4 h-4 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-4 h-4 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.length > 0 ? (
            portfolioItems.map((item) => (
              <div key={item.id} className="group relative bg-[#1A1A1A]/50 rounded-xl overflow-hidden border border-[#2A2A2A]/50 hover:border-[#FFD700]/50 transition-all duration-300">
                <div className="aspect-video bg-[#2A2A2A]/50 relative overflow-hidden">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A]">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-[#FFD700]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Briefcase className="h-8 w-8 text-[#FFD700]" />
                        </div>
                        <span className="text-[#A0A0A0] text-sm">No Image</span>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => handleDeletePortfolio(item.id!)}
                    className="absolute top-3 right-3 p-2 bg-red-600/90 backdrop-blur-sm text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-5">
                  <h4 className="text-white font-semibold mb-2 line-clamp-1">{item.title}</h4>
                  <p className="text-[#A0A0A0] text-sm mb-4 line-clamp-2">{item.description || 'No description provided'}</p>
                  {item.external_link && (
                    <a
                      href={item.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#FFD700] hover:text-[#FFC700] text-sm transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Project
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-12 px-6">
                <div className="w-24 h-24 bg-[#1A1A1A]/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#2A2A2A]/50">
                  <Briefcase className="h-12 w-12 text-[#FFD700]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">No Projects Yet</h3>
                <p className="text-[#A0A0A0] mb-6 max-w-md mx-auto">
                  Start building your portfolio by adding your first project. Showcase your best work and impress potential clients.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
