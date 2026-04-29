import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Loader2, ArrowLeft, Save } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { createOrUpdateUserProfile } from "../../utils/supabase";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    setIsPending(true);
    setMessage("");

    try {
      const result = await createOrUpdateUserProfile(user.id, user.email || "", displayName);
      
      if (result.error) {
        setMessage(result.error.message);
        setSuccess(false);
      } else {
        setMessage("Profile updated successfully!");
        setSuccess(true);
        setTimeout(() => navigate("/dashboard/profile"), 1500);
      }
    } catch (error) {
      setMessage("An unexpected error occurred");
      setSuccess(false);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/dashboard/profile")}
            className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            <p className="text-slate-400 text-sm">Update your display name</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#151B2B] p-8 rounded-2xl border border-slate-800/60 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">
                Display Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                  <Briefcase className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  required
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 hover:border-slate-700 transition-all text-sm"
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 border rounded-2xl ${
                success ? 'bg-green-500/5 border-green-500/10 text-green-400' : 'bg-red-500/5 border-red-500/10 text-red-500'
              }`}>
                <p className="text-[10px] font-semibold text-center">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !displayName.trim()}
              className="w-full bg-indigo-600 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
