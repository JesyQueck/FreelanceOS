"use client";

import { useState } from "react";
import { X, Briefcase, Camera, Save, Image as ImageIcon, Plus, Trash2, ExternalLink } from "lucide-react";
import { updateProfile, addPortfolioItem, deletePortfolioItem } from "./actions";

interface Portfolio {
  id: string;
  title: string;
  description: string;
  image_url: string;
  external_link?: string;
}

interface ProfileFormProps {
  initialProfile: {
    name: string;
    bio: string;
    skills: string[];
    portfolios: Portfolio[];
  };
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [skills, setSkills] = useState<string[]>(initialProfile.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newSkill.trim() && !skills.includes(newSkill.trim())) {
      e.preventDefault();
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // NATIVE FORM ACTION HANDLER
  async function actionHandler(formData: FormData) {
    setIsSaving(true);
    setMessage(null);
    
    // Skill syncing is handled by the hidden input now, or we can still append here
    formData.set("skills", JSON.stringify(skills));

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network or session error. Check console.' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddPortfolio(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsAddingPortfolio(true);
    const formData = new FormData(e.currentTarget);
    const result = await addPortfolioItem(formData);
    if (result.success) {
      setShowAddModal(false);
    } else {
      alert(result.error);
    }
    setIsAddingPortfolio(false);
  }

  async function handleDeletePortfolio(id: string) {
    if (!confirm("Are you sure?")) return;
    const result = await deletePortfolioItem(id);
    if (!result.success) alert(result.error);
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12 text-sm font-sans">
      <form action={actionHandler} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Edit Profile</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Refine how you appear to clients.
            </p>
          </div>
          <button 
            disabled={isSaving}
            type="submit"
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-full font-medium shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-colors disabled:opacity-50 text-xs"
          >
            {isSaving ? "Saving..." : <><Save className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>

        {message && (
          <div className={`p-3 rounded-xl text-xs font-medium animate-in fade-in slide-in-from-top-1 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-[#151B2B] rounded-2xl border border-slate-800/60 overflow-hidden shadow-sm">
          <div className="p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <UserIcon /> Personal Information
            </h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center gap-4">
                <div className="h-24 w-24 rounded-full border-4 border-slate-800/80 bg-slate-800 relative overflow-hidden group cursor-pointer shadow-sm flex items-center justify-center">
                  <Camera className="h-6 w-6 text-slate-500 group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-[10px] font-semibold">Upload</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full rounded-lg border border-slate-700/80 px-3 py-2 bg-[#0B0F19] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-xs"
                    defaultValue={initialProfile.name}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Bio / Headline
                  </label>
                  <textarea
                    rows={2}
                    name="bio"
                    required
                    className="w-full rounded-lg border border-slate-700/80 px-3 py-2 bg-[#0B0F19] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none text-xs"
                    defaultValue={initialProfile.bio}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Skills (Press Enter)
                  </label>
                  <div className="p-1.5 border border-slate-700/80 rounded-lg bg-[#0B0F19] flex flex-wrap gap-1.5 focus-within:ring-1 focus-within:ring-indigo-500/50">
                    {skills.map((skill) => (
                      <span key={skill} className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-[10px] font-medium text-slate-300 flex items-center gap-1">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="text-slate-500 hover:text-red-500 focus:outline-none">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={handleAddSkill}
                      className="flex-1 bg-transparent border-none focus:ring-0 min-w-[100px] text-[10px] px-1 text-white outline-none"
                      placeholder="Add a skill..."
                    />
                  </div>
                  {/* HIDDEN INPUT FOR SKILLS ARRAY */}
                  <input type="hidden" name="skills" value={JSON.stringify(skills)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="bg-[#151B2B] rounded-2xl border border-slate-800/60 overflow-hidden shadow-sm mt-6">
        <div className="p-6 border-b border-slate-800/60 flex justify-between items-center">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-indigo-500" /> Portfolio Items
          </h2>
          <button 
            type="button" 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-indigo-500/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Project
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {initialProfile.portfolios.length === 0 && (
               <div onClick={() => setShowAddModal(true)} className="border-2 border-dashed border-slate-800 rounded-xl h-48 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-800/30 transition-colors cursor-pointer group">
                  <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-xs font-medium">No projects added yet</p>
               </div>
            )}
            
            {initialProfile.portfolios.map((project) => (
              <div key={project.id} className="group relative rounded-xl border border-slate-800 overflow-hidden bg-[#0F1523] h-48 flex flex-col">
                <div 
                  className="flex-1 bg-[#1A2133] relative overflow-hidden bg-cover bg-center"
                  style={project.image_url ? { backgroundImage: `url(${project.image_url})` } : {}}
                >
                  {!project.image_url && (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-slate-700 opacity-20" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 flex gap-2">
                    {project.external_link && (
                      <a 
                        href={project.external_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-900/60 backdrop-blur-md text-slate-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button 
                      onClick={() => handleDeletePortfolio(project.id)}
                      className="p-2 bg-red-500/10 backdrop-blur-md text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-800 bg-[#0F1523]">
                  <h3 className="text-white font-bold text-[11px] truncate">{project.title}</h3>
                  <p className="text-slate-500 text-[10px] line-clamp-1">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Portfolio Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#151B2B] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Add Portfolio Project</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white"><X className="h-5 w-5"/></button>
            </div>
            
            <form onSubmit={handleAddPortfolio} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Project Title*</label>
                <input required name="title" className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Image URL (Optional)</label>
                <input name="image_url" className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">External Link (Optional)</label>
                <input name="external_link" className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description*</label>
                <textarea required name="description" rows={3} className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-indigo-500 resize-none" />
              </div>
              <button disabled={isAddingPortfolio} type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-500 transition-colors text-xs">
                {isAddingPortfolio ? "Adding..." : "Add to Portfolio"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
