import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, Clock, DollarSign, Phone, Globe, Instagram, ArrowLeft } from 'lucide-react'
import { LoadingSpinner } from '../components/UXComponents'
import { artistsAPI } from '../services/api'

export const ArtistProfile = () => {
  const { id } = useParams()
  const [artist, setArtist] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchArtistProfile()
  }, [id])

  const fetchArtistProfile = async () => {
    try {
      setLoading(true)
      const response = await artistsAPI.getById(id)
      
      if (response.data.success) {
        setArtist(response.data.data.artist)
        setReviews(response.data.data.reviews || [])
      } else {
        throw new Error(response.data.error || 'Failed to fetch artist')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch artist')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading artist profile..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Artist Not Found</h1>
          <p className="text-gray-600 mb-6">The artist you're looking for doesn't exist.</p>
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
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
          
          <div className="flex items-start space-x-6">
            {/* Artist Avatar */}
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {artist.user.firstName[0]}{artist.user.lastName[0]}
              </span>
            </div>
            
            {/* Artist Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {artist.user.firstName} {artist.user.lastName}
              </h1>
              <p className="text-xl text-gray-600 mb-4">{artist.studioName}</p>
              
              {/* Rating and Location */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-current mr-1" />
                  <span>{artist.averageRating || 'New'} ({artist.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{artist.city}, {artist.state}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>${artist.hourlyRate}/hr</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Bio */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {artist.bio || "No bio available for this artist."}
              </p>
            </div>

            {/* Specialties */}
            {artist.specialties && artist.specialties.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {artist.specialties.map((specialty) => (
                    <span
                      key={specialty.id}
                      className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                    >
                      {specialty.icon} {specialty.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {artist.services && artist.services.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Services</h2>
                <div className="space-y-3">
                  {artist.services.map((service) => (
                    <div key={service.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-gray-600">{service.description}</p>
                        )}
                      </div>
                      {service.price && (
                        <span className="text-primary-600 font-semibold">${service.price}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {review.author.firstName[0]}{review.author.lastName[0]}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {review.author.firstName} {review.author.lastName}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.title && (
                        <h3 className="font-medium text-gray-900 mb-1">{review.title}</h3>
                      )}
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No reviews yet. Be the first to leave a review!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {artist.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{artist.phone}</span>
                  </div>
                )}
                {artist.website && (
                  <a
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    <span>Visit Website</span>
                  </a>
                )}
                {artist.instagram && (
                  <a
                    href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <Instagram className="w-4 h-4 mr-2" />
                    <span>{artist.instagram}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hourly Rate:</span>
                  <span className="font-semibold">${artist.hourlyRate}/hr</span>
                </div>
                {artist.minPrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Price:</span>
                    <span className="font-semibold">${artist.minPrice}</span>
                  </div>
                )}
                {artist.maxPrice && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Up to:</span>
                    <span className="font-semibold">${artist.maxPrice}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
              <div className="space-y-2 text-gray-600">
                {artist.address && <p>{artist.address}</p>}
                <p>{artist.city}, {artist.state} {artist.zipCode}</p>
                <p>{artist.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 