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
  Eye
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
      console.log('📊 Profile view tracked successfully')
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

  // Function to get custom pricing for a service
  const getServicePrice = (serviceId) => {
    if (!serviceId || !Array.isArray(artistServices)) return null;
    const artistService = artistServices.find(as => as?.serviceId === serviceId);
    return artistService?.customPrice ?? null;
  };

  const getServiceDuration = (serviceId) => {
    if (!serviceId || !Array.isArray(artistServices)) return null;
    const artistService = artistServices.find(as => as?.serviceId === serviceId);
    return artistService?.customDuration ?? null;
  };

  // Fetch all services and artist services
  const fetchServicesData = async () => {
    if (!id) return;
    
    try {
      const [servicesRes, artistServicesRes] = await Promise.all([
        fetch('/api/services'),
        fetch(`/api/artist-services/artist/${id}`)
      ]);

      const servicesData = await servicesRes.json();
      const artistServicesData = await artistServicesRes.json();

      if (servicesData?.success && servicesData?.data?.services) {
        setAllServices(servicesData.data.services);
      }

      if (artistServicesData?.success && artistServicesData?.data?.artistServices) {
        setArtistServices(artistServicesData.data.artistServices);
      }
    } catch (error) {
      console.error('Error fetching services data:', error);
    }
  };



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
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link 
              to="/" 
              className="hover:text-gray-700 transition-colors"
            >
              Home
            </Link>
            <span>/</span>
            <Link 
              to="/artists" 
              className="hover:text-gray-700 transition-colors"
            >
              Artists
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">
              {artist.user.firstName} {artist.user.lastName}
            </span>
          </div>
          
          <div className="flex items-start space-x-6">
            {/* Artist Avatar */}
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
              {artist.profilePictureUrl ? (
                <img 
                  src={artist.profilePictureUrl} 
                  alt={`${artist.user.firstName} ${artist.user.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-primary-600">
                  {artist.user.firstName[0]}{artist.user.lastName[0]}
                </span>
              )}
            </div>
            
            {/* Artist Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {artist.user.firstName} {artist.user.lastName}
                </h1>
                {artist.isVerified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Artist
                  </span>
                )}
                <FavoriteButton artistId={artist.id} size="w-8 h-8" />
                
                {/* Dashboard Link for Artist Viewing Own Profile */}
                {isAuthenticated && user?.id === artist.user.id && (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
              
              {/* Studio Information */}
              {artist.studioName && (
                <div className="mb-4">
                  {artist.studio ? (
                    // Studio is linked - make it clickable
                    <Link 
                      to={`/studios/${artist.studio.slug}`}
                      className="text-xl text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      {artist.studioName}
                    </Link>
                  ) : (
                    // Studio is not linked - show as plain text
                    <div className="text-xl text-gray-700 font-medium">
                      {artist.studioName}
                    </div>
                  )}
                  {/* Studio Address */}
                  {(artist.address || artist.city) && (
                    <div className="flex items-start mt-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      <div>
                        {artist.address && <div>{artist.address}</div>}
                        <div>
                          {artist.city && artist.state ? `${artist.city}, ${artist.state}` : (artist.city || artist.state)}
                          {artist.zipCode && ` ${artist.zipCode}`}
                          {artist.country && artist.country !== 'Canada' && `, ${artist.country}`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Rating, Pricing, and Quick Stats */}
              <div className="flex items-center flex-wrap gap-6 text-sm">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-red-500 fill-current mr-1" />
                  <span className="font-medium">{artist.averageRating ? `${artist.averageRating.toFixed(1)}` : 'New'}</span>
                  <span className="text-gray-500 ml-1">({artist.reviewCount || 0} reviews)</span>
                </div>
                {artist.hourlyRate && (
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-red-500 mr-1" />
                    <span className="font-medium text-red-600">${artist.hourlyRate}/hr</span>
                  </div>
                )}
                {artist.profileViews && (
                  <div className="flex items-center text-gray-500">
                    <Eye className="w-4 h-4 mr-1" />
                    <span>{artist.profileViews} views</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking CTA Banner */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <h3 className="text-lg font-semibold">Ready to get inked by {artist.user.firstName}?</h3>
              <p className="text-red-100">Book your consultation today and bring your vision to life</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {artist.calendlyUrl ? (
                <a
                  href={artist.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white text-red-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Consultation
                </a>
              ) : (
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-white text-red-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Artist
                </button>
              )}
              <button 
                onClick={handleShareProfile}
                className="inline-flex items-center px-4 py-3 border border-red-300 text-white font-medium rounded-lg hover:bg-red-400 transition-colors"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Artist Messages */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                Latest Updates from {artist.user.firstName}
              </h2>
              {artist.messages && artist.messages.length > 0 ? (
                <ArtistMessages messages={artist.messages} variant="profile" />
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">No updates yet from this artist</p>
                  <p className="text-sm text-gray-400">Check back later for artist announcements, new work, and updates!</p>
                </div>
              )}
            </div>

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
            {Array.isArray(allServices) && allServices.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Services</h2>
                <div className="mb-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1 mr-3">
                    <span className="w-3 h-3 bg-blue-50 border-l-4 border-blue-400 rounded"></span>
                    Custom Pricing
                  </span>
                  <span className="inline-flex items-center gap-1 mr-3">
                    <span className="w-3 h-3 bg-green-50 border-l-4 border-green-400 rounded"></span>
                    Selected for Profile
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-3 h-3 bg-gray-50 rounded"></span>
                    Available
                  </span>
                </div>
                <div className="space-y-3">
                  {allServices.map((service) => {
                    if (!service?.id) return null;
                    
                    const customPrice = getServicePrice(service.id);
                    const customDuration = getServiceDuration(service.id);
                    const hasCustomPricing = customPrice !== null || customDuration !== null;
                    const isSelected = artist?.services?.some(s => s?.id === service.id);
                    
                    return (
                      <div key={service.id} className={`flex justify-between items-center py-3 px-3 rounded ${
                        hasCustomPricing ? 'bg-blue-50 border-l-4 border-blue-400' : 
                        isSelected ? 'bg-green-50 border-l-4 border-green-400' : 'bg-gray-50'
                      }`}>
                        <div className="flex-1">
                          <h3 className={`font-medium ${hasCustomPricing ? 'text-blue-800' : isSelected ? 'text-green-800' : 'text-gray-900'}`}>
                            {service.name}
                          </h3>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          )}
                          {hasCustomPricing && (
                            <span className="inline-block mt-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              Custom Pricing
                            </span>
                          )}
                          {isSelected && !hasCustomPricing && (
                            <span className="inline-block mt-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className="text-gray-500 text-xs">Price:</span>
                            <div className={`font-semibold ${customPrice !== null ? 'text-blue-600' : 'text-primary-600'}`}>
                              {customPrice !== null ? (customPrice === 0 ? 'Free' : `$${customPrice}`) : `$${service.price || 'N/A'}`}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 text-xs">Duration:</span>
                            <div className={`font-semibold ${customDuration !== null ? 'text-blue-600' : 'text-gray-800'}`}>
                              {customDuration !== null ? (customDuration === 0 ? 'No time estimate' : `${customDuration} min`) : `${service.duration || 'N/A'} min`}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Flash Items / Portfolio */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Flash Designs</h2>
              {artist.flash && artist.flash.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          <h3 className="font-medium text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{flashItem.title}</h3>
                          {flashItem.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{flashItem.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold text-primary-600">
                              ${flashItem.basePrice}
                            </span>
                            {flashItem.tags && flashItem.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {flashItem.tags.slice(0, 3).map((tag, index) => (
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
                  {artist._count && artist._count.flash > artist.flash.length && (
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-500">
                        Showing {artist.flash.length} of {artist._count.flash} designs
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No flash designs available yet</p>
                  <p className="text-gray-400 text-xs mt-1">Check back later for new designs</p>
                </div>
              )}
            </div>

            {/* Tattoo Gallery / Portfolio */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tattoo Portfolio</h2>
              {artist.gallery && artist.gallery.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                          <h3 className="font-medium text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{galleryItem.title}</h3>
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
                            {galleryItem.tattooSize && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Size:</span>
                                <span className="font-medium text-gray-700">{galleryItem.tattooSize}</span>
                              </div>
                            )}
                            {galleryItem.sessionCount > 1 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Sessions:</span>
                                <span className="font-medium text-gray-700">{galleryItem.sessionCount}</span>
                              </div>
                            )}
                            {galleryItem.hoursSpent && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Hours:</span>
                                <span className="font-medium text-gray-700">{galleryItem.hoursSpent}</span>
                              </div>
                            )}
                          </div>
                          {galleryItem.tags && galleryItem.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {galleryItem.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {galleryItem.completedAt && (
                            <div className="text-xs text-gray-400 mt-2">
                              Completed {new Date(galleryItem.completedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {artist._count && artist._count.gallery > artist.gallery.length && (
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-500">
                        Showing {artist.gallery.length} of {artist._count.gallery} portfolio items
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No portfolio items available yet</p>
                  <p className="text-gray-400 text-xs mt-1">Check back later for completed tattoo work</p>
                </div>
              )}
            </div>

            {/* Studio Information */}
            {studios && studios.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
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
                                {studio.latitude && studio.longitude && (
                                  <Link
                                    to="/map"
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="View on map"
                                  >
                                    <MapPin className="h-3 w-3" />
                                  </Link>
                                )}
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
                            
                            {studio.website && (
                              <div className="mt-2">
                                <a
                                  href={studio.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  Visit Website
                                </a>
                              </div>
                            )}
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
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <MapPin className="h-16 w-16 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-sm mb-2">No studio memberships yet</p>
                  <p className="text-gray-400 text-xs">This artist can join multiple studios to showcase their work</p>
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
                  <>
                    {isAuthenticated ? (
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
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Phone className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-900">Phone number available</p>
                            <p className="text-xs text-blue-700">Call {artist.user.firstName} directly</p>
                          </div>
                        </div>
                        <Link 
                          to="/login" 
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1 rounded-md border border-blue-300 hover:bg-blue-100 transition-colors"
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
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <Mail className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <ProtectedEmail 
                        email={artist.user.email} 
                        showIcon={false}
                        className="text-gray-900 font-medium hover:text-primary-600 transition-colors"
                        recipient={artist}
                        recipientType="artist"
                      />
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

                {/* Pinterest */}
                {artist.pinterest && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <Share2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-500">Pinterest</p>
                      <a
                        href={artist.pinterest.startsWith('http') ? artist.pinterest : `https://pinterest.com/${artist.pinterest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 font-medium hover:text-primary-600 transition-colors truncate block flex items-center"
                      >
                        {artist.pinterest.replace(/^https?:\/\/(www\.)?pinterest\.com\//, '')}
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
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <Calendar className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-green-900">Online booking available</p>
                            <p className="text-xs text-green-700">Schedule directly with {artist.user.firstName}</p>
                          </div>
                        </div>
                        <Link 
                          to="/register" 
                          className="text-green-600 hover:text-green-800 font-medium text-sm px-3 py-1 rounded-md border border-green-300 hover:bg-green-100 transition-colors"
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