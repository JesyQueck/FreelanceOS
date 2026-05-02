import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, ArrowLeft } from 'lucide-react'
import { validateClientAccess } from '../utils/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function ClientLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  // Redirect if already logged in
  if (user) {
    navigate('/messages')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await validateClientAccess(formData.email, formData.password)
      
      if (!result.success) {
        setError(result.error || 'Login failed')
      } else {
        // Handle post-login redirect
        const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin')
        const intendedAction = sessionStorage.getItem('intendedAction')
        
        if (redirectAfterLogin) {
          // Clear the stored redirect info
          sessionStorage.removeItem('redirectAfterLogin')
          sessionStorage.removeItem('intendedAction')
          
          // Navigate to intended destination
          if (intendedAction === 'message' && redirectAfterLogin.startsWith('/freelancer/')) {
            // Extract freelancer username from the URL
            const freelancerUsername = redirectAfterLogin.replace('/freelancer/', '')
            
            // Get freelancer profile and create conversation immediately
            const createConversationAndRedirect = async () => {
              try {
                const { getPublicUserProfile, checkOrCreateConversation } = await import('../utils/supabase');
                const profile = await getPublicUserProfile(freelancerUsername);
                
                if (profile) {
                  const result = await checkOrCreateConversation(user!.id, profile.id!);
                  if (result.success && result.conversationId) {
                    // Navigate directly to the conversation
                    navigate(`/messages/${result.conversationId}`);
                  } else {
                    // Fallback to messages page if conversation creation fails
                    navigate('/messages');
                  }
                } else {
                  // Fallback to messages page if profile not found
                  navigate('/messages');
                }
              } catch (error) {
                console.error('Error creating conversation:', error);
                // Fallback to messages page
                navigate('/messages');
              }
            };
            
            createConversationAndRedirect();
          } else {
            navigate(redirectAfterLogin)
          }
        } else {
          // Default redirect to messages for clients
          navigate('/messages')
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6">
          <Link to="/discover" className="inline-flex items-center gap-2 text-[#A0A0A0] hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Discover
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-[#1A1A1A]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFD700] rounded-2xl mb-4">
              <LogIn className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Client Sign In</h1>
            <p className="text-[#A0A0A0]">Access your client dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#A0A0A0]" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:border-transparent"
                  placeholder="Enter your password"
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

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-[#A0A0A0]">
              Don't have an account?{' '}
              <Link to="/client-signup" className="text-[#FFD700] hover:text-[#FFC700] font-medium">
                Sign Up
              </Link>
            </p>
            <p className="text-[#A0A0A0] mt-2">
              Are you a freelancer?{' '}
              <Link to="/login" className="text-[#FFD700] hover:text-[#FFC700] font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
