import { useState, useCallback } from 'react'
import { X, Mail, Lock, User, UserPlus, LogIn } from 'lucide-react'
import { signUpClient, signIn, supabase } from '../utils/supabase'
import { useAuth } from '../contexts/AuthContext'

interface ConversationResult {
  success: boolean
  conversation_id?: string | null
  error?: string | null
}

interface ClientAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuthSuccess: () => void
  freelancerUsername: string
  autoCreateConversation?: boolean
}

interface LoginFormData {
  email: string
  password: string
}

interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

interface AuthError {
  message: string
  code?: string
}

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'An account with this email already exists. Please sign in instead.',
  SERVER_ERROR: 'This email may already be registered. Please try signing in or use a different email.',
  PASSWORD_MISMATCH: 'Passwords do not match',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  EMAIL_CONFIRMATION: 'Please check your email to confirm your account. Then sign in to continue.'
} as const

const STORAGE_KEYS = {
  REDIRECT_AFTER_LOGIN: 'redirectAfterLogin',
  INTENDED_ACTION: 'intendedAction',
  TARGET_FREELANCER: 'targetFreelancer'
} as const

export default function ClientAuthModal({ 
  isOpen, 
  onClose, 
  onAuthSuccess, 
  freelancerUsername, 
  autoCreateConversation = false 
}: ClientAuthModalProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [loginData, setLoginData] = useState<LoginFormData>({ email: '', password: '' })
  const [signupData, setSignupData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  const { user } = useAuth()

  const clearError = useCallback(() => setError(''), [])

  const storeAuthIntent = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEYS.REDIRECT_AFTER_LOGIN, `/freelancer/${freelancerUsername}`)
    sessionStorage.setItem(STORAGE_KEYS.INTENDED_ACTION, 'message')
    sessionStorage.setItem(STORAGE_KEYS.TARGET_FREELANCER, freelancerUsername)
  }, [freelancerUsername])

  const getFreelancerId = useCallback(async (username: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('slug', username)
        .single() as { data: { id: string } | null; error: any }

      if (error) {
        console.error('Error fetching freelancer ID:', error)
        return null
      }

      return data?.id || null
    } catch (err) {
      console.error('Unexpected error fetching freelancer ID:', err)
      return null
    }
  }, [])

  const createConversation = useCallback(async (userId: string, freelancerId: string): Promise<ConversationResult> => {
    try {
      const result = await (supabase.rpc as any)('check_or_create_conversation', {
        user_id: userId,
        freelancer_id: freelancerId
      }) as ConversationResult

      return result
    } catch (err) {
      console.error('Error creating conversation:', err)
      return { success: false, error: 'Failed to create conversation' }
    }
  }, [])

  const handleConversationCreation = useCallback(async (): Promise<void> => {
    if (!user?.id) {
      console.error('User ID not available for conversation creation')
      return
    }

    const freelancerId = await getFreelancerId(freelancerUsername)
    if (!freelancerId) {
      console.error('Freelancer ID not found')
      return
    }

    const result = await createConversation(user.id, freelancerId)
    
    if (result.success && result.conversation_id) {
      window.location.href = `/messages/${result.conversation_id}`
    } else {
      console.error('Failed to create conversation:', result.error)
      onAuthSuccess()
    }
  }, [user?.id, freelancerUsername, getFreelancerId, createConversation, onAuthSuccess])

  const handleAuthSuccess = useCallback(async () => {
    storeAuthIntent()
    
    if (autoCreateConversation) {
      await handleConversationCreation()
    } else {
      onAuthSuccess()
    }
  }, [storeAuthIntent, autoCreateConversation, handleConversationCreation, onAuthSuccess])

  const validateSignupData = useCallback((): string | null => {
    if (signupData.password !== signupData.confirmPassword) {
      return ERROR_MESSAGES.PASSWORD_MISMATCH
    }

    if (signupData.password.length < 6) {
      return ERROR_MESSAGES.PASSWORD_TOO_SHORT
    }

    if (signupData.fullName.trim().length < 2) {
      return 'Full name must be at least 2 characters'
    }

    return null
  }, [signupData])

  const formatAuthError = useCallback((error: AuthError): string => {
    const message = error.message.toLowerCase()
    
    if (message.includes('already registered') || message.includes('already exists')) {
      return ERROR_MESSAGES.EMAIL_EXISTS
    }
    
    if (message.includes('500') || message.includes('internal server error')) {
      return ERROR_MESSAGES.SERVER_ERROR
    }
    
    if (message.includes('invalid login credentials')) {
      return ERROR_MESSAGES.INVALID_CREDENTIALS
    }
    
    return error.message || ERROR_MESSAGES.GENERIC_ERROR
  }, [])

  const handleLogin = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()
    setLoading(true)

    try {
      const { error } = await signIn(loginData.email, loginData.password)
      
      if (error) {
        setError(formatAuthError(error))
      } else {
        console.log('Login successful')
        await handleAuthSuccess()
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(ERROR_MESSAGES.GENERIC_ERROR)
    } finally {
      setLoading(false)
    }
  }, [loginData, clearError, formatAuthError, handleAuthSuccess])

  const handleSignup = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearError()
    setLoading(true)

    const validationError = validateSignupData()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      const { data, error } = await signUpClient(
        signupData.email, 
        signupData.password, 
        signupData.fullName
      )
      
      if (error) {
        setError(formatAuthError(error))
      } else if (data.user) {
        console.log('Client account created successfully')
        
        if (data.user && !data.session) {
          setError(ERROR_MESSAGES.EMAIL_CONFIRMATION)
          setLoading(false)
          return
        }
        
        await handleAuthSuccess()
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError(ERROR_MESSAGES.GENERIC_ERROR)
    } finally {
      setLoading(false)
    }
  }, [signupData, clearError, validateSignupData, formatAuthError, handleAuthSuccess])

  const handleLoginInputChange = useCallback((field: keyof LoginFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLoginData(prev => ({ ...prev, [field]: e.target.value }))
    }, [])

  const handleSignupInputChange = useCallback((field: keyof SignupFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSignupData(prev => ({ ...prev, [field]: e.target.value }))
    }, [])

  const toggleAuthMode = useCallback((loginMode: boolean) => {
    setIsLogin(loginMode)
    clearError()
  }, [clearError])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0A0A0A] rounded-2xl w-full max-w-lg md:max-w-md border border-[#1A1A1A] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD700] rounded-xl flex items-center justify-center">
              {isLogin ? (
                <LogIn className="h-5 w-5 text-black" />
              ) : (
                <UserPlus className="h-5 w-5 text-black" />
              )}
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
            className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-[#A0A0A0]" />
          </button>
        </div>

        {/* Toggle */}
        <div className="flex border-b border-[#1A1A1A]">
          <button
            onClick={() => toggleAuthMode(true)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              isLogin 
                ? 'text-[#FFD700] border-b-2 border-[#FFD700]' 
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => toggleAuthMode(false)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              !isLogin 
                ? 'text-[#FFD700] border-b-2 border-[#FFD700]' 
                : 'text-[#A0A0A0] hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div 
              className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6"
              role="alert"
            >
              {error}
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
                  <input
                    id="login-email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginInputChange('email')}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
                  <input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={handleLoginInputChange('password')}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
                  <input
                    id="signup-name"
                    type="text"
                    value={signupData.fullName}
                    onChange={handleSignupInputChange('fullName')}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
                  <input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={handleSignupInputChange('email')}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                    placeholder="Enter your email"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
                  <input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={handleSignupInputChange('password')}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                    placeholder="Create a password (min. 6 characters)"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-white mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
                  <input
                    id="signup-confirm-password"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={handleSignupInputChange('confirmPassword')}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFD700] hover:bg-[#FFC700] text-black font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
