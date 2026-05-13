import { useState, useEffect } from "react";
import { UserCircle, Mail, Briefcase, Edit, Camera, X, Save, Plus, ExternalLink, Trash2, Share2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createOrUpdateUserProfile, UserProfile, PortfolioItem, getPortfolioItems, createPortfolioItem, deletePortfolioItem, ensureUserHasSlug, getFreelancerProfile, calculateProfileCompletion } from "../../utils/supabase";

export default function ProfilePage() {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Freelancer-specific profile state
  const [freelancerProfile, setFreelancerProfile] = useState<any>(null);
  
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
        setLoading(true);
        try {
          // Clear any cached data to ensure fresh fetch
          const { supabase } = await import('../../utils/supabase');

          // First fetch profile data directly without cache
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('display_name, name, bio, profile_image, created_at, id, updated_at, username, slug, role')
            .eq('id', user.id)
            .single() as { data: UserProfile | null; error: any };

          if (profileError) {
            console.error('Error fetching profile data:', profileError);
            setProfile(null);
          } else if (profileData) {
            setProfile(profileData);

            // Ensure user has username and slug if missing
            if (!profileData.username || !profileData.slug) {
              const slugResult = await ensureUserHasSlug(user.id, profileData.display_name, user.email || '');

              if (slugResult.error) {
                console.error('Error ensuring user has slug:', slugResult.error);
              }
            }
          } else {
            setProfile(null);
          }

          // Fetch portfolio items
          const portfolioData = await getPortfolioItems(user.id);
          setPortfolioItems(portfolioData);

          // Fetch freelancer-specific profile if user is a freelancer
          if (role === 'freelancer') {
            const freelancerData = await getFreelancerProfile(user.id);
            setFreelancerProfile(freelancerData);
          }

        } catch (error) {
          console.error('Error fetching profile data:', error);
          setProfile(null);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, role]);

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
      let displayName = profile?.display_name || '';
      let professionalName = profile?.name || '';
      let bio = profile?.bio || '';
      
      if (editingField === 'display-name') {
        displayName = editingValue;
      } else if (editingField === 'professional-name') {
        professionalName = editingValue;
      } else if (editingField === 'bio') {
        bio = editingValue;
      }
      
      const result = await createOrUpdateUserProfile(
        user.id,
        user.email || '',
        displayName,
        professionalName,
        bio,
        profile?.skills
      );
      
      if (result.error) {
        console.error('Error updating profile:', result.error);
      } else if (result.data) {
        setProfile(result.data);
      }
      cancelEditing();
    } catch (error) {
      console.error('Error saving field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const saveFreelancerField = async () => {
    if (!user || !editingField || !freelancerProfile) return;
    
    setIsSaving(true);
    try {
      const { supabase } = await import('../../utils/supabase');
      
      let updateData: {
        hourly_rate?: number | null;
        experience_level?: string;
        availability?: string;
        skills?: string[];
      } = {};
      
      if (editingField === 'hourly-rate') {
        updateData.hourly_rate = editingValue ? parseFloat(editingValue) : null;
      } else if (editingField === 'experience-level') {
        updateData.experience_level = editingValue;
      } else if (editingField === 'availability') {
        updateData.availability = editingValue;
      } else if (editingField === 'skills') {
        // Convert comma-separated string to array
        updateData.skills = editingValue.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
      }
      
      // Build the update object dynamically to avoid TypeScript issues
      const updateQuery: any = {};
      if (updateData.hourly_rate !== undefined) updateQuery.hourly_rate = updateData.hourly_rate;
      if (updateData.experience_level) updateQuery.experience_level = updateData.experience_level;
      if (updateData.availability) updateQuery.availability = updateData.availability;
      if (updateData.skills) updateQuery.skills = updateData.skills;
      
      const { error } = await (supabase
        .from('freelancer_profiles') as any)
        .update(updateQuery)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error updating freelancer profile:', error);
      } else {
        // Refresh freelancer profile data
        const freelancerData = await getFreelancerProfile(user.id);
        setFreelancerProfile(freelancerData);
      }
    } catch (error) {
      console.error('Error saving freelancer field:', error);
    } finally {
      setIsSaving(false);
      cancelEditing();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size must be less than 5MB');
      return;
    }
    
    setIsSaving(true);
    try {
      let imageUrl: string = '';
      
      // Convert image to base64 and store directly in database
      const reader = new FileReader();
      imageUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      // Update profile with new image URL
      const result = await createOrUpdateUserProfile(
        user.id,
        user.email || '',
        profile?.display_name || '',
        profile?.name || '',
        profile?.bio || '',
        profile?.skills,
        imageUrl
      );
      
      if (result.error) {
        alert('Failed to update profile image');
      } else if (result.data) {
        setProfile(result.data);
      }
    } catch (error) {
      alert('Failed to upload image');
    } finally {
      setIsSaving(false);
    }
  };

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
      console.error('Error adding portfolio item:', error);
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

  const handleSharePortfolio = async () => {
    if (!user || !profile) return;
    
    // Calculate profile completion
    const profileCompletion = calculateProfileCompletion(profile, freelancerProfile);
    
    // Check if profile is at least 80% complete before allowing sharing
    if (profileCompletion < 80) {
      const errorMessage = document.createElement('div');
      errorMessage.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 16px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; max-width: 400px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">Profile Incomplete</div>
              <div style="font-size: 12px; opacity: 0.9;">Complete your profile to ${80}% before sharing your portfolio. Current: ${profileCompletion}%</div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(errorMessage);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (errorMessage.parentNode) {
          errorMessage.parentNode.removeChild(errorMessage);
        }
      }, 5000);
      return;
    }
    
    if (!profile.slug) {
      // Generate slug if it doesn't exist
      const result = await ensureUserHasSlug(user.id, profile.display_name, user.email);
      if (result.data) {
        setProfile(result.data);
      }
    }
    
    const slug = profile.slug || user.id;
    const portfolioUrl = `${window.location.origin}/freelancer/${slug}`;
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      // Show success message with URL
      const successMessage = document.createElement('div');
      successMessage.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #FFD700; color: black; padding: 16px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; max-width: 400px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: black; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">Portfolio URL Copied!</div>
              <div style="font-size: 12px; opacity: 0.9;">${portfolioUrl}</div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(successMessage);
      
      // Auto-remove after 4 seconds
      setTimeout(() => {
        if (successMessage.parentNode) {
          successMessage.parentNode.removeChild(successMessage);
        }
      }, 4000);
      
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = portfolioUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // Show fallback success message
      const fallbackMessage = document.createElement('div');
      fallbackMessage.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #FFD700; color: black; padding: 16px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; max-width: 400px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: black; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD700" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">Portfolio URL Copied!</div>
              <div style="font-size: 12px; opacity: 0.9;">${portfolioUrl}</div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(fallbackMessage);
      
      // Auto-remove after 4 seconds
      setTimeout(() => {
        if (fallbackMessage.parentNode) {
          fallbackMessage.parentNode.removeChild(fallbackMessage);
        }
      }, 4000);
    }
  };

  
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center">
        <div className="text-[var(--color-text-primary)]">Please log in to view your profile.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-main)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="loading-cube">
            <div className="cube-face"></div>
            <div className="cube-face"></div>
            <div className="cube-face"></div>
            <div className="cube-face"></div>
            <div className="cube-face"></div>
            <div className="cube-face"></div>
          </div>
          <div className="text-[var(--color-text-secondary)]">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-main)] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Share Portfolio Button - Top Right */}
        <div className="flex justify-end">
          <button 
            onClick={handleSharePortfolio}
            className="btn btn-secondary gap-2"
          >
            <Share2 className="h-4 w-4" /> Share Portfolio
          </button>
        </div>

        {/* Profile Header */}
        <div className="card p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Image */}
            <div className="relative">
                            {profile?.profile_image ? (
                <>
                  <img
                    src={profile.profile_image}
                    alt={profile.display_name || user.email || 'Profile'}
                    className="w-32 h-32 rounded-full object-cover shadow-lg border-2 border-[var(--color-primary)]"
                  />
                </>
              ) : (
                <div className="w-32 h-32 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-black text-3xl font-bold shadow-lg">
                  {profile?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <button 
                onClick={() => document.getElementById('profile-image-upload')?.click()}
                className="absolute bottom-2 right-2 p-2 bg-[var(--color-bg-secondary)] rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors z-10"
                title="Change profile picture"
              >
                <Camera className="h-4 w-4 text-[var(--color-text-primary)]" />
              </button>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-left">
              <div className="mb-4">
                {editingField === 'display-name' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-3 py-1 text-white placeholder:text-xs placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                      placeholder="Enter your display name"
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
                        className="p-1 bg-[#FFD700] hover:bg-[#FFC700] text-black rounded transition-colors disabled:opacity-50"
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
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">
                      {profile?.display_name || 'Your Display Name'}
                    </h1>
                    <button
                      onClick={() => startEditing('display-name', profile?.display_name || '')}
                      className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                      title="Edit display name"
                    >
                      <Edit className="h-4 w-4 text-[#A0A0A0]" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Bio */}
              <div className="mb-4 min-h-[32px]">
                {editingField === 'bio' ? (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-[#1A1A1A] shadow-xl max-w-2xl w-full">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">Edit Bio</h3>
                        <textarea
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value.slice(0, 200))}
                          maxLength={200}
                          className="input placeholder:text-xs h-40 resize-none"
                          placeholder="Tell us about yourself and your work"
                          autoFocus
                        />
                        <p className="text-xs text-[var(--color-text-muted)] mt-1">{editingValue?.length || 0}/200 characters</p>
                      </div>
                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-2 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveField}
                          disabled={isSaving}
                          className="btn btn-primary gap-2 disabled:opacity-50"
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="text-[var(--color-text-secondary)] leading-relaxed flex-1">
                      {profile?.bio || 'No bio added yet. Click the edit icon to add your professional bio.'}
                    </p>
                    <button
                      onClick={() => startEditing('bio', profile?.bio || '')}
                      className="p-1 hover:bg-[#2A2A2A] rounded transition-colors flex-shrink-0"
                      title="Edit bio"
                    >
                      <Edit className="h-4 w-4 text-[#A0A0A0]" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Email</p>
                    <p className="text-sm text-[var(--color-text-primary)]">{user?.email || 'No email'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <UserCircle className="h-5 w-5 text-[var(--color-primary)]" />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)]">Member Since</p>
                    <p className="text-sm text-[var(--color-text-primary)]">
                      {profile?.created_at ? getRelativeTime(profile.created_at) : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Professional Name */}
              <div className="flex items-center gap-3 mt-4">
                <Briefcase className="h-5 w-5 text-[var(--color-primary)]" />
                <div className="flex-1">
                  <p className="text-xs text-[var(--color-text-muted)]">Professional Name</p>
                  {editingField === 'professional-name' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="input placeholder:text-xs"
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
                          className="p-1 bg-[#FFD700] hover:bg-[#FFC700] text-black rounded transition-colors disabled:opacity-50"
                        >
                          <Save className="h-3 w-3 text-black" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white font-medium">
                        {profile?.name || 'Not set'}
                      </p>
                      <button
                        onClick={() => startEditing('professional-name', profile?.name || '')}
                        className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                        title="Edit professional name"
                      >
                        <Edit className="h-3 w-3 text-[#A0A0A0]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Freelancer-specific profile information */}
              {role === 'freelancer' && freelancerProfile && (
                <div className="mt-6 p-4 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-[#FFD700]" />
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-[#A0A0A0] mb-1">Hourly Rate</p>
                      {editingField === 'hourly-rate' ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="bg-[#2A2A2A] border border-[#3A3A3A] rounded px-2 py-1 text-white text-sm placeholder:text-xs placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                            placeholder="50"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={cancelEditing}
                              className="p-1 hover:bg-[#3A3A3A] rounded transition-colors"
                            >
                              <X className="h-3 w-3 text-[#A0A0A0]" />
                            </button>
                            <button
                              onClick={saveFreelancerField}
                              disabled={isSaving}
                              className="p-1 bg-[#FFD700] hover:bg-[#FFC700] text-black rounded transition-colors disabled:opacity-50"
                            >
                              <Save className="h-3 w-3 text-black" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white font-medium">
                            {freelancerProfile.hourly_rate ? `$${freelancerProfile.hourly_rate}/hr` : 'Not set'}
                          </p>
                          <button
                            onClick={() => startEditing('hourly-rate', freelancerProfile.hourly_rate?.toString() || '')}
                            className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                            title="Edit hourly rate"
                          >
                            <Edit className="h-3 w-3 text-[#A0A0A0]" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-[#A0A0A0] mb-1">Experience Level</p>
                      {editingField === 'experience-level' ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="bg-[#2A2A2A] border border-[#3A3A3A] rounded px-2 py-1 text-white text-sm placeholder:text-xs placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                            autoFocus
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="expert">Expert</option>
                          </select>
                          <div className="flex gap-1">
                            <button
                              onClick={cancelEditing}
                              className="p-1 hover:bg-[#3A3A3A] rounded transition-colors"
                            >
                              <X className="h-3 w-3 text-[#A0A0A0]" />
                            </button>
                            <button
                              onClick={saveFreelancerField}
                              disabled={isSaving}
                              className="p-1 bg-[#FFD700] hover:bg-[#FFC700] text-black rounded transition-colors disabled:opacity-50"
                            >
                              <Save className="h-3 w-3 text-black" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white font-medium capitalize">
                            {freelancerProfile.experience_level || 'Not set'}
                          </p>
                          <button
                            onClick={() => startEditing('experience-level', freelancerProfile.experience_level || '')}
                            className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                            title="Edit experience level"
                          >
                            <Edit className="h-3 w-3 text-[#A0A0A0]" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-[#A0A0A0] mb-1">Availability</p>
                      {editingField === 'availability' ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="bg-[#2A2A2A] border border-[#3A3A3A] rounded px-2 py-1 text-white text-sm placeholder:text-xs placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                            autoFocus
                          >
                            <option value="available">Available</option>
                            <option value="busy">Busy</option>
                            <option value="unavailable">Unavailable</option>
                          </select>
                          <div className="flex gap-1">
                            <button
                              onClick={cancelEditing}
                              className="p-1 hover:bg-[#3A3A3A] rounded transition-colors"
                            >
                              <X className="h-3 w-3 text-[#A0A0A0]" />
                            </button>
                            <button
                              onClick={saveFreelancerField}
                              disabled={isSaving}
                              className="p-1 bg-[#FFD700] hover:bg-[#FFC700] text-black rounded transition-colors disabled:opacity-50"
                            >
                              <Save className="h-3 w-3 text-black" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white font-medium capitalize">
                            {freelancerProfile.availability || 'Not set'}
                          </p>
                          <button
                            onClick={() => startEditing('availability', freelancerProfile.availability || '')}
                            className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                            title="Edit availability"
                          >
                            <Edit className="h-3 w-3 text-[#A0A0A0]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {freelancerProfile && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-[#A0A0A0]">Skills</p>
                        <button
                          onClick={() => startEditing('skills', freelancerProfile.skills?.join(', ') || '')}
                          className="p-1 hover:bg-[#2A2A2A] rounded transition-colors"
                          title="Edit skills"
                        >
                          <Edit className="h-3 w-3 text-[#A0A0A0]" />
                        </button>
                      </div>
                      {editingField === 'skills' ? (
                        <div>
                          <textarea
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg px-3 py-2 text-white text-sm placeholder:text-xs placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent h-24 resize-none"
                            placeholder="Enter your skills separated by commas (e.g., JavaScript, React, Node.js)"
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={cancelEditing}
                              className="px-3 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded text-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={saveFreelancerField}
                              disabled={isSaving}
                              className="px-3 py-1 bg-[#FFD700] hover:bg-[#FFC700] text-black rounded text-sm disabled:opacity-50"
                            >
                              {isSaving ? 'Saving...' : 'Save Skills'}
                            </button>
                          </div>
                        </div>
                      ) : freelancerProfile.skills && freelancerProfile.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {freelancerProfile.skills.map((skill: string, index: number) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-[#FFD700]/20 text-[#FFD700] rounded text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[#A0A0A0] text-sm">No skills added yet. Click the edit icon to add your skills.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-[#1A1A1A] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Portfolio</h2>
            <button 
                onClick={() => setShowAddPortfolio(true)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-black transition-all bg-[#FFD700] rounded-lg hover:bg-[#FFC700] gap-2"
              >
                <Plus className="h-4 w-4" /> Add Project
              </button>
          </div>

          {/* Add Portfolio Modal */}
          {showAddPortfolio && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#0A0A0A] rounded-2xl p-6 border border-[#1A1A1A] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Add Portfolio Project</h3>
                  <button
                    onClick={() => setShowAddPortfolio(false)}
                    className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-[#A0A0A0]" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Project Title *</label>
                    <input
                      type="text"
                      value={newPortfolio.title}
                      onChange={(e) => setNewPortfolio(prev => ({ ...prev, title: e.target.value.slice(0, 80) }))}
                      maxLength={80}
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder:text-xs placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                      placeholder="Enter project title"
                    />
                    <p className="text-xs text-[#A0A0A0] mt-1">{newPortfolio.title?.length || 0}/80 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Description</label>
                    <textarea
                      value={newPortfolio.description}
                      onChange={(e) => setNewPortfolio(prev => ({ ...prev, description: e.target.value.slice(0, 150) }))}
                      maxLength={150}
                      className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder:text-xs placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent h-32 resize-none"
                      placeholder="Describe your project and what you accomplished"
                    />
                    <p className="text-xs text-[#A0A0A0] mt-1">{newPortfolio.description?.length || 0}/150 characters</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Image URL</label>
                      <input
                        type="url"
                        value={newPortfolio.image_url}
                        onChange={(e) => setNewPortfolio(prev => ({ ...prev, image_url: e.target.value }))}
                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder:text-xs placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Project Link</label>
                      <input
                        type="url"
                        value={newPortfolio.external_link}
                        onChange={(e) => setNewPortfolio(prev => ({ ...prev, external_link: e.target.value }))}
                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-3 text-white placeholder:text-xs placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                        placeholder="https://example.com/project"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowAddPortfolio(false)}
                    className="px-4 py-2 text-sm font-medium text-[#A0A0A0] hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPortfolio}
                    disabled={isSaving || !newPortfolio.title?.trim()}
                    className="px-4 py-2 text-sm font-medium text-black bg-[#FFD700] rounded-lg hover:bg-[#FFC700] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Adding...' : 'Add Project'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Grid */}
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
                  <div className="w-24 h-24 bg-[var(--color-background-secondary)]/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[var(--color-border-secondary)]/50">
                    <Briefcase className="h-12 w-12 text-[var(--color-text-secondary)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">No Portfolio Projects</h3>
                  <p className="text-[var(--color-text-secondary)] mb-6">Showcase your work by adding portfolio projects to your profile.</p>
                  <button 
                    onClick={() => setShowAddPortfolio(true)}
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-all bg-[var(--color-accent-primary)] rounded-lg hover:bg-[var(--color-accent-secondary)] gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Your First Project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
