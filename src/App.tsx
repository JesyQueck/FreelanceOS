import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './styles/globals.css'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ProtectedRoute, { FreelancerRoute, ClientRoute } from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import ProfilePage from './pages/profile/ProfilePage'
import EditProfilePage from './pages/profile/EditProfilePage'
import ServicesPage from './pages/services/ServicesPage'
import RoleBasedMessages from './components/RoleBasedMessages'
import SettingsPage from './pages/dashboard/SettingsPage'
import PublicFreelancerProfile from './pages/public/PublicFreelancerProfile'
import ClientLayout from './pages/client/ClientLayout'
import ClientMessagesPageContent from './pages/client/ClientMessagesPage'
import DiscoverFreelancersContent from './pages/client/DiscoverFreelancers'

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
              <Route path="/freelancer/:username" element={<PublicFreelancerProfile />} />
              <Route path="/discover" element={<Navigate to="/client-dashboard/discover" replace />} />
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
              
              {/* Client Dashboard - uses ClientLayout */}
              <Route path="/client-dashboard" element={
                <ClientRoute>
                  <ClientLayout />
                </ClientRoute>
              }>
                <Route index element={<ClientMessagesPageContent />} />
                <Route path="messages" element={<ClientMessagesPageContent />} />
                <Route path="discover" element={<DiscoverFreelancersContent />} />
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </div>
  )
}

export default App
