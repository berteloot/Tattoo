import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ErrorBoundary } from './components/UXComponents'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Artists } from './pages/Artists'
import { ArtistProfile } from './pages/ArtistProfile'
import { ArtistDashboard } from './pages/ArtistDashboard'
import { FlashGallery } from './pages/FlashGallery'
import { UserProfile } from './pages/UserProfile'
import EmailVerification from './pages/EmailVerification'
import AdminUserManagement from './pages/AdminUserManagement'
import AdminDashboard from './pages/AdminDashboard'
import AdminArtistVerification from './pages/AdminArtistVerification'
import AdminReviewModeration from './pages/AdminReviewModeration'
import AdminAuditLog from './pages/AdminAuditLog'
import AdminStudioUpload from './pages/AdminStudioUpload'
import AdminStudioManagement from './pages/AdminStudioManagement'
import AdminContent from './pages/AdminContent'
import { Favorites } from './pages/Favorites'
import Studios from './pages/Studios'
import StudioDetail from './pages/StudioDetail'

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/artists/:id" element={<ArtistProfile />} />
              <Route path="/flash" element={<FlashGallery />} />
              <Route path="/studios" element={<Studios />} />
              <Route path="/studios/:id" element={<StudioDetail />} />
              
              {/* Protected routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />
              <Route path="/favorites" element={
                <ProtectedRoute requiredRole="CLIENT">
                  <Favorites />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRole="ARTIST">
                  <ArtistDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminUserManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/artists/pending" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminArtistVerification />
                </ProtectedRoute>
              } />
              <Route path="/admin/reviews" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminReviewModeration />
                </ProtectedRoute>
              } />
              <Route path="/admin/actions" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminAuditLog />
                </ProtectedRoute>
              } />
              <Route path="/admin/studios/upload" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminStudioUpload />
                </ProtectedRoute>
              } />
              <Route path="/admin/studios" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminStudioManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/content" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminContent />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App 