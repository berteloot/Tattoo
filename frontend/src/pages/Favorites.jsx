import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, DollarSign, Eye, Heart, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { favoritesAPI } from '../services/api'
import { LoadingSpinner } from '../components/UXComponents'
import { FavoriteButton } from '../components/FavoriteButton'

export const Favorites = () => {
  const { user, isAuthenticated } = useAuth()
  const { error: showError } = useToast()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated && user?.role === 'CLIENT') {
      fetchFavorites()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await favoritesAPI.getAll()
      setFavorites(response.data.data.favorites)
    } catch (err) {
      console.error('Error fetching favorites:', err)
      
      // Handle different types of errors
      if (err.response?.status === 401) {
        // Authentication error - redirect to login
        setError('Please log in to view your favorites')
      } else {
        const errorMessage = err.response?.data?.error || 'Failed to load your favorite artists'
        setError(errorMessage)
        showError('Error', 'Failed to load favorites')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteRemoved = (artistId) => {
    setFavorites(prev => prev.filter(fav => fav.artistId !== artistId))
  }

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await favoritesAPI.remove(favoriteId)
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId))
    } catch (err) {
      console.error('Error removing favorite:', err)
      showError('Error', 'Failed to remove favorite')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view your favorite artists.</p>
          <Link 
            to="/login" 
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    )
  }

  if (user?.role !== 'CLIENT') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Only clients can favorite artists.</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your favorites..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchFavorites}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Artists
          </Link>
          
          <div className="flex items-center space-x-4">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Favorite Artists</h1>
              <p className="text-gray-600">
                {favorites.length === 0 
                  ? "You haven't favorited any artists yet" 
                  : `${favorites.length} favorite artist${favorites.length === 1 ? '' : 's'}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring artists and click the heart icon to add them to your favorites!
            </p>
            <Link 
              to="/artists" 
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Browse Artists
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="bg-white border-2 border-black overflow-hidden hover:shadow-xl transition-shadow group">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  {favorite.artist?.profilePictureUrl ? (
                    <img
                      src={favorite.artist.profilePictureUrl}
                      alt={`${favorite.artist.user?.firstName || 'Artist'} ${favorite.artist.user?.lastName || ''}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                      <span className="text-white font-bold text-4xl">
                        {favorite.artist?.user?.firstName?.[0] || 'A'}{favorite.artist?.user?.lastName?.[0] || 'A'}
                      </span>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{favorite.views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">{favorite.likes || 0} likes</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Style Badge */}
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {favorite.style || 'Flash'}
                  </div>
                </div>

                <div className="p-6">
                  {/* Title and Artist */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">{favorite.title}</h3>
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{favorite.artist?.studioName || 'Studio'}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {favorite.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{favorite.description}</p>
                  )}

                  {/* Tags */}
                  {favorite.tags && favorite.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {favorite.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {favorite.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{favorite.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Artist Info and Price */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {favorite.artist?.user?.firstName?.[0] || 'A'}{favorite.artist?.user?.lastName?.[0] || 'A'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">
                            <Link
                              to={`/artists/${favorite.artist?.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                              title={`View ${favorite.artist?.user?.firstName || 'Artist'} ${favorite.artist?.user?.lastName || ''}'s profile`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {favorite.artist?.user?.firstName || 'Artist'} {favorite.artist?.user?.lastName || ''}
                            </Link>
                          </p>
                          <p className="text-sm text-gray-500 truncate">{favorite.artist?.city || 'Location'}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-xl font-bold text-gray-900">{favorite.price || 'Contact'}</p>
                        <p className="text-xs text-gray-500 whitespace-nowrap">Ready to ink</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Link
                        to={`/artists/${favorite.artist?.id}`}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold text-sm"
                      >
                        Book Artist
                      </Link>
                      <button
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        className="bg-red-100 text-red-700 py-3 px-4 rounded-lg hover:bg-red-200 transition-colors flex-shrink-0"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 