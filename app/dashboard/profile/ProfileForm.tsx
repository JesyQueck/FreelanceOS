"use client";

import { useState, useEffect } from "react";
import { X, Briefcase, Camera, Save, Image as ImageIcon, Plus, Trash2, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

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
  const supabase = createClient();
  const router = useRouter();
  
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

  // CLIENT-SIDE DIRECT SAVE
  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage({ type: 'error', text: 'You were signed out. Please refresh and log in again.' });
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        name,
        bio,
        skills,
      })
      .eq("id", user.id);

    if (error) {
      setMessage({ type: 'error', text: 'Database Error: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
      router.refresh(); // Refresh server data
    }
    setIsSaving(false);
  }

  async function handleAddPortfolio(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsAddingPortfolio(true);
    const formData = new FormData(e.currentTarget);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("portfolios")
      .insert({
        user_id: user.id,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        image_url: formData.get("image_url") as string,
        external_link: formData.get("external_link") as string,
      });

    if (error) {
      alert(error.message);
    } else {
      setShowAddModal(false);
      router.refresh();
    }
    setIsAddingPortfolio(false);
  }

  async function handleDeletePortfolio(id: string) {
    if (!confirm("Are you sure?")) return;
    const { error } = await supabase.from("portfolios").delete().eq("id", id);
    if (!error) router.refresh();
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12 text-sm font-sans">
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Edit Profile</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Updates here use direct-to-backend syncing.
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
          <div className={`p-3 rounded-xl text-xs font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
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
                  <Camera className="h-6 w-6 text-slate-500" />
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full rounded-lg border border-slate-700/80 px-3 py-2 bg-[#0B0F19] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-xs"
                    defaultValue={initialProfile.name}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Bio / Headline</label>
                  <textarea
                    rows={2}
                    name="bio"
                    required
                    className="w-full rounded-lg border border-slate-700/80 px-3 py-2 bg-[#0B0F19] text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none text-xs"
                    defaultValue={initialProfile.bio}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Skills</label>
                  <div className="p-1.5 border border-slate-700/80 rounded-lg bg-[#0B0F19] flex flex-wrap gap-1.5 focus-within:ring-1 focus-within:ring-indigo-500/50">
                    {skills.map((skill) => (
                      <span key={skill} className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-md text-[10px] font-medium text-slate-300 flex items-center gap-1">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="text-slate-500 hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={handleAddSkill}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-[10px] px-1 text-white outline-none"
                      placeholder="Add a skill..."
                    />
                  </div>
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
                  <div className="absolute top-3 right-3 flex gap-2">
                    {project.external_link && (
                      <a href={project.external_link} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900/60 text-slate-300 rounded-lg opacity-0 group-hover:opacity-100"><ExternalLink className="h-3.5 w-3.5" /></a>
                    )}
                    <button onClick={() => handleDeletePortfolio(project.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-800">
                  <h3 className="text-white font-bold text-[11px]">{project.title}</h3>
                  <p className="text-slate-500 text-[10px]">{project.description}</p>
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
            <h3 className="text-lg font-bold text-white mb-6">Add Portfolio Project</h3>
            <form onSubmit={handleAddPortfolio} className="space-y-4">
              <input required name="title" className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" placeholder="Project Title" />
              <input name="image_url" className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" placeholder="Image URL (Optional)" />
              <input name="external_link" className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white" placeholder="External Link (Optional)" />
              <textarea required name="description" rows={3} className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white resize-none" placeholder="Description" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-800 text-white py-2 rounded-lg text-xs">Cancel</button>
                <button disabled={isAddingPortfolio} type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold text-xs">
                  {isAddingPortfolio ? "Adding..." : "Add to Portfolio"}
                </button>
              </div>
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
