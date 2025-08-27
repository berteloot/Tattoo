import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { 
  useArtistProfile, 
  useArtistFlash, 
  useArtistTattoos,
  useArtistReviews, 
  useSpecialties, 
  useServices 
} from '../hooks/useDashboardQueries'
import { api, artistsAPI, flashAPI } from '../services/api'
import ProfilePictureUpload from '../components/ProfilePictureUpload'
import ImageUpload from '../components/ImageUpload'
import BatchFlashUpload from '../components/BatchFlashUpload'
import { MessageManagement } from '../components/MessageManagement'
import StudioSelect from '../components/StudioSelect'
import { ArtistServicesManager } from '../components/ArtistServicesManager'
import { 
  MapPin, 
  Phone, 
  Globe, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Linkedin, 
  Calendar,
  Edit3,
  Plus,
  Image,
  Star,
  Clock,
  DollarSign,
  Tag,
  Camera,
  Settings,
  User,
  Building,
  Trash2,
  XCircle,
  Eye,
  Upload,
  MessageSquare,
  Heart,
  Mail,
  Users
} from 'lucide-react'

export const ArtistDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { success, error: showError } = useToast()
  
  // Local state for form data
  const [formData, setFormData] = useState({
    bio: '',
    studioName: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    pinterest: '',
    calendlyUrl: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    hourlyRate: '',
    minPrice: '',
    maxPrice: '',
    selectedSpecialties: [],
    selectedServices: []
  })

  // Profile picture state
  const [profilePictureData, setProfilePictureData] = useState(null)

  // Studio selection state
  const [selectedStudio, setSelectedStudio] = useState(null)

  // Flash creation state
  const [showFlashForm, setShowFlashForm] = useState(false)
  const [flashUploadMode, setFlashUploadMode] = useState('single') // 'single' or 'batch'
  const [flashFormData, setFlashFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    imagePublicId: '',
    imageWidth: null,
    imageHeight: null,
    imageFormat: '',
    imageBytes: null,
    basePrice: '',
    complexity: 'MEDIUM',
    timeEstimate: 120,
    isRepeatable: true,
    sizePricing: {
      small: { price: 100, time: 60, size: '1-2 inches' },
      medium: { price: 150, time: 90, size: '3-4 inches' },
      large: { price: 200, time: 120, size: '5-6 inches' },
      xlarge: { price: 250, time: 150, size: '7+ inches' }
    },
    tags: [],
    isAvailable: true
  })

  // Flash edit state
  const [editingFlash, setEditingFlash] = useState(null)
  const [editFlashFormData, setEditFlashFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    imagePublicId: '',
    imageWidth: null,
    imageHeight: null,
    imageFormat: '',
    imageBytes: null,
    basePrice: '',
    complexity: 'MEDIUM',
    timeEstimate: 120,
    isRepeatable: true,
    sizePricing: {
      small: { price: 100, time: 60, size: '1-2 inches' },
      medium: { price: 150, time: 90, size: '3-4 inches' },
      large: { price: 200, time: 120, size: '5-6 inches' },
      xlarge: { price: 250, time: 150, size: '7+ inches' }
    },
    tags: [],
    isAvailable: true
  })

  // Use React Query hooks for data fetching
  const artistId = user?.artistProfile?.id
  
  const { 
    data: profile = {}, 
    isLoading: profileLoading, 
    error: profileError 
  } = useArtistProfile(artistId)
  
  const { 
    data: flash = [], 
    isLoading: flashLoading, 
    error: flashError,
    refetch: refetchFlash
  } = useArtistFlash(artistId)
  
  const { 
    data: tattoos = [], 
    isLoading: tattoosLoading, 
    error: tattoosError,
    refetch: refetchTattoos
  } = useArtistTattoos(artistId)
  
  const { 
    data: reviews = [], 
    isLoading: reviewsLoading, 
    error: reviewsError 
  } = useArtistReviews(user?.id)
  
  const { 
    data: specialties = [], 
    isLoading: specialtiesLoading, 
    error: specialtiesError 
  } = useSpecialties()
  
  const { 
    data: services = [], 
    isLoading: servicesLoading, 
    error: servicesError 
  } = useServices()

  // State for artist services (custom pricing)
  const [artistServices, setArtistServices] = useState([])

  // State for favorites management
  const [favoriteClients, setFavoriteClients] = useState([])
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailFormData, setEmailFormData] = useState({
    subject: '',
    message: '',
    clientIds: [],
    sendToAll: false
  })
  const [selectedClients, setSelectedClients] = useState([])

  // State for reviews management
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)

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

  // Fetch artist services when profile is available
  const fetchArtistServices = async () => {
    if (!profile?.id) return;
    
    try {
      const response = await fetch(`/api/artist-services/artist/${profile.id}`);
      const data = await response.json();
      if (data?.success && data?.data?.artistServices) {
        setArtistServices(data.data.artistServices);
      } else {
        // No custom services yet, that's fine
        setArtistServices([]);
      }
    } catch (error) {
      console.error('Error fetching artist services:', error);
      // Set empty array on error to prevent crashes
      setArtistServices([]);
    }
  };

  // Fetch favorite clients when profile is available
  const fetchFavoriteClients = async () => {
    if (!profile?.id) return;
    
    try {
      const response = await api.get('/artists/my-favorites');
      if (response.data?.success) {
        setFavoriteClients(response.data.data.clients || []);
      }
    } catch (error) {
      console.error('Error fetching favorite clients:', error);
      setFavoriteClients([]);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchArtistServices();
      fetchFavoriteClients();
    }
  }, [profile?.id]);

  // Handle errors gracefully
  if (profileError) {
    console.error('Error loading artist profile:', profileError)
  }
  
  if (flashError) {
    console.error('Error loading flash items:', flashError)
  }
  
  if (tattoosError) {
    console.error('Error loading tattoo gallery:', tattoosError)
  }
  
  if (reviewsError) {
    console.error('Error loading reviews:', reviewsError)
  }
  
  if (specialtiesError) {
    console.error('Error loading specialties:', specialtiesError)
  }
  
  if (servicesError) {
    console.error('Error loading services:', servicesError)
  }

  // Update form data when profile loads
  useEffect(() => {
    if (profile && Object.keys(profile).length > 0) {
      setFormData(prev => ({
        ...prev,
        bio: profile.bio || '',
        studioName: profile.studioName || '',
        website: profile.website || '',
        instagram: profile.instagram || '',
        facebook: profile.facebook || '',
        twitter: profile.twitter || '',
        youtube: profile.youtube || '',
        linkedin: profile.linkedin || '',
        pinterest: profile.pinterest || '',
        calendlyUrl: profile.calendlyUrl || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zipCode || '',
        country: profile.country || '',
        hourlyRate: profile.hourlyRate || '',
        minPrice: profile.minPrice || '',
        maxPrice: profile.maxPrice || '',
        selectedSpecialties: profile.specialties?.map(s => s.id) || [],
        selectedServices: profile.services?.map(s => s.id) || [],
        // Profile picture fields
        profilePictureUrl: profile.profilePictureUrl || null,
        profilePicturePublicId: profile.profilePicturePublicId || null,
        profilePictureWidth: profile.profilePictureWidth || null,
        profilePictureHeight: profile.profilePictureHeight || null,
        profilePictureFormat: profile.profilePictureFormat || null,
        profilePictureBytes: profile.profilePictureBytes || null
      }))

      // Set profile picture data if exists
      if (profile.profilePictureUrl) {
        setProfilePictureData({
          url: profile.profilePictureUrl,
          publicId: profile.profilePicturePublicId,
          width: profile.profilePictureWidth,
          height: profile.profilePictureHeight,
          format: profile.profilePictureFormat,
          bytes: profile.profilePictureBytes
        })
      }

      // Set selected studio if profile has studio info
      if (profile.studioName) {
        setSelectedStudio({
          id: null, // We don't store studioId in the profile
          title: profile.studioName,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zipCode: profile.zipCode,
          country: profile.country
        })
      }
    }
  }, [profile])

  // Handle studio creation success message and pre-fill studio info
  useEffect(() => {
    if (location.state?.studioCreated && location.state?.studio) {
      success(location.state.message || 'Studio created successfully!')
      
      // Pre-fill studio information for new profile creation
      if (!user?.artistProfile?.id && location.state.studio) {
        const studio = location.state.studio
        console.log('🎯 Pre-filling studio info:', studio)
        setFormData(prev => ({
          ...prev,
          studioName: studio.title,
          studioId: studio.id
        }))
      }
      
      // Clear the navigation state
      window.history.replaceState({}, document.title)
    }
  }, [location.state, success, user?.artistProfile?.id])

  // Profile picture handlers
  const handleProfilePictureUpload = (imageData) => {
    setProfilePictureData(imageData)
    setFormData(prev => ({
      ...prev,
      profilePictureUrl: imageData.url,
      profilePicturePublicId: imageData.publicId,
      profilePictureWidth: imageData.width,
      profilePictureHeight: imageData.height,
      profilePictureFormat: imageData.format,
      profilePictureBytes: imageData.bytes
    }))
  }

  const handleProfilePictureRemove = () => {
    setProfilePictureData(null)
    setFormData(prev => ({
      ...prev,
      profilePictureUrl: null,
      profilePicturePublicId: null,
      profilePictureWidth: null,
      profilePictureHeight: null,
      profilePictureFormat: null,
      profilePictureBytes: null
    }))
  }

  // Studio selection handlers
  const handleStudioSelect = (studio) => {
    setSelectedStudio(studio)
    setFormData(prev => ({
      ...prev,
      studioName: studio.title,
      // Pre-fill address information from studio
      address: studio.address || prev.address,
      city: studio.city || prev.city,
      state: studio.state || prev.state,
      zipCode: studio.zipCode || prev.zipCode,
      country: studio.country || prev.country
    }))
  }

  const handleStudioClear = () => {
    setSelectedStudio(null)
    setFormData(prev => ({
      ...prev,
      studioName: ''
    }))
  }

  // Flash creation handlers
  const handleFlashSubmit = async (e) => {
    e.preventDefault()
    
    // Check if user has artist profile
    if (!user?.artistProfile?.id) {
      showError('You need to create your artist profile first before adding flash items.')
      return
    }
    
    // Validate that an image is uploaded
    if (!flashFormData.imageUrl) {
      showError('Please upload a flash design image before submitting.')
      return
    }
    
    try {
      console.log('📋 Submitting flash data:', flashFormData)
      
      const response = await flashAPI.create(flashFormData)
      console.log('✅ Flash created:', response.data)
      
      // Reset form
      setFlashFormData({
        title: '',
        description: '',
        imageUrl: '',
        imagePublicId: '',
        imageWidth: null,
        imageHeight: null,
        imageFormat: '',
        imageBytes: null,
        basePrice: '',
        complexity: 'MEDIUM',
        timeEstimate: 120,
        isRepeatable: true,
        sizePricing: {
          small: { price: 100, time: 60, size: '1-2 inches' },
          medium: { price: 150, time: 90, size: '3-4 inches' },
          large: { price: 200, time: 120, size: '5-6 inches' },
          xlarge: { price: 250, time: 150, size: '7+ inches' }
        },
        tags: [],
        isAvailable: true
      })
      
      setShowFlashForm(false)
      success('Flash item created successfully!')
      
      // Refresh flash list
      refetchFlash()
      
    } catch (error) {
      console.error('❌ Error creating flash item:', error)
      const errorMessage = error.response?.data?.error || 'Error creating flash item'
      showError(errorMessage)
    }
  }

  const handleBatchFlashCreated = async (flashItems) => {
    try {
      console.log('📋 Batch flash created:', flashItems)
      
      setShowFlashForm(false)
      success(`Successfully created ${flashItems.length} flash items!`)
      
      // Refresh flash list
      refetchFlash()
      
    } catch (error) {
      console.error('❌ Error in batch flash creation:', error)
      showError('Some flash items may not have been created. Please check and try again.')
    }
  }

  const handleFlashInputChange = (e) => {
    const { name, value } = e.target
    setFlashFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Edit flash form input handler
  const handleEditFlashInputChange = (e) => {
    const { name, value } = e.target
    setEditFlashFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Profile form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSpecialtyChange = (specialtyId) => {
    setFormData(prev => ({
      ...prev,
      selectedSpecialties: prev.selectedSpecialties.includes(specialtyId)
        ? prev.selectedSpecialties.filter(id => id !== specialtyId)
        : [...prev.selectedSpecialties, specialtyId]
    }))
  }

  const handleServiceChange = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }))
  }

  // Flash image upload handlers
  const handleFlashImageUpload = (imageData) => {
    console.log('📋 Flash image upload successful:', imageData)
    setFlashFormData(prev => ({
      ...prev,
      imageUrl: imageData.imageUrl,
      imagePublicId: imageData.imagePublicId,
      imageWidth: imageData.imageWidth,
      imageHeight: imageData.imageHeight,
      imageFormat: imageData.imageFormat,
      imageBytes: imageData.imageBytes
    }))
  }

  const handleFlashImageRemove = () => {
    setFlashFormData(prev => ({
      ...prev,
      imageUrl: '',
      imagePublicId: '',
      imageWidth: null,
      imageHeight: null,
      imageFormat: '',
      imageBytes: null
    }))
  }

  // Edit flash image upload handlers
  const handleEditFlashImageUpload = (imageData) => {
    console.log('📋 Edit flash image upload successful:', imageData)
    setEditFlashFormData(prev => ({
      ...prev,
      imageUrl: imageData.imageUrl,
      imagePublicId: imageData.imagePublicId,
      imageWidth: imageData.imageWidth,
      imageHeight: imageData.imageHeight,
      imageFormat: imageData.imageFormat,
      imageBytes: imageData.imageBytes
    }))
  }

  const handleEditFlashImageRemove = () => {
    setEditFlashFormData(prev => ({
      ...prev,
      imageUrl: '',
      imagePublicId: '',
      imageWidth: null,
      imageHeight: null,
      imageFormat: '',
      imageBytes: null
    }))
  }

  // Email favorites handlers
  const handleEmailFavorites = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare the email data
      const emailData = {
        subject: emailFormData.subject,
        message: emailFormData.message,
        sendToAll: emailFormData.sendToAll
      };
      
      // If not sending to all, include selected client IDs
      if (!emailFormData.sendToAll && selectedClients.length > 0) {
        emailData.clientIds = selectedClients;
      }
      
      const response = await api.post('/artists/email-favorites', emailData);
      if (response.data?.success) {
        success('Emails sent successfully!');
        setShowEmailModal(false);
        setEmailFormData({
          subject: '',
          message: '',
          clientIds: [],
          sendToAll: false
        });
        setSelectedClients([]);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      const errorMessage = error.response?.data?.error || 'Error sending emails';
      showError(errorMessage);
    }
  };

  const handleClientSelection = (clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAllClients = () => {
    if (selectedClients.length === favoriteClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(favoriteClients.map(client => client.client.id));
    }
  };

  const handleEmailInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Flash Gallery handlers
  const handleEditFlash = (item) => {
    setEditingFlash(item);
    setEditFlashFormData({
      title: item.title,
      description: item.description,
      imageUrl: item.imageUrl,
      imagePublicId: item.imagePublicId,
      imageWidth: item.imageWidth,
      imageHeight: item.imageHeight,
      imageFormat: item.imageFormat,
      imageBytes: item.imageBytes,
      basePrice: item.basePrice,
      complexity: item.complexity,
      timeEstimate: item.timeEstimate,
      isRepeatable: item.isRepeatable,
      sizePricing: item.sizePricing,
      tags: item.tags,
      isAvailable: item.isAvailable
    });
  };

  const handleDeleteFlash = async (id) => {
    if (window.confirm('Are you sure you want to delete this flash item?')) {
      try {
        await flashAPI.delete(id);
        success('Flash item deleted successfully!');
        // Refresh the flash list
        refetchFlash();
      } catch (error) {
        console.error('Error deleting flash item:', error);
        const errorMessage = error.response?.data?.error || 'Error deleting flash item';
        showError(errorMessage);
      }
    }
  };

  // Loading state
  const isLoading = profileLoading || flashLoading || tattoosLoading || reviewsLoading || specialtiesLoading || servicesLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Artist Dashboard</h1>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Artist Dashboard</h1>
            <p className="text-gray-600">
              {profile.id ? 'Edit your artist profile' : 'Create your artist profile'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Artist Profile</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate('/dashboard/gallery')}
                    className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Tattoo Gallery
                  </button>
                  
                  <button
                    onClick={() => navigate('/flash')}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Flash Gallery
                  </button>
                </div>
              </div>
              
              {/* Profile Picture Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Picture</h3>
                <ProfilePictureUpload
                  onImageUpload={handleProfilePictureUpload}
                  onImageRemove={handleProfilePictureRemove}
                  currentImageUrl={profile?.profilePictureUrl || formData.profilePictureUrl}
                  currentImageData={profilePictureData || {
                    url: profile?.profilePictureUrl,
                    publicId: profile?.profilePicturePublicId,
                    width: profile?.profilePictureWidth,
                    height: profile?.profilePictureHeight,
                    format: profile?.profilePictureFormat,
                    bytes: profile?.profilePictureBytes
                  }}
                />
              </div>

              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      name="bio"
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell clients about your style and experience..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Studio
                    </label>
                    <StudioSelect
                      selectedStudio={selectedStudio}
                      onStudioSelect={handleStudioSelect}
                      onStudioClear={handleStudioClear}
                      placeholder="Search for a studio to join or claim..."
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Search for an existing studio to join, or claim a new one if you're the first artist there.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contact & Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      name="website"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calendly URL
                    </label>
                    <input
                      type="url"
                      value={formData.calendlyUrl}
                      name="calendlyUrl"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://calendly.com/yourname"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={formData.instagram}
                      name="instagram"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="@username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={formData.facebook}
                      name="facebook"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="facebook.com/username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Twitter
                    </label>
                    <input
                      type="text"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="@username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube
                    </label>
                    <input
                      type="text"
                      name="youtube"
                      value={formData.youtube}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                      placeholder="youtube.com/yourchannel"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="linkedin.com/in/yourprofile"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pinterest
                    </label>
                                          <input
                        type="text"
                        name="pinterest"
                        value={formData.pinterest}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="pinterest.com/yourprofile"
                      />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      name="address"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      name="city"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      name="state"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="State"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP/Postal Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="12345"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      name="hourlyRate"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="150"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Price ($)
                    </label>
                    <input
                      type="number"
                      value={formData.minPrice}
                      name="minPrice"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Price ($)
                    </label>
                    <input
                      type="number"
                      value={formData.maxPrice}
                      name="maxPrice"
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Specialties</h3>
                <div className="space-y-6">
                  {(() => {
                    // Group specialties by category
                    const groupedSpecialties = (specialties || []).reduce((acc, specialty) => {
                      const category = specialty.category || 'Other';
                      if (!acc[category]) {
                        acc[category] = [];
                      }
                      acc[category].push(specialty);
                      return acc;
                    }, {});

                    return Object.entries(groupedSpecialties).map(([category, categorySpecialties]) => (
                      <div key={category} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {categorySpecialties.map((specialty) => (
                            <label key={specialty.id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                checked={formData.selectedSpecialties.includes(specialty.id)}
                                onChange={() => handleSpecialtyChange(specialty.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="ml-2">
                                <span className="text-sm font-medium text-gray-700">{specialty.name}</span>
                                {specialty.description && (
                                  <p className="text-xs text-gray-500 mt-1">{specialty.description}</p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Services */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Services</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(services || []).map((service) => (
                    <label key={service.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.selectedServices.includes(service.id)}
                        onChange={() => handleServiceChange(service.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{service.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Service Pricing Management */}
              {profile?.id && (
                <div className="mb-6">
                  <ArtistServicesManager 
                    artistId={profile.id} 
                    onServicesUpdated={fetchArtistServices}
                  />
                </div>
              )}

              {/* Save Profile Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      // If studio is selected, ensure studio data is included in profile
                      let profileDataToSave = { 
                        ...formData,
                        // Map frontend field names to backend expected names
                        specialtyIds: formData.selectedSpecialties,
                        serviceIds: formData.selectedServices
                      };
                      
                      if (selectedStudio) {
                        // Include studio information in the profile data
                        profileDataToSave = {
                          ...profileDataToSave,
                          studioName: selectedStudio.title,
                          // Use studio address if available, otherwise keep user's input
                          address: selectedStudio.address || profileDataToSave.address,
                          city: selectedStudio.city || profileDataToSave.city,
                          state: selectedStudio.state || profileDataToSave.state,
                          zipCode: selectedStudio.zipCode || profileDataToSave.zipCode,
                          country: selectedStudio.country || profileDataToSave.country
                        };
                      }
                      
                      // Save profile first
                      let response;
                      if (profile?.id) {
                        response = await artistsAPI.updateProfile(profile.id, profileDataToSave);
                      } else {
                        response = await artistsAPI.createProfile(profileDataToSave);
                      }
                      
                      if (response.data.success) {
                        success('Profile saved successfully!');
                        
                        // If studio is selected, try to claim/join it
                        if (selectedStudio) {
                          try {
                            const artistProfileId = response.data.data.artistProfile?.id || response.data.data.artist?.id;
                            
                            if (selectedStudio.claimedBy) {
                              // Studio is already claimed, try to join
                              await api.post(`/studios/${selectedStudio.id}/artists`, {
                                artistId: artistProfileId
                              });
                              success(`Successfully joined ${selectedStudio.title}!`);
                            } else {
                              // Studio is not claimed, try to claim it
                              await api.post(`/studios/${selectedStudio.id}/claim`);
                              success(`Successfully claimed ${selectedStudio.title}!`);
                            }
                            
                            console.log('✅ Studio linked successfully:', selectedStudio.title);
                          } catch (studioError) {
                            console.error('Studio linking error:', studioError);
                            // Continue anyway, the profile was saved successfully
                          }
                        }
                        
                        // Refresh the page to get updated data
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error('Profile save error:', error);
                      const errorMessage = error.response?.data?.error || 'Error saving profile';
                      showError(errorMessage);
                    }
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
                >
                  {profile?.id ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </div>

            {/* Message Management */}
            {profile.id ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Message Panel</h3>
                  <p className="text-sm text-gray-600">
                    Create and manage messages that appear on your artist profile and cards
                  </p>
                </div>
                <MessageManagement />
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <p className="mb-4">Create your artist profile first to manage messages.</p>
                <p className="text-sm text-gray-500">
                  You need ARTIST or ARTIST_ADMIN role to manage messages.
                </p>
              </div>
            )}

            {/* Flash Gallery */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Flash Gallery</h2>
                <div className="flex items-center space-x-3">
                  {/* Upload Mode Toggle */}
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setFlashUploadMode('single')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        flashUploadMode === 'single'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Single
                    </button>
                    <button
                      onClick={() => setFlashUploadMode('batch')}
                      className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        flashUploadMode === 'batch'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Batch
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => setShowFlashForm(true)}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    {flashUploadMode === 'batch' ? (
                      <Upload className="h-4 w-4 mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {flashUploadMode === 'batch' ? 'Batch Upload' : 'Add Flash'}
                  </button>
                </div>
              </div>
              
              {Array.isArray(flash) && flash.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flash.map((item) => {
                    if (!item?.id) return null; // Skip invalid items
                    
                    return (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title || 'Flash Design'}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-medium text-gray-900 mb-1">{item.title || 'Untitled'}</h3>
                        <p className="text-sm text-gray-600 mb-2">{item.description || 'No description'}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">${item.basePrice || 'N/A'}</span>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleEditFlash(item)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteFlash(item.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No flash items yet</p>
                  <p className="text-sm text-gray-400">Add some flash designs to showcase your work</p>
                </div>
              )}
            </div>

            {/* Favorites Management */}
            {profile.id && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Favorites Management</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {favoriteClients.length} client{favoriteClients.length !== 1 ? 's' : ''} favorited you
                    </span>
                    {favoriteClients.length > 0 && (
                      <button
                        onClick={() => {
                          setEmailFormData(prev => ({ ...prev, sendToAll: false }));
                          setSelectedClients([]);
                          setShowEmailModal(true);
                        }}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Clients
                      </button>
                    )}
                  </div>
                </div>
                
                {favoriteClients.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedClients.length === favoriteClients.length}
                          onChange={handleSelectAllClients}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Select All ({selectedClients.length}/{favoriteClients.length})
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setEmailFormData(prev => ({ ...prev, sendToAll: true }));
                          setSelectedClients([]);
                          setShowEmailModal(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Email All
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {favoriteClients.map((favorite) => {
                        const client = favorite.client;
                        if (!client?.id) return null;
                        
                        return (
                          <div key={favorite.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                checked={selectedClients.includes(client.id)}
                                onChange={() => handleClientSelection(client.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  {client.avatar ? (
                                    <img
                                      src={client.avatar}
                                      alt={`${client.firstName} ${client.lastName}`}
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">
                                        {client.firstName?.[0] || 'C'}{client.lastName?.[0] || 'L'}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <h3 className="font-medium text-gray-900">
                                      {client.firstName} {client.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-500">{client.email}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                  <span>Favorited: {new Date(favorite.favoritedAt).toLocaleDateString()}</span>
                                  <span>Member since: {new Date(client.createdAt).toLocaleDateString()}</span>
                                </div>
                                
                                <div className="flex items-center space-x-4 text-xs">
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-400" />
                                    <span>{client.averageRating || 0}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MessageSquare className="h-3 w-3 text-blue-400" />
                                    <span>{client.reviewCount || 0} reviews</span>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => {
                                    setEmailFormData(prev => ({
                                      ...prev,
                                      clientIds: [client.id],
                                      sendToAll: false
                                    }));
                                    setSelectedClients([client.id]);
                                    setShowEmailModal(true);
                                  }}
                                  className="w-full mt-3 px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
                                >
                                  Email This Client
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No clients have favorited you yet</p>
                    <p className="text-sm text-gray-400">Keep building your portfolio to attract more clients</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Management */}
            {profile.id && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Reviews Management</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {reviews.length} review{reviews.length !== 1 ? 's' : ''} received
                    </span>
                    {reviews.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / Math.max(reviews.length, 1))
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {reviews.length > 0 
                            ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
                            : '0.0'
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => {
                      if (!review?.id) return null;
                      
                      return (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              {review.author?.avatar ? (
                                <img
                                  src={review.author.avatar}
                                  alt={`${review.author.firstName} ${review.author.lastName}`}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">
                                    {review.author?.firstName?.[0] || 'C'}{review.author?.lastName?.[0] || 'L'}
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-medium text-gray-900">
                                    {review.author?.firstName} {review.author?.lastName}
                                  </h3>
                                  <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`h-3 w-3 ${
                                          i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">({review.rating}/5)</span>
                                </div>
                                
                                <p className="text-gray-700 mb-2">{review.comment || 'No comment provided'}</p>
                                
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>Posted: {new Date(review.createdAt).toLocaleDateString()}</span>
                                  {review.updatedAt && review.updatedAt !== review.createdAt && (
                                    <span>Updated: {new Date(review.updatedAt).toLocaleDateString()}</span>
                                  )}
                                  {review.isHidden && (
                                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                      Hidden
                                    </span>
                                  )}
                                </div>
                                
                                {/* Review Image */}
                                {review.imageUrl && (
                                  <div className="mt-3">
                                    <img
                                      src={review.imageUrl}
                                      alt="Review image"
                                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => {
                                  setSelectedReview(review);
                                  setShowReviewModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-md transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/artists/${profile.id}#reviews`)}
                                className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-md transition-colors"
                                title="View on Profile"
                              >
                                <Globe className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No reviews received yet</p>
                    <p className="text-sm text-gray-400">Complete some work to start receiving client reviews</p>
                  </div>
                )}
              </div>
            )}

            {/* Flash Creation Form Modal */}
            {showFlashForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className={`bg-white rounded-lg p-6 w-full max-h-[90vh] overflow-y-auto ${
                  flashUploadMode === 'batch' ? 'max-w-6xl' : 'max-w-2xl'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {flashUploadMode === 'batch' ? 'Batch Upload Flash Designs' : 'Add New Flash Design'}
                    </h3>
                    <button
                      onClick={() => setShowFlashForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {flashUploadMode === 'batch' ? (
                    <BatchFlashUpload
                      onFlashCreated={handleBatchFlashCreated}
                      onCancel={() => setShowFlashForm(false)}
                      maxFiles={10}
                      className="mb-4"
                      specialties={specialties}
                      services={services}
                    />
                  ) : (
                    <form onSubmit={handleFlashSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={flashFormData.title}
                        onChange={handleFlashInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter flash design title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={flashFormData.description}
                        onChange={handleFlashInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your flash design"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Flash Design Image *
                      </label>
                      <ImageUpload
                        onImageUpload={handleFlashImageUpload}
                        onImageRemove={handleFlashImageRemove}
                        currentImageUrl={flashFormData.imageUrl}
                        currentImageData={{
                          imageUrl: flashFormData.imageUrl,
                          imagePublicId: flashFormData.imagePublicId,
                          imageWidth: flashFormData.imageWidth,
                          imageHeight: flashFormData.imageHeight,
                          imageFormat: flashFormData.imageFormat,
                          imageBytes: flashFormData.imageBytes
                        }}
                        uploadEndpoint="/api/flash/upload"
                        maxSize={5 * 1024 * 1024} // 5MB
                        className="mb-4"
                      />
                      
                      {/* Image Preview */}
                      {flashFormData.imageUrl && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Preview:</span>
                            <button
                              type="button"
                              onClick={handleFlashImageRemove}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove Image
                            </button>
                          </div>
                          <img 
                            src={flashFormData.imageUrl} 
                            alt="Flash design preview"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="mt-2 text-xs text-gray-500">
                            {flashFormData.imageWidth && flashFormData.imageHeight && (
                              <span>Dimensions: {flashFormData.imageWidth} × {flashFormData.imageHeight}px</span>
                            )}
                            {flashFormData.imageFormat && (
                              <span className="ml-2">Format: {flashFormData.imageFormat.toUpperCase()}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Price ($)
                      </label>
                      <input
                        type="number"
                        name="basePrice"
                        value={flashFormData.basePrice}
                        onChange={handleFlashInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="150"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complexity
                      </label>
                      <select
                        name="complexity"
                        value={flashFormData.complexity}
                        onChange={handleFlashInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="SIMPLE">Simple</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="COMPLEX">Complex</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Estimate (minutes)
                      </label>
                      <input
                        type="number"
                        name="timeEstimate"
                        value={flashFormData.timeEstimate}
                        onChange={handleFlashInputChange}
                        min="30"
                        step="30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="120"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isRepeatable"
                        checked={flashFormData.isRepeatable}
                        onChange={(e) => setFlashFormData(prev => ({
                          ...prev,
                          isRepeatable: e.target.checked
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        This design can be repeated for multiple clients
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={flashFormData.isAvailable}
                        onChange={(e) => setFlashFormData(prev => ({
                          ...prev,
                          isAvailable: e.target.checked
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Available for booking
                      </label>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowFlashForm(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Create Flash Design
                      </button>
                    </div>
                  </form>
                  )}
                </div>
              </div>
            )}

            {/* Flash Edit Form Modal */}
            {editingFlash && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Edit Flash Design</h3>
                    <button
                      onClick={() => setEditingFlash(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const updatedFlashData = {
                        ...editFlashFormData,
                        // Ensure image data is included if it was uploaded
                        imageUrl: editFlashFormData.imageUrl || editFlashFormData.imagePublicId ? editFlashFormData.imageUrl : null,
                        imagePublicId: editFlashFormData.imageUrl ? editFlashFormData.imagePublicId : null,
                        imageWidth: editFlashFormData.imageUrl ? editFlashFormData.imageWidth : null,
                        imageHeight: editFlashFormData.imageUrl ? editFlashFormData.imageHeight : null,
                        imageFormat: editFlashFormData.imageUrl ? editFlashFormData.imageFormat : null,
                        imageBytes: editFlashFormData.imageUrl ? editFlashFormData.imageBytes : null,
                      };

                      const response = await flashAPI.update(editingFlash.id, updatedFlashData);
                      console.log('✅ Flash updated:', response.data);
                      success('Flash item updated successfully!');
                      setEditingFlash(null); // Close edit form
                      refetchFlash(); // Refresh flash list
                    } catch (error) {
                      console.error('❌ Error updating flash item:', error);
                      const errorMessage = error.response?.data?.error || 'Error updating flash item';
                      showError(errorMessage);
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={editFlashFormData.title}
                        onChange={handleEditFlashInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter flash design title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={editFlashFormData.description}
                        onChange={handleEditFlashInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your flash design"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Flash Design Image *
                      </label>
                      <ImageUpload
                        onImageUpload={handleEditFlashImageUpload}
                        onImageRemove={handleEditFlashImageRemove}
                        currentImageUrl={editFlashFormData.imageUrl}
                        currentImageData={{
                          imageUrl: editFlashFormData.imageUrl,
                          imagePublicId: editFlashFormData.imagePublicId,
                          imageWidth: editFlashFormData.imageWidth,
                          imageHeight: editFlashFormData.imageHeight,
                          imageFormat: editFlashFormData.imageFormat,
                          imageBytes: editFlashFormData.imageBytes
                        }}
                        uploadEndpoint="/api/flash/upload"
                        maxSize={5 * 1024 * 1024} // 5MB
                        className="mb-4"
                      />
                      
                      {/* Image Preview */}
                      {editFlashFormData.imageUrl && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Preview:</span>
                            <button
                              type="button"
                              onClick={handleEditFlashImageRemove}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove Image
                            </button>
                          </div>
                          <img 
                            src={editFlashFormData.imageUrl} 
                            alt="Flash design preview"
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="mt-2 text-xs text-gray-500">
                            {editFlashFormData.imageWidth && editFlashFormData.imageHeight && (
                              <span>Dimensions: {editFlashFormData.imageWidth} × {editFlashFormData.imageHeight}px</span>
                            )}
                            {editFlashFormData.imageFormat && (
                              <span className="ml-2">Format: {editFlashFormData.imageFormat.toUpperCase()}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Price ($)
                      </label>
                      <input
                        type="number"
                        name="basePrice"
                        value={editFlashFormData.basePrice}
                        onChange={handleEditFlashInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="150"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complexity
                      </label>
                      <select
                        name="complexity"
                        value={editFlashFormData.complexity}
                        onChange={handleEditFlashInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="150"
                      >
                        <option value="SIMPLE">Simple</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="COMPLEX">Complex</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Estimate (minutes)
                      </label>
                      <input
                        type="number"
                        name="timeEstimate"
                        value={editFlashFormData.timeEstimate}
                        onChange={handleEditFlashInputChange}
                        min="30"
                        step="30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="120"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isRepeatable"
                        checked={editFlashFormData.isRepeatable}
                        onChange={(e) => setEditFlashFormData(prev => ({
                          ...prev,
                          isRepeatable: e.target.checked
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        This design can be repeated for multiple clients
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={editFlashFormData.isAvailable}
                        onChange={(e) => setEditFlashFormData(prev => ({
                          ...prev,
                          isAvailable: e.target.checked
                        }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Available for booking
                      </label>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingFlash(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Update Flash Design
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Email Favorites Modal */}
            {showEmailModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Email Favorite Clients</h3>
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleEmailFavorites} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={emailFormData.subject}
                        onChange={handleEmailInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter email subject"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        value={emailFormData.message}
                        onChange={handleEmailInputChange}
                        rows={6}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your message to clients..."
                      />
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="sendToAll"
                          checked={emailFormData.sendToAll}
                          onChange={handleEmailInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Send to all favorite clients</span>
                      </label>
                    </div>
                    
                    {!emailFormData.sendToAll && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Clients to Email
                        </label>
                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
                          {favoriteClients.map((favorite) => {
                            const client = favorite.client;
                            if (!client?.id) return null;
                            
                            return (
                              <label key={client.id} className="flex items-center space-x-2 py-1">
                                <input
                                  type="checkbox"
                                  checked={selectedClients.includes(client.id)}
                                  onChange={() => handleClientSelection(client.id)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">
                                  {client.firstName} {client.lastName} ({client.email})
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Selected: {selectedClients.length} client{selectedClients.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowEmailModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Send Email{emailFormData.sendToAll ? ' to All' : ` to ${selectedClients.length} Client${selectedClients.length !== 1 ? 's' : ''}`}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Review Details Modal */}
            {showReviewModal && selectedReview && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Review Details</h3>
                    <button
                      onClick={() => setShowReviewModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      {selectedReview.author?.avatar ? (
                        <img
                          src={selectedReview.author.avatar}
                          alt={`${selectedReview.author.firstName} ${selectedReview.author.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {selectedReview.author?.firstName?.[0] || 'C'}{selectedReview.author?.lastName?.[0] || 'L'}
                          </span>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {selectedReview.author?.firstName} {selectedReview.author?.lastName}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-5 w-5 ${
                                i < (selectedReview.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-500">({selectedReview.rating}/5)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Review</h5>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {selectedReview.comment || 'No comment provided'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Posted:</span>
                        <span className="ml-2 text-gray-600">
                          {new Date(selectedReview.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedReview.updatedAt && selectedReview.updatedAt !== selectedReview.createdAt && (
                        <div>
                          <span className="font-medium text-gray-700">Updated:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(selectedReview.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          selectedReview.isHidden 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedReview.isHidden ? 'Hidden' : 'Visible'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Review Image */}
                    {selectedReview.imageUrl && (
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Review Image</h5>
                        <img
                          src={selectedReview.imageUrl}
                          alt="Review image"
                          className="w-full max-w-md h-auto object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => navigate(`/artists/${profile.id}#reviews`)}
                        className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        View on Profile
                      </button>
                      <button
                        onClick={() => setShowReviewModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tattoo Gallery */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Tattoo Gallery</h2>
                <button 
                  onClick={() => navigate('/dashboard/gallery')}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                >
                  <Image className="h-4 w-4 mr-2" />
                  Add Tattoo
                </button>
              </div>
              
              {Array.isArray(tattoos) && tattoos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tattoos.map((tattoo) => {
                    if (!tattoo?.id) return null; // Skip invalid items
                    
                    return (
                      <div key={tattoo.id} className="border border-gray-200 rounded-lg p-4">
                        <img 
                          src={tattoo.imageUrl} 
                          alt={tattoo.title || 'Tattoo Design'}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-medium text-gray-900 mb-1">{tattoo.title || 'Untitled'}</h3>
                        <p className="text-sm text-gray-600 mb-2">{tattoo.description || 'No description'}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            {tattoo.tattooStyle && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                {tattoo.tattooStyle}
                              </span>
                            )}
                            {tattoo.bodyLocation && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {tattoo.bodyLocation}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => navigate(`/dashboard/gallery/edit/${tattoo.id}`)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit Tattoo"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/gallery/${tattoo.id}`)}
                              className="text-green-600 hover:text-green-800"
                              title="View Tattoo"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tattoos yet</p>
                  <p className="text-sm text-gray-400 mb-4">Start building your portfolio by adding your first tattoo design</p>
                  <button 
                    onClick={() => navigate('/dashboard/gallery')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Add Your First Tattoo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Overview</h3>
              
              <div className="space-y-4">
                {/* Profile Picture Display */}
                {profile?.profilePictureUrl && (
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
                    <div className="inline-block">
                      <img
                        src={profile.profilePictureUrl}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                      <div>Size: {profile.profilePictureWidth} × {profile.profilePictureHeight}</div>
                      <div>Format: {profile.profilePictureFormat?.toUpperCase()}</div>
                      <div>File size: {Math.round(profile.profilePictureBytes / 1024)} KB</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Profile Views</span>
                  <span className="font-semibold text-gray-900">{profile.profileViews || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Reviews</span>
                  <span className="font-semibold text-gray-900">{reviews.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Flash Items</span>
                  <span className="font-semibold text-gray-900">{flash.length}</span>
                </div>
              </div>
            </div>

            {/* Current Profile Information */}
            {profile?.id && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Profile</h3>
                
                <div className="space-y-4">
                  {/* Bio */}
                  {profile?.bio && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Bio</h4>
                      <p className="text-gray-600 text-sm">{profile.bio}</p>
                    </div>
                  )}
                  
                  {/* Studio */}
                  {profile?.studioName && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Studio</h4>
                      <p className="text-gray-600 text-sm">{profile.studioName}</p>
                    </div>
                  )}
                  
                  {/* Location */}
                  {(profile?.address || profile?.city || profile?.state) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Location</h4>
                      <p className="text-gray-600 text-sm">
                        {[profile.address, profile.city, profile.state, profile.zipCode, profile.country]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    </div>
                  )}
                  
                  {/* Pricing */}
                  {(profile?.hourlyRate || profile?.minPrice || profile?.maxPrice) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Pricing</h4>
                      <div className="text-gray-600 text-sm space-y-1">
                        {profile.hourlyRate && <div>Hourly Rate: ${profile.hourlyRate}/hr</div>}
                        {profile.minPrice && profile.maxPrice && (
                          <div>Price Range: ${profile.minPrice} - ${profile.maxPrice}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Specialties */}
                  {profile?.specialties && Array.isArray(profile.specialties) && profile.specialties.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties.map((specialty) => {
                          if (!specialty?.id) return null; // Skip invalid specialties
                          
                          return (
                            <span
                              key={specialty.id}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {specialty.name || 'Unnamed Specialty'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Services */}
                  {Array.isArray(services) && services.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Services</h4>
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
                      <div className="space-y-2">
                        {services.map((service) => {
                          if (!service?.id) return null; // Skip invalid services
                          
                          const customPrice = getServicePrice(service.id);
                          const customDuration = getServiceDuration(service.id);
                          const hasCustomPricing = customPrice !== null || customDuration !== null;
                          const isSelected = profile?.services?.some(s => s?.id === service.id);
                          
                          return (
                            <div key={service.id} className={`flex justify-between items-center text-sm p-2 rounded ${
                              hasCustomPricing ? 'bg-blue-50 border-l-4 border-blue-400' : 
                              isSelected ? 'bg-green-50 border-l-4 border-green-400' : 'bg-gray-50'
                            }`}>
                              <div className="flex-1">
                                <span className={`font-medium ${hasCustomPricing ? 'text-blue-800' : isSelected ? 'text-green-800' : 'text-gray-600'}`}>
                                  {service.name || 'Unnamed Service'}
                                </span>
                                {hasCustomPricing && (
                                  <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                    Custom Pricing
                                  </span>
                                )}
                                {isSelected && !hasCustomPricing && (
                                  <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    Selected
                                  </span>
                                )}
                                {!isSelected && !hasCustomPricing && (
                                  <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                    Available
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <span className="text-gray-500 text-xs">Price:</span>
                                  <div className={`font-medium ${customPrice !== null ? 'text-blue-600' : 'text-gray-800'}`}>
                                    {customPrice !== null ? (customPrice === 0 ? 'Free' : `$${customPrice}`) : `$${service.price || 'N/A'}`}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-gray-500 text-xs">Duration:</span>
                                  <div className={`font-medium ${customDuration !== null ? 'text-blue-600' : 'text-gray-800'}`}>
                                    {customDuration !== null ? (customDuration === 0 ? 'No time estimate' : `${customDuration} min`) : `${service.duration || 'N/A'} min`}
                                    {customDuration === 0 && (
                                      <span className="ml-1 text-xs text-gray-500">(No time estimate)</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Social Media */}
                  {(profile?.website || profile?.instagram || profile?.facebook || profile?.twitter || profile?.youtube || profile?.linkedin || profile?.pinterest) && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Social Media & Links</h4>
                      <div className="space-y-1 text-sm">
                        {profile.website && (
                          <div className="text-blue-600 hover:underline">
                            <a href={profile.website} target="_blank" rel="noopener noreferrer">
                              🌐 Website
                            </a>
                          </div>
                        )}
                        {profile.instagram && (
                          <div className="text-pink-600 hover:underline">
                            <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer">
                              📷 Instagram
                            </a>
                          </div>
                        )}
                        {profile.facebook && (
                          <div className="text-blue-600 hover:underline">
                            <a href={`https://facebook.com/${profile.facebook}`} target="_blank" rel="noopener noreferrer">
                              📘 Facebook
                            </a>
                          </div>
                        )}
                        {profile.twitter && (
                          <div className="text-blue-400 hover:underline">
                            <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer">
                              🐦 Twitter
                            </a>
                          </div>
                        )}
                        {profile.youtube && (
                          <div className="text-red-600 hover:underline">
                            <a href={`https://youtube.com/${profile.youtube}`} target="_blank" rel="noopener noreferrer">
                              📺 YouTube
                            </a>
                          </div>
                        )}
                        {profile.linkedin && (
                          <div className="text-blue-700 hover:underline">
                            <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer">
                              💼 LinkedIn
                            </a>
                          </div>
                        )}
                        {profile.pinterest && (
                          <div className="text-red-500 hover:underline">
                            <a href={`https://pinterest.com/${profile.pinterest}`} target="_blank" rel="noopener noreferrer">
                              📌 Pinterest
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reviews</h3>
              
              {/* Debug info */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
                  <strong>Debug:</strong> User ID: {user?.id}, Reviews count: {Array.isArray(reviews) ? reviews.length : 'Not array'}, Loading: {reviewsLoading ? 'Yes' : 'No'}
                </div>
              )}
              
              {Array.isArray(reviews) && reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((review) => {
                    if (!review?.id) return null; // Skip invalid reviews
                    
                    return (
                      <div key={review.id} className="border-l-4 border-blue-500 pl-3">
                        <div className="flex items-center mb-2">
                          <img
                            src={review.author?.avatar || `https://ui-avatars.com/api/?name=${review.author?.firstName || 'User'}+${review.author?.lastName || ''}`}
                            alt={`${review.author?.firstName || 'User'} ${review.author?.lastName || ''}`}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3 w-3 ${
                                  i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{review.comment || 'No comment'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : reviewsLoading ? (
                <p className="text-gray-500 text-center py-4">Loading reviews...</p>
              ) : (
                <p className="text-gray-500 text-center py-4">No reviews yet</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/dashboard/gallery')}
                  className="w-full flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Image className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-purple-800 font-medium">Manage Tattoo Gallery</span>
                </button>
                
                <button
                  onClick={() => setShowFlashForm(true)}
                  className="w-full flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Plus className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-green-800 font-medium">Manage Flash Gallery</span>
                </button>
                
                <button
                  onClick={() => navigate('/artists')}
                  className="w-full flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <Building className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-blue-800 font-medium">Browse Artists</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 