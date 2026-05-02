import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Mail, Lock, ArrowRight } from "lucide-react";
import { validateFreelancerAccess } from "../utils/supabase";

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

    try {
      const result = await validateFreelancerAccess(email, password);
      
      if (!result.success) {
        setState({ message: result.error || 'Login failed', success: false });
      } else {
        setState({ message: "Login successful", success: true });
        
        // Handle post-login redirect
        const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
        const intendedAction = sessionStorage.getItem('intendedAction');
        
        if (redirectAfterLogin) {
          // Clear the stored redirect info
          sessionStorage.removeItem('redirectAfterLogin');
          sessionStorage.removeItem('intendedAction');
          
          // Navigate to intended destination
          if (intendedAction === 'message' && redirectAfterLogin.startsWith('/freelancer/')) {
            // Navigate to the freelancer profile to start messaging
            navigate(redirectAfterLogin);
          } else {
            navigate(redirectAfterLogin);
          }
        } else {
          // Default redirect to freelancer dashboard
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setState({ message: "An unexpected error occurred", success: false });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans antialiased selection:bg-[#FFD700]/30">
      <div className="w-full max-w-md">
        {/* Unified Branding Logo */}
        <div className="flex flex-col items-center mb-10 group animate-in fade-in zoom-in duration-700">
           <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#FFD700] w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shadow-[#FFD700]/20">
                <Briefcase className="w-6 h-6 text-black" />
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">Freelance<span className="text-[#FFD700]">OS</span></span>
           </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-[#A0A0A0] mt-2 text-xs font-medium">Continue your professional journey</p>
        </div>

        <div className="bg-[#0A0A0A] p-10 rounded-2xl border border-[#1A1A1A] shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FFD700]/5 blur-[80px] rounded-full" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-5">
              <div>
                <label className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-[0.2em] mb-2.5 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A0A0A0] group-focus-within:text-[#FFD700] transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="alex@freelance.os"
                    required
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50 hover:border-[#2A2A2A] transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2.5 ml-1">
                  <label className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-[0.2em]">Password</label>
                  <Link to="#" className="text-[10px] font-bold text-[#FFD700] hover:text-[#FFC700] transition-colors uppercase tracking-widest">Reset?</Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A0A0A0] group-focus-within:text-[#FFD700] transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50 hover:border-[#2A2A2A] transition-all text-sm"
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
              className="w-full bg-[#FFD700] text-black font-semibold py-4 rounded-2xl shadow-lg shadow-[#FFD700]/20 hover:bg-[#FFC700] transition-all duration-500 disabled:opacity-50 flex items-center justify-center group text-sm uppercase tracking-wide"
            >
              {isPending ? (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-[#A0A0A0] text-[10px] font-medium">
            Not a member? {" "}
            <Link to="/signup" className="text-white font-semibold hover:text-[#FFD700] transition-colors underline-offset-4 hover:underline">
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
