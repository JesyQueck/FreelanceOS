import { useState } from 'react'
import { X, Mail, Lock, User, UserPlus, LogIn } from 'lucide-react'
import { signUpClient, signIn } from '../utils/supabase'

interface ClientAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: () => void
  freelancerUsername: string
}

export default function ClientAuthModal({ isOpen, onClose, onAuthSuccess, freelancerUsername }: ClientAuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  
  if (!isOpen) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Use regular signIn instead of validateClientAccess to allow role-based routing
      const { error } = await signIn(loginData.email, loginData.password)
      
      if (error) {
        setError(error.message || 'Login failed')
      } else {
        // Store the intended action for messaging
        sessionStorage.setItem('redirectAfterLogin', `/freelancer/${freelancerUsername}`)
        sessionStorage.setItem('intendedAction', 'message')
        onAuthSuccess()
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await signUpClient(signupData.email, signupData.password, signupData.fullName)
      
      if (error) {
        // Handle common signup errors with user-friendly messages
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          setError('This email may already be registered. Please try signing in or use a different email.')
        } else {
          setError(error.message)
        }
      } else if (data.user) {
        // Client account and profile created successfully by signUpClient
        console.log('Client account created successfully')
        
        // Store the intended action for messaging
        sessionStorage.setItem('redirectAfterLogin', `/freelancer/${freelancerUsername}`)
        sessionStorage.setItem('intendedAction', 'message')
        onAuthSuccess()
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] rounded-2xl w-full max-w-lg md:max-w-md border border-[#1A1A1A] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD700] rounded-xl flex items-center justify-center">
              {isLogin ? <LogIn className="h-5 w-5 text-black" /> : <UserPlus className="h-5 w-5 text-black" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isLogin ? 'Sign In to Message' : 'Join to Message'}
              </h2>
              <p className="text-sm text-[#A0A0A0]">Connect with this freelancer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#1A1A1A] rounded-lg transition-colors"
          >
            <X className="h-4 w-4 md:h-5 md:w-5 text-[#A0A0A0]" />
          </button>
        </div>

        {/* Toggle */}
        <div className="flex border-b border-[#1A1A1A]">
          <button
            onClick={() => { setIsLogin(true); setError('') }}
            className={`flex-1 py-1 md:py-2 text-xs md:text-sm font-medium transition-colors ${
              isLogin 
                ? 'text-[#FFD700] border-b-2 border-[#FFD700]' 
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError('') }}
            className={`flex-1 py-1 md:py-2 text-xs md:text-sm font-medium transition-colors ${
              !isLogin 
                ? 'text-[#FFD700] border-b-2 border-[#FFD700]' 
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-3 md:space-y-2">
              <div>
                <label className="block text-[10px] font-medium text-white mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-[#A0A0A0]" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent text-sm md:text-base"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-white mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-[#A0A0A0]" />
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent text-sm md:text-base"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3 md:space-y-2">
              <div>
                <label className="block text-[10px] font-medium text-white mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
                  <input
                    type="text"
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    required
                    className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent text-sm md:text-base"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-white mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-[#A0A0A0]" />
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                    className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent text-sm md:text-base"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-white mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-[#A0A0A0]" />
                  <input
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent text-sm md:text-base"
                    placeholder="Create a password"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-white mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-[#A0A0A0]" />
                  <input
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    required
                    className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-2 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent text-sm md:text-base"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
