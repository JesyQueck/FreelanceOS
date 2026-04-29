import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../utils/supabase";
import { Link } from "react-router-dom";
import { Loader2, Mail, Lock, Briefcase, Zap } from "lucide-react";
import { signUp, createOrUpdateUserProfile } from "../utils/supabase";

const initialState = {
  message: "",
  success: false,
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const formData = new FormData(e.currentTarget);
    const displayName = formData.get('display_name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('Form data extracted:', { displayName, email, password: '***' });

    // Validate display name
    if (!displayName || displayName.trim().length < 2) {
      setState({ message: "Display name must be at least 2 characters long.", success: false });
      setIsPending(false);
      return;
    }

    try {
      console.log('Starting signup process for:', { email, displayName });
      
      // Step 1: Create user account
      const { data: authData, error: authError } = await signUp(email, password);
      
      if (authError) {
        console.error('Auth error:', authError);
        setState({ message: authError.message, success: false });
        setIsPending(false);
        return;
      }
      
      if (!authData.user) {
        console.error('No user data returned from auth');
        setState({ message: "Account creation failed. Please try again.", success: false });
        setIsPending(false);
        return;
      }
      
      console.log('User created successfully:', authData.user.id);
      
      // Step 2: Create user profile
      try {
        console.log('Creating user profile with:', { userId: authData.user.id, email, displayName });
        console.log('Display name type and value:', typeof displayName, JSON.stringify(displayName));
        console.log('Trimmed display name:', displayName.trim());
        const profileResult = await createOrUpdateUserProfile(authData.user.id, email, displayName.trim());
        console.log('Profile creation result:', profileResult);
        
        if (profileResult.error) {
          console.error('Profile creation error details:', profileResult.error);
          console.error('Full error object:', JSON.stringify(profileResult.error, null, 2));
          setState({ message: `Profile setup failed: ${profileResult.error.message || 'Unknown error'}`, success: false });
        } else {
          console.log('Profile created successfully');
          
          // Step 3: Automatically sign in the user
          try {
            const { error: signInError } = await signIn(email, password);
            if (signInError) {
              console.error('Auto sign-in error:', signInError);
              setState({ message: "Account created! Please log in manually.", success: true });
            } else {
              console.log('Auto sign-in successful');
              setState({ message: "Account created successfully! Redirecting to dashboard...", success: true });
              // Redirect to dashboard after a short delay
              setTimeout(() => navigate('/dashboard'), 1500);
            }
          } catch (signInException) {
            console.error('Auto sign-in exception:', signInException);
            setState({ message: "Account created! Please log in manually.", success: true });
          }
        }
      } catch (profileError) {
        console.error('Profile creation exception:', profileError);
        setState({ message: "Account created but profile setup failed. Please contact support.", success: false });
      }
    } catch (err) {
      console.error('Signup process error:', err);
      setState({ message: "An unexpected error occurred. Please try again.", success: false });
    } finally {
      setIsPending(false);
    }
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
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2.5 ml-1">Display Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <input
                    name="display_name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="w-full bg-[#0B0F19] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-500/50 hover:border-slate-700 transition-all text-sm"
                  />
                </div>
              </div>

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
