import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { favoritesAPI } from '../services/api'
import toast from 'react-hot-toast'

export const FavoriteButton = ({ artistId, className = '', size = 'w-6 h-6', onFavoriteRemoved }) => {
  const { user, isAuthenticated } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if artist is favorited on component mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CLIENT') {
      checkFavoriteStatus()
    }
  }, [artistId, isAuthenticated, user])

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoritesAPI.check(artistId)
      setIsFavorited(response.data.data.isFavorited)
    } catch (error) {
      console.error('Error checking favorite status:', error)
      // Don't show error toast for this, just log it
    }
  }

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to favorite artists')
      return
    }

    if (user?.role !== 'CLIENT') {
      toast.error('Only clients can favorite artists')
      return
    }

    setIsLoading(true)

    try {
      if (isFavorited) {
        // Remove from favorites
        await favoritesAPI.remove(artistId)
        setIsFavorited(false)
        toast.success('Artist removed from favorites')
        // Call callback if provided
        if (onFavoriteRemoved) {
          onFavoriteRemoved(artistId)
        }
      } else {
        // Add to favorites
        await favoritesAPI.add(artistId)
        setIsFavorited(true)
        toast.success('Artist added to favorites')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      const errorMessage = error.response?.data?.error || 'Failed to update favorite'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Don't show button for non-clients
  if (isAuthenticated && user?.role !== 'CLIENT') {
    return null
  }

  return (
    <button
      onClick={handleFavoriteClick}
      disabled={isLoading}
      className={`transition-colors duration-200 ${
        isFavorited 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 hover:text-red-500'
      } ${className}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart 
        className={`${size} ${isFavorited ? 'fill-current' : ''}`}
        strokeWidth={isFavorited ? 0 : 2}
      />
    </button>
  )
} 