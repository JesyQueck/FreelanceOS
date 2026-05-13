import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { validateFreelancerAccess } from "../utils/supabase";

const initialState = {
  message: "",
  success: false,
};

export default function LoginPage() {
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Premium Background with Dot Grid */}
      <div className="fixed inset-0 dot-grid pointer-events-none" />
      
      {/* Subtle Blur Elements */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-[var(--color-primary)] subtle-blur rounded-full pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-64 h-64 bg-[var(--color-accent)] subtle-blur rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Premium Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-[var(--color-primary)] w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shadow-[var(--color-primary)]/20">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-[var(--color-text-primary)] font-bold text-2xl tracking-tight">Freelance<span className="text-[var(--color-primary)]">OS</span></span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
          <p className="text-[var(--color-text-secondary)]">Continue your professional journey</p>
        </div>

        {/* Login Form */}
        <div className="card p-8 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                <input
                  name="email"
                  type="email"
                  placeholder="you@freelance.os"
                  required
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[var(--color-text-primary)]">Password</label>
                <Link to="#" className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  required
                  className="input pl-10 pr-10 w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {state?.message && !state.success && (
              <div className="p-3 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-xl">
                <p className="text-sm text-[var(--color-error)] font-medium">{state.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary w-full py-3 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center pt-6 border-t border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)] text-sm">
              Not a member?{" "}
              <Link to="/signup" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold transition-colors">
                Create your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
