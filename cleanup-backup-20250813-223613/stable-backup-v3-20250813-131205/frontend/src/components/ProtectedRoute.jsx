import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated, isArtist, isAdmin } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role permissions
  if (requiredRole) {
    let hasPermission = false
    
    switch (requiredRole) {
      case 'ARTIST':
        hasPermission = isArtist
        break
      case 'ADMIN':
        hasPermission = isAdmin
        break
      case 'CLIENT':
        hasPermission = user.role === 'CLIENT'
        break
      default:
        hasPermission = user.role === requiredRole
    }
    
    if (!hasPermission) {
      return <Navigate to="/" replace />
    }
  }

  return children
} 