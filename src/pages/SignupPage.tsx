import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Mail, Lock, Briefcase, Zap } from "lucide-react";
import { signUpFreelancer } from "../utils/supabase";

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
      console.log('Starting freelancer signup process for:', { email, displayName });
      
      // Create freelancer account with profile
      const { data: authData, error: authError } = await signUpFreelancer(email, password, displayName);
      
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
      
      console.log('Freelancer account created successfully:', authData.user.id);
      
      // Check if email confirmation is required (no session)
      if (!authData.session) {
        setState({ 
          message: "Account created! Please check your email to confirm your account, then log in.", 
          success: true 
        });
        setIsPending(false);
        
        // Clear redirect info since they'll need to login after confirmation
        sessionStorage.removeItem('redirectAfterLogin');
        sessionStorage.removeItem('intendedAction');
        
        // Redirect to login page after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }
      
      // Account and profile created successfully with active session
      setState({ message: "Account created successfully! Redirecting...", success: true });
      
      // Handle post-login redirect
      const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
      const intendedAction = sessionStorage.getItem('intendedAction');
      
      // Clear the stored redirect info
      sessionStorage.removeItem('redirectAfterLogin');
      sessionStorage.removeItem('intendedAction');
      
      // Redirect after a short delay to allow auth context to update
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
                <Briefcase className="w-6 h-6 text-black" />
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">Freelance<span className="text-[#FFD700]">OS</span></span>
           </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your freelancer account</h1>
          <p className="text-[#A0A0A0] mt-2 text-xs font-medium">Start your professional freelance journey</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div className="group">
            <label htmlFor="display_name" className="block text-sm font-medium text-white mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              required
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50 transition-all duration-200"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div className="group">
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0A0]" />
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div className="group">
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A0A0A0]" />
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20 focus:border-[#FFD700]/50 transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Create Freelancer Account
              </>
            )}
          </button>

          {/* Status Message */}
          {state.message && (
            <div className={`p-3 rounded-lg text-sm ${
              state.success 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {state.message}
            </div>
          )}
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-[#A0A0A0] text-sm">
            Already have a freelancer account?{' '}
            <Link 
              to="/login" 
              className="text-[#FFD700] hover:text-[#FFC700] font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Client Portal Link */}
        <div className="mt-6 text-center">
          <p className="text-[#A0A0A0] text-xs">
            Looking to hire freelancers?{' '}
            <Link 
              to="/client-login" 
              className="text-[#FFD700] hover:text-[#FFC700] font-medium transition-colors"
            >
              Join as Client
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
