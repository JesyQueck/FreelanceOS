import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, Lock, Briefcase, Zap } from "lucide-react";

const initialState = {
  message: "",
  success: false,
};

export default function SignupPage() {
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Simulate signup (replace with actual auth logic)
    setTimeout(() => {
      if (email && password) {
        setState({ message: "Account created successfully! Please check your email.", success: true });
      } else {
        setState({ message: "Please fill in all fields", success: false });
      }
      setIsPending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-4 font-sans antialiased selection:bg-indigo-500/30">
      <div className="w-full max-w-md">
        {/* Unified Branding Logo */}
        <div className="flex flex-col items-center mb-10 group animate-in fade-in zoom-in duration-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shadow-indigo-600/20">
              <Briefcase className="text-white h-6 w-6" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">Freelance<span className="text-indigo-500">OS</span></span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight text-center px-4">Create Account</h1>
          <p className="text-slate-500 mt-2 text-xs font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-500 animate-pulse" /> Join our professional platform
          </p>
        </div>

        <div className="bg-[#151B2B] p-10 rounded-2xl border border-slate-800/60 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Subtle Gradient Glow */}
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/5 blur-[80px] rounded-full" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-5">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Work Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@company.os"
                    required
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 hover:border-slate-700 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="Create a secure password"
                    required
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 hover:border-slate-700 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {state?.message && (
              <div className={`p-4 border rounded-2xl animate-in fade-in duration-300 ${state.success ? 'bg-green-500/5 border-green-500/10 text-green-400' : 'bg-red-500/5 border-red-500/10 text-red-500'}`}>
                <p className="text-[10px] font-semibold text-center">{state.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all duration-500 disabled:opacity-50 flex items-center justify-center text-sm uppercase tracking-wide group"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="text-center mt-10">
            <span className="text-slate-600 text-[10px] font-medium">Already have an account?</span>{" "}
            <Link to="/login" className="text-slate-300 font-semibold hover:text-indigo-400 transition-colors text-[10px] underline-offset-4 hover:underline">
              Enter Platform
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
