import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../utils/supabase";
import { Link } from "react-router-dom";
import { Mail, Lock, Briefcase, Zap } from "lucide-react";
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
              setState({ message: "Account created successfully! Redirecting...", success: true });
              
              // Handle post-login redirect
              const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
              const intendedAction = sessionStorage.getItem('intendedAction');
              
              // Clear the stored redirect info
              sessionStorage.removeItem('redirectAfterLogin');
              sessionStorage.removeItem('intendedAction');
              
              // Redirect after a short delay
              setTimeout(() => {
                if (redirectAfterLogin) {
                  if (intendedAction === 'message' && redirectAfterLogin.startsWith('/freelancer/')) {
                    navigate(redirectAfterLogin);
                  } else {
                    navigate(redirectAfterLogin);
                  }
                } else {
                  navigate('/dashboard'); // Default to freelancer dashboard
                }
              }, 1500);
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-sans antialiased selection:bg-[#FFD700]/30">
      <div className="w-full max-w-md">
        {/* Unified Branding Logo */}
        <div className="flex flex-col items-center mb-10 group animate-in fade-in zoom-in duration-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#FFD700] w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shadow-[#FFD700]/20">
              <Briefcase className="text-black h-6 w-6" />
            </div>
            <span className="text-white font-bold text-2xl tracking-tight">Freelance<span className="text-[#FFD700]">OS</span></span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight text-center px-4">Create Account</h1>
          <p className="text-[#A0A0A0] mt-2 text-xs font-medium flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#FFD700] animate-pulse" /> Join our professional platform
          </p>
        </div>

        <div className="bg-[#0A0A0A] p-10 rounded-2xl border border-[#1A1A1A] shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Subtle Gradient Glow */}
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#FFD700]/5 blur-[80px] rounded-full" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-5">
              <div>
                <label className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-[0.2em] mb-2.5 ml-1">Display Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A0A0A0] group-focus-within:text-[#FFD700] transition-colors">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <input
                    name="display_name"
                    type="text"
                    placeholder="John Doe"
                    required
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50 hover:border-[#2A2A2A] transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-[0.2em] mb-2.5 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A0A0A0] group-focus-within:text-[#FFD700] transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    placeholder="john@freelance.os"
                    required
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50 hover:border-[#2A2A2A] transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-[#A0A0A0] uppercase tracking-[0.2em] mb-2.5 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#A0A0A0] group-focus-within:text-[#FFD700] transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="Create a secure password"
                    required
                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50 hover:border-[#2A2A2A] transition-all text-sm"
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
              className="w-full bg-[#FFD700] text-black font-semibold py-4 rounded-2xl shadow-lg shadow-[#FFD700]/20 hover:bg-[#FFC700] transition-all duration-500 disabled:opacity-50 flex items-center justify-center text-sm uppercase tracking-wide group"
            >
              {isPending ? (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="text-center mt-10">
            <span className="text-[#A0A0A0] text-[10px] font-medium">Already have an account?</span>{" "}
            <Link to="/login" className="text-white font-semibold hover:text-[#FFD700] transition-colors text-[10px] underline-offset-4 hover:underline">
              Enter Platform
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
