import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Phone, 
  Globe, 
  Instagram, 
  ArrowLeft, 
  Mail, 
  Facebook, 
  Twitter, 
  Youtube, 
  Linkedin, 
  ExternalLink,
  Calendar,
  MessageCircle,
  Plus
} from 'lucide-react'
import { LoadingSpinner } from '../components/UXComponents'
import { CalendlyWidget } from '../components/CalendlyWidget'
import { ReviewForm } from '../components/ReviewForm'
import { FavoriteButton } from '../components/FavoriteButton'
import { artistsAPI, api } from '../services/api'
import { apiCallWithFallback, checkApiHealth } from '../utils/apiHealth'

export const ArtistProfile = () => {
  const { id } = useParams()
  const [artist, setArtist] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    // Check API health first
    checkApiHealth().then(() => {
      fetchArtistProfile()
      // Track page view when profile is loaded
      trackProfileView()
    })
  }, [id])

  const trackProfileView = async () => {
    try {
      // Track the profile view
      await api.post(`/artists/${id}/view`)
      console.log('📊 Profile view tracked successfully')
    } catch (error) {
      console.error('Failed to track profile view:', error)
      // Don't show error to user, just log it
    }
  }

  const getDummyArtist = (artistId) => ({
    id: artistId,
    user: { firstName: 'Demo', lastName: 'Artist' },
    studioName: 'Demo Studio',
    bio: 'This is a demo artist profile. The real artist data is not available.',
    city: 'Montreal',
    state: 'Quebec',
    hourlyRate: 120,
    averageRating: 4.5,
    reviewCount: 10,
    specialties: [{ name: 'Traditional' }, { name: 'Japanese' }],
    services: [{ name: 'Custom Design', price: 150 }],
    isVerified: true,
    featured: false
  })

  const fetchArtistProfile = async () => {
    try {
      setLoading(true)
      console.log('Fetching artist profile for ID:', id)
      
      const result = await apiCallWithFallback(
        () => artistsAPI.getById(id),
        { artist: getDummyArtist(id), reviews: [] }
      )
      
      if (result.isFallback) {
        console.log('Using fallback artist profile data')
        setArtist(result.data.artist)
        setReviews(result.data.reviews)
      } else {
        console.log('Using API artist profile data')
        setArtist(result.data.data.artist)
        setReviews(result.data.data.reviews || [])
      }
    } catch (err) {
      console.error('Unexpected error in fetchArtistProfile:', err)
      setError('Failed to fetch artist profile')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewSubmitted = (newReview) => {
    setReviews(prev => [newReview, ...prev])
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
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {artist.user.firstName} {artist.user.lastName}
                </h1>
                <FavoriteButton artistId={artist.id} size="w-8 h-8" />
              </div>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="inline-flex items-center px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Leave Review
                </button>
              </div>
              {(reviews || []).length > 0 ? (
                <div className="space-y-4">
                  {(reviews || []).map((review) => (
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
            {/* Enhanced Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-primary-600" />
                Contact Information
              </h2>
              
              <div className="space-y-4">
                {/* Phone */}
                {artist.user.phone && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <Phone className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <a 
                        href={`tel:${artist.user.phone}`}
                        className="text-gray-900 font-medium hover:text-primary-600 transition-colors"
                      >
                        {artist.user.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email */}
                {artist.user.email && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <Mail className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <a 
                        href={`mailto:${artist.user.email}`}
                        className="text-gray-900 font-medium hover:text-primary-600 transition-colors truncate block"
                      >
                        {artist.user.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Website */}
                {artist.website && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <Globe className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">Website</p>
                      <a
                        href={artist.website.startsWith('http') ? artist.website : `https://${artist.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium hover:text-primary-600 transition-colors truncate block flex items-center"
                      >
                        {artist.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Instagram */}
                {artist.instagram && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-3">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">Instagram</p>
                      <a
                        href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium hover:text-primary-600 transition-colors truncate block flex items-center"
                      >
                        {artist.instagram}
                        <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Facebook */}
                {artist.facebook && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <Facebook className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">Facebook</p>
                      <a
                        href={artist.facebook.startsWith('http') ? artist.facebook : `https://facebook.com/${artist.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium hover:text-primary-600 transition-colors truncate block flex items-center"
                      >
                        {artist.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, '')}
                        <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Twitter/X */}
                {artist.twitter && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-black rounded-full flex items-center justify-center mr-3">
                      <Twitter className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">Twitter/X</p>
                      <a
                        href={`https://twitter.com/${artist.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium hover:text-primary-600 transition-colors truncate block flex items-center"
                      >
                        {artist.twitter}
                        <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* YouTube */}
                {artist.youtube && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mr-3">
                      <Youtube className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">YouTube</p>
                      <a
                        href={artist.youtube.startsWith('http') ? artist.youtube : `https://youtube.com/${artist.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium hover:text-primary-600 transition-colors truncate block flex items-center"
                      >
                        {artist.youtube.replace(/^https?:\/\/(www\.)?youtube\.com\//, '')}
                        <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* LinkedIn */}
                {artist.linkedin && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center mr-3">
                      <Linkedin className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">LinkedIn</p>
                      <a
                        href={artist.linkedin.startsWith('http') ? artist.linkedin : `https://linkedin.com/in/${artist.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium hover:text-primary-600 transition-colors truncate block flex items-center"
                      >
                        {artist.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/(in\/)?/, '')}
                        <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Calendly Booking */}
                {artist.calendlyUrl && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">Book Appointment</p>
                      <a
                        href={artist.calendlyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium hover:text-primary-600 transition-colors truncate block flex items-center"
                      >
                        Schedule Consultation
                        <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* No contact info message */}
                {!artist.user.phone && !artist.user.email && !artist.website && !artist.instagram && 
                 !artist.facebook && !artist.twitter && !artist.youtube && !artist.linkedin && !artist.calendlyUrl && (
                  <div className="text-center py-6">
                    <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No contact information available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
                Pricing
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Hourly Rate:</span>
                  <span className="font-semibold text-gray-900">${artist.hourlyRate}/hr</span>
                </div>
                {artist.minPrice && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Starting Price:</span>
                    <span className="font-semibold text-gray-900">${artist.minPrice}</span>
                  </div>
                )}
                {artist.maxPrice && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Up to:</span>
                    <span className="font-semibold text-gray-900">${artist.maxPrice}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                Location
              </h2>
              <div className="space-y-2 text-gray-600">
                {artist.address && <p className="font-medium">{artist.address}</p>}
                <p>{artist.city}, {artist.state} {artist.zipCode}</p>
                {artist.country && <p>{artist.country}</p>}
              </div>
            </div>

            {/* Calendly Widget */}
            <CalendlyWidget 
              calendlyUrl={artist.calendlyUrl}
              artistName={`${artist.user.firstName} ${artist.user.lastName}`}
            />
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          artist={artist}
          onClose={() => setShowReviewForm(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  )
} 