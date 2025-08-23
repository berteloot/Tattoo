import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
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
  Plus,
  Share2,
  Eye,
  Heart,
  CheckCircle,
  Award
} from 'lucide-react'
import { LoadingSpinner } from '../components/UXComponents'
import { CalendlyWidget } from '../components/CalendlyWidget'
import { ReviewForm } from '../components/ReviewForm'
import { FavoriteButton } from '../components/FavoriteButton'
import { ContactEmailModal } from '../components/ContactEmailModal'
import { artistsAPI, api } from '../services/api'
import { apiCallWithFallback, checkApiHealth } from '../utils/apiHealth'
import ProtectedEmail from '../components/ProtectedEmail'
import { ArtistMessages } from '../components/ArtistMessage'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export const ArtistProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { success: showSuccessToast, error: showErrorToast } = useToast()
  const [artist, setArtist] = useState(null)
  const [reviews, setReviews] = useState([])
  const [studios, setStudios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [allServices, setAllServices] = useState([])
  const [artistServices, setArtistServices] = useState([])

  // Helper function for fallback data - moved to top to fix hoisting issue
  const getDummyArtist = (id) => ({
    id,
    user: {
      id: 'dummy',
      firstName: 'Sample',
      lastName: 'Artist',
      email: 'sample@example.com',
      phone: '+1 (555) 123-4567'
    },
    bio: 'This is a sample artist profile. The actual data is being loaded.',
    studioName: 'Sample Studio',
    address: '123 Sample St',
    city: 'Sample City',
    state: 'Sample State',
    zipCode: '12345',
    country: 'Sample Country',
    hourlyRate: 100,
    minPrice: 80,
    maxPrice: 500,
    isVerified: true,
    isFeatured: false,
    flash: [],
    gallery: [],
    specialties: [],
    services: [],
    messages: [],
    _count: {
      flash: 0,
      gallery: 0
    }
  })

  useEffect(() => {
    // Check API health first
    checkApiHealth().then(() => {
      fetchArtistProfile()
      fetchServicesData()
      // Track page view when profile is loaded
      trackProfileView()
    })
  }, [id])

  const trackProfileView = async () => {
    try {
      // Track the profile view
      await api.post(`/artists/${id}/view`)
      console.log('Profile view tracked successfully')
    } catch (error) {
      console.error('Failed to track profile view:', error)
      // Don't show error to user, just log it
    }
  }

  const handleShareProfile = async () => {
    const profileUrl = window.location.href
    const shareData = {
      title: `${artist.user.firstName} ${artist.user.lastName} - Tattoo Artist`,
      text: `Check out ${artist.user.firstName}'s tattoo work at ${artist.studioName}`,
      url: profileUrl
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        showSuccessToast('Profile shared successfully!')
      } else {
        // Fallback to copying URL to clipboard
        await navigator.clipboard.writeText(profileUrl)
        showSuccessToast('Profile URL copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing profile:', error)
      // Fallback to copying URL to clipboard
      try {
        await navigator.clipboard.writeText(profileUrl)
        showSuccessToast('Share failed - please copy the URL manually')
      } catch (clipboardError) {
        console.error('Clipboard access failed:', clipboardError)
        showSuccessToast('Share failed - please copy the URL manually')
      }
    }
  }

  const fetchServicesData = async () => {
    try {
      const response = await api.get('/services')
      setAllServices(response.data.data || [])
      
      // Get artist's custom service pricing
      if (artist?.id) {
        const artistServicesResponse = await api.get(`/artists/${artist.id}/services`)
        setArtistServices(artistServicesResponse.data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    }
  }

  const getServicePrice = (serviceId) => {
    const artistService = artistServices.find(s => s.serviceId === serviceId)
    return artistService?.price ?? null
  }

  const getServiceDuration = (serviceId) => {
    const artistService = artistServices.find(s => s.serviceId === serviceId)
    return artistService?.duration ?? null
  }

  const fetchArtistProfile = async () => {
    try {
      setLoading(true)
      console.log('Fetching artist profile for ID:', id)
      
      const [artistResult, studiosResult] = await Promise.all([
        apiCallWithFallback(
          () => artistsAPI.getById(id),
          { artist: getDummyArtist(id), reviews: [] }
        ),
        artistsAPI.getStudios(id).catch(() => ({ data: { data: [] } }))
      ])
      
      if (artistResult.isFallback) {
        console.log('Using fallback artist profile data')
        setArtist(artistResult.data.artist)
        setReviews(artistResult.data.reviews)
      } else {
        console.log('Using API artist profile data')
        console.log('Artist data:', artistResult.data.data.artist)
        console.log('Flash items:', artistResult.data.data.artist?.flash)
        console.log('Flash count:', artistResult.data.data.artist?._count?.flash)
        console.log('Gallery items:', artistResult.data.data.artist?.gallery)
        console.log('Gallery count:', artistResult.data.data.artist?._count?.gallery)
        setArtist(artistResult.data.data.artist)
        setReviews(artistResult.data.data.reviews || [])
      }
      
      setStudios(studiosResult.data.data || [])
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Artist Not Found</h2>
          <p className="text-gray-600 mb-6">The artist profile you're looking for doesn't exist.</p>
          <Link
            to="/artists"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Browse Artists
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 hover:text-gray-900 transition-colors">Back to Artists</span>
            </Link>
            <div className="flex items-center space-x-4">
              <FavoriteButton artistId={artist.id} size="w-8 h-8" />
              <button
                onClick={handleShareProfile}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Profile Picture and Basic Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={artist.profilePictureUrl || `https://ui-avatars.com/api/?name=${artist.user.firstName}+${artist.user.lastName}&background=random&size=120`}
                  alt={`${artist.user.firstName} ${artist.user.lastName}`}
                  className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    {artist.user.firstName} {artist.user.lastName}
                  </h1>
                </div>
                
                {artist.studioName && (
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{artist.studioName}</span>
                  </div>
                )}
                
                {(artist.address || artist.city) && (
                  <div className="text-gray-500 text-sm">
                    {[artist.address, artist.city, artist.state, artist.zipCode, artist.country]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 ml-auto">
              {artist.calendlyUrl ? (
                <a
                  href={artist.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Consultation
                </a>
              ) : (
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Artist
                </button>
              )}
              
              {/* Dashboard Link for Artist Viewing Own Profile */}
              {isAuthenticated && user?.id === artist.user.id && (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Artist Messages */}
            {artist.messages && artist.messages.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Latest Updates from {artist.user.firstName}
                </h2>
                <ArtistMessages messages={artist.messages} variant="profile" />
              </div>
            )}

            {/* Bio */}
            {artist.bio && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{artist.bio}</p>
              </div>
            )}

            {/* Specialties */}
            {artist.specialties && artist.specialties.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Specialties</h2>
                <div className="flex flex-wrap gap-2">
                  {artist.specialties.map((specialty) => (
                    <span
                      key={specialty.id}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                    >
                      {specialty.icon} {specialty.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Services - Compact and Organized */}
            {Array.isArray(allServices) && allServices.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Services & Pricing</h2>
                
                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allServices.map((service) => {
                    if (!service?.id) return null;
                    
                    const customPrice = getServicePrice(service.id);
                    const customDuration = getServiceDuration(service.id);
                    const isSelected = artist?.services?.some(s => s?.id === service.id);
                    
                    // Show all services, but highlight selected ones
                    return (
                      <div key={service.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg mb-1">
                              {service.name}
                            </h3>
                            {service.description && (
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {service.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-2">
                            {customPrice !== null && (
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full border border-blue-200">
                                Custom
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full border border-green-200">
                                Available
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold text-gray-900">
                              {customPrice !== null ? (customPrice === 0 ? 'Free' : `${customPrice}`) : `${service.price || 'N/A'}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {customDuration !== null ? (customDuration === 0 ? 'Varies' : `${customDuration} min`) : `${service.duration || 'N/A'} min`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Services Legend */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                      Custom pricing available
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                      Service offered
                    </span>
                    <span className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                      Standard service
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Flash Items */}
            {artist.flash && artist.flash.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Flash Designs</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {artist.flash.map((flashItem) => (
                    <div 
                      key={flashItem.id} 
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => navigate(`/flash/${flashItem.id}`)}
                      title={`View ${flashItem.title} details`}
                    >
                      <div className="aspect-square overflow-hidden relative">
                        <img
                          src={flashItem.imageUrl}
                          alt={flashItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-medium text-sm">
                            Click to view details
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{flashItem.title}</h3>
                        {flashItem.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{flashItem.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-blue-600">
                            ${flashItem.basePrice}
                          </span>
                          {flashItem.tags && flashItem.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {flashItem.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tattoo Gallery */}
            {artist.gallery && artist.gallery.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tattoo Portfolio</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {artist.gallery.map((galleryItem) => (
                    <div 
                      key={galleryItem.id} 
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => navigate(`/gallery/${galleryItem.id}`)}
                      title={`View ${galleryItem.title} details`}
                    >
                      <div className="aspect-square overflow-hidden relative">
                        <img
                          src={galleryItem.thumbnailUrl || galleryItem.imageUrl}
                          alt={galleryItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-medium text-sm">
                            Click to view details
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{galleryItem.title}</h3>
                        {galleryItem.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{galleryItem.description}</p>
                        )}
                        <div className="space-y-2">
                          {galleryItem.tattooStyle && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Style:</span>
                              <span className="font-medium text-gray-700">{galleryItem.tattooStyle}</span>
                            </div>
                          )}
                          {galleryItem.bodyLocation && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Location:</span>
                              <span className="font-medium text-gray-700">{galleryItem.bodyLocation}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Studio Information */}
            {studios && studios.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Studio Information</h2>
                <div className="space-y-4">
                  {studios.map((studioArtist) => {
                    const studio = studioArtist.studio;
                    return (
                      <div key={studioArtist.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-gray-900">{studio.title}</h3>
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {studioArtist.role}
                              </span>
                            </div>
                            
                            {studio.address && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                <MapPin className="h-3 w-3" />
                                <span className="flex-1">
                                  {studio.address}
                                  {studio.city && `, ${studio.city}`}
                                  {studio.state && `, ${studio.state}`}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Joined {new Date(studioArtist.joinedAt).toLocaleDateString()}</span>
                              </div>
                              
                              {studio.isVerified && (
                                <span className="text-green-600 font-medium">✓ Verified</span>
                              )}
                              
                              {studio.isFeatured && (
                                <span className="text-blue-600 font-medium">★ Featured</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <Link
                            to={`/studios/${studio.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Studio Details →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
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
                                i < review.rating ? 'text-red-500 fill-current' : 'text-gray-300'
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
          <div className="xl:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                Contact Information
              </h2>
              
              <div className="space-y-4">
                {/* Phone */}
                {artist.user.phone && (
                  <>
                    {isAuthenticated ? (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Phone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-sm font-medium text-gray-500">Phone</p>
                          <a 
                            href={`tel:${artist.user.phone}`}
                            className="text-gray-900 font-medium hover:text-blue-600 transition-colors break-all"
                          >
                            {artist.user.phone}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center flex-1 min-w-0 overflow-hidden">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Phone className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-medium text-blue-900">Phone number available</p>
                            <p className="text-xs text-blue-700 break-words">Call {artist.user.firstName} directly</p>
                          </div>
                        </div>
                        <Link 
                          to="/login" 
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 rounded-md border border-blue-300 hover:bg-blue-100 transition-colors flex-shrink-0 ml-2"
                        >
                          Login to view
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {/* Email */}
                {artist.user.email && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <ProtectedEmail 
                        email={artist.user.email} 
                        showIcon={false}
                        className="text-gray-900 font-medium hover:text-blue-600 transition-colors break-all"
                        recipient={artist}
                        recipientType="artist"
                      />
                    </div>
                  </div>
                )}

                {/* Website */}
                {artist.website && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-medium text-gray-500">Website</p>
                      <a
                        href={artist.website.startsWith('http') ? artist.website : `https://${artist.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium hover:text-blue-600 transition-colors break-all block flex items-center"
                      >
                        <span className="truncate">{artist.website.replace(/^https?:\/\//, '')}</span>
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
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-medium text-gray-500">Instagram</p>
                      <a
                        href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium hover:text-blue-600 transition-colors break-all block flex items-center"
                      >
                        <span className="truncate">{artist.instagram}</span>
                        <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Other Social Media */}
                {artist.facebook && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                      <Facebook className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-medium text-gray-500">Facebook</p>
                      <a
                        href={artist.facebook.startsWith('http') ? artist.facebook : `https://facebook.com/${artist.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium hover:text-blue-600 transition-colors break-all block flex items-center"
                      >
                        <span className="truncate">{artist.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, '')}</span>
                        <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Calendly Booking */}
                {artist.calendlyUrl && (
                  <>
                    {isAuthenticated ? (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <p className="text-sm font-medium text-gray-500">Book Appointment</p>
                          <a
                            href={artist.calendlyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-900 font-medium hover:text-blue-600 transition-colors break-all block flex items-center"
                          >
                            <span className="truncate">Schedule Consultation</span>
                            <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center flex-1 min-w-0 overflow-hidden">
                          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <Calendar className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-medium text-green-900">Online booking available</p>
                            <p className="text-xs text-green-700 break-words">Schedule directly with {artist.user.firstName}</p>
                          </div>
                        </div>
                        <Link 
                          to="/register" 
                          className="text-green-600 hover:text-green-800 font-medium text-sm px-3 py-1 rounded-md border border-green-300 hover:bg-green-100 transition-colors flex-shrink-0 ml-2"
                        >
                          Sign up to book
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {/* No contact info message */}
                {!artist.user.phone && !artist.user.email && !artist.website && !artist.instagram && 
                 !artist.facebook && !artist.twitter && !artist.youtube && !artist.linkedin && !artist.pinterest && !artist.calendlyUrl && (
                  <div className="text-center py-6">
                    <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No contact information available</p>
                  </div>
                )}

                {/* Login to Contact CTA for non-authenticated users */}
                {!isAuthenticated && (artist.user.phone || artist.calendlyUrl) && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 text-center mt-4">
                    <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-medium text-blue-900 mb-1">Ready to get tattooed?</h3>
                    <p className="text-blue-700 text-sm mb-3">
                      Contact {artist.user.firstName} directly to discuss your next tattoo
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Link 
                        to="/register" 
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        Sign up to contact
                      </Link>
                      <Link 
                        to="/login" 
                        className="inline-flex items-center px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                      >
                        Login
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
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

      {/* Contact Email Modal */}
      <ContactEmailModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        recipient={artist}
        recipientType="artist"
        onSuccess={() => {
          showSuccessToast('Message sent successfully!', `Your message has been sent to ${artist.user.firstName}. They will get back to you soon.`)
        }}
      />
    </div>
  )
} 