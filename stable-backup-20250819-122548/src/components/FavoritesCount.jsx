import { useState, useEffect } from 'react'
import { Heart, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { favoritesAPI } from '../services/api'

export const FavoritesCount = ({ className = '' }) => {
  const { user, isAuthenticated } = useAuth()
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated && user?.role === 'CLIENT') {
      fetchFavoritesCount()
    } else {
      setFavoritesCount(0)
      setError(null)
    }
  }, [isAuthenticated, user])

  const fetchFavoritesCount = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await favoritesAPI.getAll()
      const favorites = response.data.data.favorites || []
      setFavoritesCount(favorites.length)
    } catch (error) {
      console.error('Error fetching favorites count:', error)
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        // Authentication error - don't show error tooltip, just set count to 0
        setError(null)
        setFavoritesCount(0)
      } else {
        setError('Failed to load favorites')
        setFavoritesCount(0)
      }
    } finally {
      setLoading(false)
    }
  }

  // Don't show for non-clients
  if (!isAuthenticated || user?.role !== 'CLIENT') {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center space-x-2">
        <Heart className="h-4 w-4" />
        <span>Favorites</span>
        {!loading && !error && favoritesCount > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
            {favoritesCount}
          </span>
        )}
      </div>
      
      {/* Error Tooltip */}
      {error && (
        <div className="absolute top-full left-0 mt-2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50">
          <div className="flex items-center space-x-1">
            <X className="h-3 w-3 text-red-400" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  )
} 