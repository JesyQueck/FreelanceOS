import { useState, useEffect } from "react";
import { UserCircle, Mail, Briefcase, Edit, Camera, CheckCircle2, X, Save, Plus, ExternalLink, Trash2, Share2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserProfile, createOrUpdateUserProfile, UserProfile, PortfolioItem, getPortfolioItems, createPortfolioItem, deletePortfolioItem, generateShareLink } from "../../utils/supabase";

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

  const handleShareProfile = () => {
    const shareLink = generateShareLink(profile?.username, profile?.slug);
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      // You could add a toast notification here
      alert('Portfolio link copied to clipboard!');
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
          onClick={handleShareProfile}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors shadow-sm"
        >
          <Share2 className="h-4 w-4" />
          Share Portfolio
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-[#151B2B] rounded-2xl p-8 border border-slate-800/60 shadow-sm">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center">
            <div className="relative">
              {profile?.profile_image ? (
                <img 
                  src={profile?.profile_image} 
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
                      {profile?.display_name || profile?.name || 'User'}
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
                      <span>{getRelativeTime(profile?.created_at)}</span>
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
            onClick={() => startEditing('skills', '')}
            className="p-1 hover:bg-slate-700 rounded transition-colors"
            title="Edit skills"
          >
            <Edit className="h-4 w-4 text-slate-400" />
          </button>
        </div>
        {editingField === 'skills' ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                className="flex-1 bg-[#0B0F19] border border-slate-800 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <div className="h-4 w-4 border border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Add</span>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile?.skills?.map((skill: string, index: number) => (
                <div key={index} className="flex items-center gap-1 px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-sm group">
                  <span>{skill}</span>
                  <button
                    onClick={() => removeSkill(skill)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={cancelEditing}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
            >
              Done
            </button>
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

      {/* Portfolio Section */}
      <div className="bg-[#151B2B] rounded-2xl p-6 border border-slate-800/60 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Portfolio</h3>
          <button 
            onClick={() => setShowAddPortfolio(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </button>
        </div>
        
        {/* Modal Overlay */}
        {showAddPortfolio && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#151B2B] rounded-2xl p-6 border border-slate-800/60 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                    <Plus className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">Add New Project</h4>
                    <p className="text-slate-400 text-sm">Showcase your best work</p>
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
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Title *</label>
                  <input
                    type="text"
                    value={newPortfolio.title}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter project title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <textarea
                    value={newPortfolio.description}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32 resize-none transition-all"
                    placeholder="Describe your project, what you built, and your role"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Project Image URL</label>
                  <input
                    type="url"
                    value={newPortfolio.image_url}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, image_url: e.target.value }))}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">External Link</label>
                  <input
                    type="url"
                    value={newPortfolio.external_link}
                    onChange={(e) => setNewPortfolio(prev => ({ ...prev, external_link: e.target.value }))}
                    className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPortfolio}
                  disabled={isSaving || !newPortfolio.title?.trim()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 border border-white border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </>
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
              <div key={item.id} className="group relative bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                <div className="aspect-video bg-slate-700/50 relative overflow-hidden">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-slate-600/50 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Briefcase className="h-8 w-8 text-slate-400" />
                        </div>
                        <span className="text-slate-400 text-sm">No Image</span>
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
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.description || 'No description provided'}</p>
                  {item.external_link && (
                    <a
                      href={item.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
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
                <div className="w-24 h-24 bg-slate-700/50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-600/50">
                  <Briefcase className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">No Projects Yet</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
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
