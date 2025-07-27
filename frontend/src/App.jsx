import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ArtistProfile } from './pages/ArtistProfile'
import { ArtistDashboard } from './pages/ArtistDashboard'
import { FlashGallery } from './pages/FlashGallery'
import { UserProfile } from './pages/UserProfile'

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/artists/:id" element={<ArtistProfile />} />
          <Route path="/flash" element={<FlashGallery />} />
          
          {/* Protected routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole="ARTIST">
              <ArtistDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App 