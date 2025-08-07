import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, DollarSign, Eye, Heart, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { favoritesAPI } from '../services/api'
import { LoadingSpinner } from '../components/UXComponents'
import { FavoriteButton } from '../components/FavoriteButton'
import toast from 'react-hot-toast'

export const Favorites = () => {
  const { user, isAuthenticated } = useAuth()
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
    } catch (error) {
      console.error('Error fetching favorites:', error)
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        // Authentication error - redirect to login
        setError('Please log in to view your favorites')
      } else {
        const errorMessage = error.response?.data?.error || 'Failed to load your favorite artists'
        setError(errorMessage)
        toast.error('Failed to load favorites')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteRemoved = (artistId) => {
    setFavorites(prev => prev.filter(fav => fav.artistId !== artistId))
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
              <div key={favorite.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Header Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
                  {favorite.artist.isFeatured && (
                    <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Featured
                    </div>
                  )}
                  {favorite.artist.isVerified && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-6xl font-bold opacity-20">
                      {favorite.artist.user.firstName[0]}{favorite.artist.user.lastName[0]}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Artist Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {favorite.artist.user.firstName} {favorite.artist.user.lastName}
                      </h3>
                      <p className="text-primary-600 font-semibold">{favorite.artist.studioName}</p>
                    </div>
                    <FavoriteButton 
                      artistId={favorite.artist.id} 
                      onFavoriteRemoved={() => handleFavoriteRemoved(favorite.artist.id)}
                    />
                  </div>

                  {/* Rating and Location */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-semibold text-gray-900">{favorite.artist.averageRating}</span>
                      <span className="text-gray-500">({favorite.artist.reviewCount})</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <MapPin className="w-4 h-4" />
                      <span>{favorite.artist.city}, {favorite.artist.state}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-4">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-semibold text-gray-900">${favorite.artist.hourlyRate}</span>
                    <span className="text-gray-500">/hour</span>
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {favorite.artist.specialties?.slice(0, 3).map((specialty) => (
                      <span
                        key={specialty.id}
                        className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full font-medium"
                      >
                        {specialty.name}
                      </span>
                    ))}
                    {favorite.artist.specialties?.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                        +{favorite.artist.specialties.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 mb-6 line-clamp-2">
                    {favorite.artist.bio}
                  </p>

                  {/* Portfolio Count */}
                  <div className="flex items-center space-x-2 mb-6 text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span>{favorite.artist._count.flash} portfolio pieces</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Link
                      to={`/artists/${favorite.artist.id}`}
                      className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 transition-colors text-center font-semibold"
                    >
                      View Profile
                    </Link>
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