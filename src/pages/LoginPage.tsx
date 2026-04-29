import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Loader2, Mail, Lock, ArrowRight } from "lucide-react";

const initialState = {
  message: "",
  success: false,
};

export default function LoginPage() {
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Simulate authentication (replace with actual auth logic)
    setTimeout(() => {
      if (email && password) {
        setState({ message: "Login successful", success: true });
        navigate('/dashboard');
      } else {
        setState({ message: "Invalid credentials", success: false });
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
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">Freelance<span className="text-indigo-500">OS</span></span>
           </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-slate-500 mt-2 text-xs font-medium">Continue your professional journey</p>
        </div>

        <div className="bg-[#151B2B] p-10 rounded-2xl border border-slate-800/60 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/5 blur-[80px] rounded-full" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-5">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="alex@freelance.os"
                    required
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 hover:border-slate-700 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2.5 ml-1">
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Password</label>
                  <Link to="#" className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 transition-colors uppercase tracking-widest">Reset?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 hover:border-slate-700 transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {state?.message && !state.success && (
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl animate-in shake duration-300">
                <p className="text-[10px] text-red-500 font-semibold text-center">{state.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-600 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all duration-500 disabled:opacity-50 flex items-center justify-center group text-sm uppercase tracking-wide"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-slate-600 text-[10px] font-medium">
            Not a member? {" "}
            <Link to="/signup" className="text-slate-300 font-semibold hover:text-indigo-400 transition-colors underline-offset-4 hover:underline">
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
