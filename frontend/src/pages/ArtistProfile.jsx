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
  Share2
} from 'lucide-react'
import { LoadingSpinner } from '../components/UXComponents'
import { CalendlyWidget } from '../components/CalendlyWidget'
import { ReviewForm } from '../components/ReviewForm'
import { FavoriteButton } from '../components/FavoriteButton'
import { ContactEmailModal } from '../components/ContactEmailModal'
import { ImageModal } from '../components/ImageModal'
import { artistsAPI, api } from '../services/api'
import { apiCallWithFallback, checkApiHealth } from '../utils/apiHealth'
import ProtectedEmail from '../components/ProtectedEmail'
import { ArtistMessages } from '../components/ArtistMessage'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import SignupPromptModal from '../components/SignupPromptModal'

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
  const [showSignupPrompt, setShowSignupPrompt] = useState(false)
  const [signupPromptType, setSignupPromptType] = useState('contact')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

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
                <>
                  {isAuthenticated ? (
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
                      onClick={() => {
                        setSignupPromptType('calendly');
                        setShowSignupPrompt(true);
                      }}
                      className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Consultation
                    </button>
                  )}
                </>
              ) : (
                <>
                  {isAuthenticated ? (
                    <button 
                      onClick={() => setShowContactModal(true)}
                      className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Artist
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setSignupPromptType('contact');
                        setShowSignupPrompt(true);
                      }}
                      className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Artist
                    </button>
                  )}
                </>
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

      {/* Studio Information - Moved to top for better visibility */}
      {studios && studios.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6">
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
                      className="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      {specialty.icon} {specialty.name}
                    </span>
                  ))}
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
                <div className="space-y-6">
                  {(reviews || []).map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200">
                      {/* Review Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          {/* Reviewer Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-sm font-bold text-white">
                              {review.author.firstName[0]}{review.author.lastName[0]}
                            </span>
                          </div>
                          
                          {/* Reviewer Info */}
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              {review.author.firstName} {review.author.lastName}
                            </h4>
                            <div className="flex items-center space-x-3">
                              {/* Rating Stars */}
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-5 h-5 ${
                                      i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              
                              {/* Rating Number */}
                              <span className="text-lg font-bold text-gray-900">
                                {review.rating}.0
                              </span>
                              
                              {/* Review Date */}
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Verified Badge (if applicable) */}
                        {review.author.role === 'ARTIST' && (
                          <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium">Artist</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Review Content */}
                      <div className="space-y-4">
                        {/* Review Title */}
                        {review.title && (
                          <h3 className="text-xl font-bold text-gray-900 leading-tight">
                            "{review.title}"
                          </h3>
                        )}
                        
                        {/* Review Comment */}
                        {review.comment && (
                          <p className="text-gray-700 text-lg leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                        
                        {/* Review Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="pt-2">
                            <div className="flex flex-wrap gap-3">
                              {review.images.map((image, imageIndex) => (
                                <div
                                  key={imageIndex}
                                  className="relative group cursor-pointer transform hover:scale-105 transition-all duration-200"
                                  onClick={() => {
                                    setSelectedImage(image)
                                    setIsImageModalOpen(true)
                                  }}
                                >
                                  <img
                                    src={image}
                                    alt={`Review image ${imageIndex + 1}`}
                                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors shadow-md"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-3 italic">
                              💡 Click on any image to view full size
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-600 mb-4">
                    Be the first to share your experience with this artist!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                Contact Information
              </h2>
              
              <div className="space-y-6">
                {/* Phone */}
                {artist.user.phone && (
                  <>
                    {isAuthenticated ? (
                      <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Phone className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">Phone</h3>
                        <p className="text-xs text-gray-600 mb-3">Call {artist.user.firstName} directly</p>
                        <a 
                          href={`tel:${artist.user.phone}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {artist.user.phone}
                        </a>
                      </div>
                    ) : (
                      <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Phone className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-blue-900 mb-1">Phone</h3>
                        <p className="text-xs text-blue-700 mb-3">Phone number available</p>
                        <Link 
                          to="/login" 
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Login to view
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {/* Email */}
                {artist.user.email && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-xs text-gray-600 mb-3">Contact via message</p>
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                      title="Send message"
                    >
                      Message
                    </button>
                  </div>
                )}

                {/* Website */}
                {artist.website && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Globe className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Website</h3>
                    <p className="text-xs text-gray-600 mb-3">Visit online portfolio</p>
                    {isAuthenticated ? (
                      <a
                        href={artist.website.startsWith('http') ? artist.website : `https://${artist.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {artist.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          setSignupPromptType('website');
                          setShowSignupPrompt(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View website
                      </button>
                    )}
                  </div>
                )}

                {/* Instagram */}
                {artist.instagram && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Instagram className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Instagram</h3>
                    <p className="text-xs text-gray-600 mb-3">Follow on social media</p>
                    {isAuthenticated ? (
                      <a
                        href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {artist.instagram}
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          setSignupPromptType('social');
                          setShowSignupPrompt(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View profile
                      </button>
                    )}
                  </div>
                )}

                {/* Other Social Media */}
                {artist.facebook && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Facebook className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Facebook</h3>
                    <p className="text-xs text-gray-600 mb-3">Connect on Facebook</p>
                    {isAuthenticated ? (
                      <a
                        href={artist.facebook.startsWith('http') ? artist.facebook : `https://facebook.com/${artist.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {artist.facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, '')}
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          setSignupPromptType('social');
                          setShowSignupPrompt(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View profile
                      </button>
                    )}
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
                        <button 
                          onClick={() => {
                            setSignupPromptType('calendly');
                            setShowSignupPrompt(true);
                          }}
                          className="text-green-600 hover:text-green-800 font-medium text-sm px-3 py-1 rounded-md border border-green-300 hover:bg-green-100 transition-colors flex-shrink-0 ml-2"
                        >
                          Sign up to book
                        </button>
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

            {/* Services & Pricing */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                Services & Pricing
              </h2>
              
              {/* General Pricing */}
              <div className="space-y-3 mb-6 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Hourly Rate:</span>
                  <span className="font-semibold text-gray-900">${artist.hourlyRate}/hr</span>
                </div>
                {artist.minPrice && (
                  <div className="flex justify-between items-center py-2">
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

                {/* Individual Services */}
                {artist?.artistServices && Array.isArray(artist.artistServices) && artist.artistServices.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Available Services</h3>

                    <div className="space-y-3">
                      {Array.isArray(artist.artistServices) && artist.artistServices.map((artistService) => {
                        if (!artistService?.service?.id) return null;
                        
                        const service = artistService.service;
                        const customPrice = artistService.customPrice;
                        const customDuration = artistService.customDuration;
                        
                        return (
                          <div key={artistService.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-sm mb-1">
                                  {service.name}
                                </h4>
                                {service.description && (
                                  <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 text-gray-600">
                                <DollarSign className="w-3 h-3" />
                                <span className="font-medium text-gray-900">
                                  {customPrice !== null ? (customPrice === 0 ? 'Free' : `$${customPrice}`) : `$${service.price || 'N/A'}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-3 h-3" />
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
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-100 border border-gray-300 rounded"></div>
                          Standard pricing
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Services Message */}
                {(!artist?.artistServices || !Array.isArray(artist.artistServices) || artist.artistServices.length === 0) && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No services available at the moment.</p>
                  </div>
                )}
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

      {/* Signup Prompt Modal */}
      <SignupPromptModal
        isOpen={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        featureType={signupPromptType}
      />

      {/* Image Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        imageUrl={selectedImage}
        onClose={() => {
          setIsImageModalOpen(false)
          setSelectedImage(null)
        }}
      />
    </div>
  )
} 