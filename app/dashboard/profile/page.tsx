"use client";

import { useState } from "react";
import { Upload, Plus, X, Image as ImageIcon, Briefcase, Camera, Save } from "lucide-react";

export default function ProfileEditPage() {
  const [skills, setSkills] = useState<string[]>(["UI/UX Design", "Figma", "SaaS"]);
  const [newSkill, setNewSkill] = useState("");

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

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          <p className="text-slate-400 text-sm mt-1">
            This is how clients will see you on your public page.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-full font-medium shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-colors">
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="bg-[#151B2B] rounded-2xl border border-slate-800/60 overflow-hidden shadow-sm">
        <div className="p-8">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <UserIcon /> Personal Information
          </h2>
          
          <div className="flex flex-col md:flex-row gap-10">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="h-32 w-32 rounded-full border-4 border-slate-800/80 bg-slate-800 relative overflow-hidden group cursor-pointer shadow-sm flex items-center justify-center">
                <Camera className="h-8 w-8 text-slate-500 group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-semibold">Upload</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera"
                  className="w-full rounded-xl border border-slate-700/80 px-4 py-2.5 bg-[#0B0F19] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  defaultValue="Alex Rivera"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Bio / Headline
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell clients what you do..."
                  className="w-full rounded-xl border border-slate-700/80 px-4 py-2.5 bg-[#0B0F19] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                  defaultValue="Award-winning digital designer specializing in SaaS UI/UX. I help startups look like enterprise giants."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Skills (Press Enter to add)
                </label>
                <div className="p-2 border border-slate-700/80 rounded-xl bg-[#0B0F19] flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-indigo-500/50 transition-shadow">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 flex items-center gap-1 shadow-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-slate-500 hover:text-red-500 focus:outline-none ml-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="flex-1 bg-transparent border-none focus:ring-0 min-w-[120px] text-sm px-2 text-white outline-none"
                    placeholder="Add a skill..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Section */}
      <div className="bg-[#151B2B] rounded-2xl border border-slate-800/60 overflow-hidden shadow-sm mt-8">
        <div className="p-8 border-b border-slate-800/60 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-500" /> Portfolio Items
          </h2>
          <button className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
            <Plus className="h-4 w-4" /> Add Item
          </button>
        </div>
        
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Add New PlaceholderCard */}
            <div className="border-2 border-dashed border-slate-800 rounded-2xl h-64 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-800/30 transition-colors cursor-pointer group">
              <div className="h-12 w-12 bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ImageIcon className="h-6 w-6" />
              </div>
              <p className="font-medium text-slate-400">Upload Project</p>
              <p className="text-xs text-slate-500 mt-1">800x600px recommended</p>
            </div>

            {/* Demo Item */}
            <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-sm bg-slate-50 dark:bg-slate-800 h-64 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 opacity-90 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent">
                <h3 className="text-white font-bold text-lg mb-1">Fintech Dashboard UI</h3>
                <p className="text-slate-200 text-sm line-clamp-2">A complete overhaul of a modern banking app interface focusing on clear data visualization.</p>
              </div>
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
