import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Mail, Lock, Briefcase, Eye, EyeOff, User, CheckCircle, AlertCircle } from "lucide-react";
import { signUpFreelancer } from "../utils/supabase";

const initialState = {
  message: "",
  success: false,
};

export default function SignupPage() {
  const navigate = useNavigate();
  const [state, setState] = useState(initialState);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    
    const displayName = formData.display_name;
    const email = formData.email;
    const password = formData.password;

    // Validate display name
    if (!displayName || displayName.trim().length < 2) {
      setState({ message: "Display name must be at least 2 characters long.", success: false });
      setIsPending(false);
      return;
    }

    try {
      // Create freelancer account with profile
      const { data: authData, error: authError } = await signUpFreelancer(email, password, displayName);
      
      if (authError) {
        setState({ message: authError.message, success: false });
        setIsPending(false);
        return;
      }
      
      if (!authData.user) {
        setState({ message: "Account creation failed. Please try again.", success: false });
        setIsPending(false);
        return;
      }
      
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
      setState({ message: "An unexpected error occurred. Please try again.", success: false });
    } finally {
      setIsPending(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400', 'text-green-300'];
    
    return { strength, label: labels[strength], color: colors[strength] };
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Premium Background with Dot Grid */}
      <div className="fixed inset-0 dot-grid pointer-events-none" />
      
      {/* Subtle Blur Elements */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-[var(--color-accent)] subtle-blur rounded-full pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-64 h-64 bg-[var(--color-primary)] subtle-blur rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Premium Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="bg-[var(--color-primary)] w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shadow-[var(--color-primary)]/20">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-[var(--color-text-primary)] font-bold text-2xl tracking-tight">Freelance<span className="text-[var(--color-primary)]">OS</span></span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create your freelancer account</h1>
          <p className="text-[var(--color-text-secondary)]">Start your professional freelance journey</p>
        </div>

        {/* Signup Form */}
        <div className="card p-8 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name Field */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Display Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  name="display_name"
                  required
                  minLength={2}
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="John Doe"
                  className="input pl-10 w-full"
                />
                {formData.display_name.length >= 2 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="you@freelance.os"
                  className="input pl-10 w-full"
                />
                {formData.email && formData.email.includes('@') && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••••"
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--color-text-secondary)]">Password strength</span>
                    <span className={`text-xs font-medium ${getPasswordStrength(formData.password).color}`}>
                      {getPasswordStrength(formData.password).label}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--color-bg-muted)] rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        getPasswordStrength(formData.password).strength <= 2 ? 'bg-red-400' :
                        getPasswordStrength(formData.password).strength <= 3 ? 'bg-yellow-400' :
                        getPasswordStrength(formData.password).strength <= 4 ? 'bg-green-400' : 'bg-green-300'
                      }`}
                      style={{ width: `${(getPasswordStrength(formData.password).strength / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Status Message */}
            {state.message && (
              <div className={`p-3 rounded-xl flex items-center gap-3 ${
                state.success 
                  ? 'bg-[var(--color-success)]/10 border border-[var(--color-success)]/20' 
                  : 'bg-[var(--color-error)]/10 border border-[var(--color-error)]/20'
              }`}>
                {state.success ? (
                  <CheckCircle className="w-5 h-5 text-[var(--color-success)] flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[var(--color-error)] flex-shrink-0" />
                )}
                <p className={`text-sm font-medium ${
                  state.success ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'
                }`}>
                  {state.message}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || !formData.display_name || !formData.email || formData.password.length < 6}
              className="btn btn-primary w-full py-3 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Briefcase className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center pt-6 border-t border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)] text-sm">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
