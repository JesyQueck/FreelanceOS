import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/globals.css'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ProtectedRoute, { FreelancerRoute, ClientRoute } from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ClientLoginPage from './pages/ClientLoginPage'
import ClientSignupPage from './pages/ClientSignupPage'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import ProfilePage from './pages/profile/ProfilePage'
import EditProfilePage from './pages/profile/EditProfilePage'
import ServicesPage from './pages/services/ServicesPage'
import RoleBasedMessages from './components/RoleBasedMessages'
import SettingsPage from './pages/dashboard/SettingsPage'
import ClientMessagesPage from './pages/messages/ClientMessagesPage'
import PublicFreelancerProfile from './pages/public/PublicFreelancerProfile'
import DiscoverFreelancers from './pages/public/DiscoverFreelancers'

function App() {
  return (
    <div className="antialiased bg-black text-white min-h-screen flex flex-col">
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/client-login" element={<ClientLoginPage />} />
              <Route path="/client-signup" element={<ClientSignupPage />} />
              <Route path="/freelancer/:username" element={<PublicFreelancerProfile />} />
              <Route path="/discover" element={<DiscoverFreelancers />} />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <RoleBasedMessages />
                </ProtectedRoute>
              } />
              <Route path="/messages/:conversationId" element={
                <ProtectedRoute>
                  <RoleBasedMessages />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <FreelancerRoute>
                  <DashboardLayout />
                </FreelancerRoute>
              }>
                <Route index element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/edit" element={<EditProfilePage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="messages" element={<RoleBasedMessages />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              
              {/* Client Dashboard - uses ClientMessagesPage as main interface */}
              <Route path="/client-dashboard" element={
                <ClientRoute>
                  <ClientMessagesPage />
                </ClientRoute>
              } />
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </div>
  )
}

export default App
