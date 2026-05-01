import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/globals.css'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ProtectedRoute from './components/ProtectedRoute'
import MobileBottomNav from './components/MobileBottomNav'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import ProfilePage from './pages/profile/ProfilePage'
import EditProfilePage from './pages/profile/EditProfilePage'
import ServicesPage from './pages/services/ServicesPage'
import MessagesPage from './pages/messages/MessagesPage'
import SettingsPage from './pages/dashboard/SettingsPage'
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
              <Route path="/freelancer/:username" element={<PublicFreelancerProfile />} />
              <Route path="/discover" element={<DiscoverFreelancers />} />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } />
              <Route path="/messages/:conversationId" element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="profile/edit" element={<EditProfilePage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
            <MobileBottomNav />
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </div>
  )
}

export default App
