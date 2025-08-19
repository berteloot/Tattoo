import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { rateLimitAwareCall } from '../utils/apiHealth'
import { artistsAPI, flashAPI, reviewsAPI, specialtiesAPI, servicesAPI } from '../services/api'
import ImageUpload from '../components/ImageUpload'
import ProfilePictureUpload from '../components/ProfilePictureUpload'
import { CheckCircle, Image as ImageIcon, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

import StudioSearch from '../components/StudioSearch'
import StudioMemberships from '../components/StudioMemberships'
import { FavoriteClients } from '../components/FavoriteClients'
import { MessageManagement } from '../components/MessageManagement'

export const ArtistDashboard = () => {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  
  // State management
  const [profile, setProfile] = useState(null)
  const [flash, setFlash] = useState([])
  const [gallery, setGallery] = useState([])
  const [reviews, setReviews] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showFlashForm, setShowFlashForm] = useState(false)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  
  // Form states
  const [formData, setFormData] = useState({
    bio: '',
    studioName: '',
    studioId: '',
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
    latitude: '',
    longitude: '',
    hourlyRate: '',
    minPrice: '',
    maxPrice: '',
    specialtyIds: [],
    serviceIds: []
  })

  // Profile picture state
  const [profilePictureData, setProfilePictureData] = useState(null)

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



  // Analytics state
  const [analytics, setAnalytics] = useState({
    profileViews: 0,
    totalReviews: 0,
    averageRating: 0,
    totalFlash: 0,
    totalGallery: 0
  })

  useEffect(() => {
    // Only proceed if user is properly authenticated
    if (!user || !user.id) {
      return
    }
    
    console.log('🔍 ArtistDashboard mounted')
    console.log('User state:', user)
    console.log('User artist profile:', user?.artistProfile)
    
    // Check if user is creating new profile or editing existing one
    if (user?.artistProfile?.id) {
      console.log('✅ User has existing artist profile - EDITING MODE')
    } else {
      console.log('📝 User creating new artist profile - CREATION MODE')
    }
    
    // Handle studio creation success message and pre-fill studio info
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
    
    // Load dashboard data
    loadDashboardData()
  }, [user, location.state, success])

  const loadDashboardData = async () => {
    console.log('🔍 Loading dashboard data...')
    
    // Check if user is properly authenticated before making API calls
    if (!user || !user.id) {
      console.log('User not properly authenticated, skipping dashboard data fetch');
      setProfile({})
      setFlash([])
      setReviews([])
      setSpecialties([])
      setServices([])
      setGallery([])
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      
      let reviewsData = []
      let flashData = []
      
      // Load artist profile first (required for other data)
      if (user?.artistProfile?.id) {
        console.log('✅ User has artist profile, loading details...')
        try {
          const profileResponse = await rateLimitAwareCall(
            () => artistsAPI.getById(user.artistProfile.id),
            null
          )
          console.log('✅ Profile response:', profileResponse)
          console.log('🔍 Full profile response structure:', JSON.stringify(profileResponse, null, 2))
          if (profileResponse?.data?.data?.artist) {
            const artist = profileResponse.data.data.artist
            setProfile(artist)
            console.log('✅ Profile set:', artist)
            
            // Set gallery data from profile
            setGallery(artist.gallery || [])
            console.log('✅ Gallery data set:', artist.gallery?.length || 0, 'items')
            console.log('🔍 Gallery data details:', artist.gallery)
            
            // Set form data with safety checks
            setFormData({
              bio: artist.bio || '',
              studioName: artist.studioName || '',
              website: artist.website || '',
              instagram: artist.instagram || '',
              facebook: artist.facebook || '',
              twitter: artist.twitter || '',
              youtube: artist.youtube || '',
              linkedin: artist.linkedin || '',
              pinterest: artist.pinterest || '',
              calendlyUrl: artist.calendlyUrl || '',
              address: artist.address || '',
              city: artist.city || '',
              state: artist.state || '',
              zipCode: artist.zipCode || '',
              country: artist.country || '',
              latitude: artist.latitude || '',
              longitude: artist.longitude || '',
              hourlyRate: artist.hourlyRate || '',
              minPrice: artist.minPrice || '',
              maxPrice: artist.maxPrice || '',
              specialtyIds: artist.specialties?.map(s => s.id) || [],
              serviceIds: artist.services?.map(s => s.id) || [],
              // Profile picture fields
              profilePictureUrl: artist.profilePictureUrl || null,
              profilePicturePublicId: artist.profilePicturePublicId || null,
              profilePictureWidth: artist.profilePictureWidth || null,
              profilePictureHeight: artist.profilePictureHeight || null,
              profilePictureFormat: artist.profilePictureFormat || null,
              profilePictureBytes: artist.profilePictureBytes || null
            })

            // Set profile picture data if exists
            if (artist.profilePictureUrl) {
              setProfilePictureData({
                url: artist.profilePictureUrl,
                publicId: artist.profilePicturePublicId,
                width: artist.profilePictureWidth,
                height: artist.profilePictureHeight,
                format: artist.profilePictureFormat,
                bytes: artist.profilePictureBytes
              })
            }
            console.log('✅ Form data set')
          }
        } catch (profileError) {
          console.error('❌ Error loading artist profile:', profileError)
          // Profile might not exist, continue with empty form
        }
      } else {
        console.log('⚠️  User does not have artist profile')
      }

      // Batch load remaining data with delay to avoid rate limiting
      if (user?.artistProfile?.id) {
        console.log('🔄 Batch loading remaining dashboard data...')
        
        // Add small delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Load flash items
        try {
          const flashResponse = await rateLimitAwareCall(
            () => flashAPI.getAll({ artistId: user.artistProfile.id }),
            { data: { data: { flash: [] } } }
          )
          flashData = flashResponse?.data?.data?.flash || []
          setFlash(flashData)
          console.log('✅ Flash items loaded:', flashData.length)
        } catch (flashError) {
          console.error('Error loading flash items:', flashError)
          setFlash([])
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Load reviews
        try {
          const reviewsResponse = await rateLimitAwareCall(
            () => reviewsAPI.getAll({ recipientId: user?.id }),
            { data: { data: { reviews: [] } } }
          )
          reviewsData = reviewsResponse?.data?.data?.reviews || []
          setReviews(reviewsData)
          console.log('✅ Reviews loaded:', reviewsData.length)
        } catch (reviewsError) {
          console.error('Error loading reviews:', reviewsError)
          setReviews([])
        }
        
        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Load specialties and services in parallel
        try {
          const [specialtiesResponse, servicesResponse] = await Promise.all([
            rateLimitAwareCall(() => specialtiesAPI.getAll(), { data: { data: { specialties: [] } } }),
            rateLimitAwareCall(() => servicesAPI.getAll(), { data: { data: { services: [] } } })
          ])
          
          const specialties = specialtiesResponse?.data?.data?.specialties || []
          const services = servicesResponse?.data?.data?.services || []
          
          setSpecialties(specialties)
          setServices(services)
          console.log('✅ Specialties and services loaded:', specialties.length, services.length)
        } catch (error) {
          console.error('Error loading specialties/services:', error)
          setSpecialties([])
          setServices([])
        }
      } else {
        setFlash([])
        setReviews([])
        setSpecialties([])
        setServices([])
      }

      // Calculate analytics with safety checks
      const avgRating = (reviewsData || []).length > 0
        ? (reviewsData || []).reduce((sum, review) => sum + (review.rating || 0), 0) / (reviewsData || []).length
        : 0

      setAnalytics({
        profileViews: Math.floor(Math.random() * 100) + 10, // Mock data since profileViews column was removed
        totalReviews: (reviewsData || []).length,
        averageRating: Math.round(avgRating * 10) / 10,
        totalFlash: (flashData || []).length,
        totalGallery: (gallery || []).length
      })

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      showError('Error loading dashboard data')
    } finally {
      setLoading(false)
    }
  }

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
      specialtyIds: prev.specialtyIds.includes(specialtyId)
        ? prev.specialtyIds.filter(id => id !== specialtyId)
        : [...prev.specialtyIds, specialtyId]
    }))
  }

  const handleServiceChange = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }))
  }

  const handleFlashInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Convert values to appropriate types
    let processedValue = value
    
    if (type === 'number') {
      processedValue = value === '' ? '' : parseFloat(value) || 0
    } else if (type === 'checkbox') {
      processedValue = checked
    }
    
    setFlashFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
  }

  const handleImageUpload = (imageData) => {
    console.log('📋 ArtistDashboard: Received image data:', imageData);
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

  const handleImageRemove = () => {
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

  const handleFlashSubmit = async (e) => {
    e.preventDefault()
    
    // Check if user has artist profile
    if (!user?.artistProfile?.id) {
      showError('You need to create an artist profile first before adding flash items.')
      return
    }
    
    try {
      setLoading(true)
      
      console.log('📋 ArtistDashboard: Submitting flash data:', flashFormData);
      console.log('📋 ArtistDashboard: Description field value:', flashFormData.description);
      console.log('📋 ArtistDashboard: Description field type:', typeof flashFormData.description);
      console.log('📋 ArtistDashboard: Description field length:', flashFormData.description?.length);
      const response = await flashAPI.create(flashFormData)
      setFlash(prev => [response.data.data.flash, ...prev])
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
    } catch (err) {
      console.error('Error creating flash item:', err)
      const errorMessage = err.response?.data?.error || 'Error creating flash item'
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }



  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🔍 Form submission started')
    console.log('User:', user)
    console.log('Form data:', formData)
    console.log('🔍 Bio field value:', formData.bio)
    console.log('🔍 Bio field length:', formData.bio?.length)
    console.log('🔍 Studio field value:', formData.studioName)
    console.log('🔍 Specialty IDs:', formData.specialtyIds)
    console.log('🔍 Service IDs:', formData.serviceIds)
    
    // Validate required fields
    if (!formData.bio || formData.bio.trim().length < 10) {
      console.error('❌ Bio validation failed - too short or empty')
      showError('Bio is required and must be at least 10 characters long')
      return
    }
    
    if (!formData.studioName) {
      console.error('❌ Studio validation failed - no studio name')
      showError('You must be linked to a studio to create your artist profile')
      return
    }
    
    try {
      setLoading(true)
      console.log('✅ Loading state set to true')
      
      let response
      
      // Check if artist profile exists
      if (user?.artistProfile?.id) {
        console.log('🔄 Updating existing profile with ID:', user.artistProfile.id)
        // Update existing profile
        response = await artistsAPI.updateProfile(user.artistProfile.id, formData)
        console.log('✅ Update response:', response)
        setSuccessMessage('Profile updated successfully! You can now view your public profile and add flash items.')
        setShowSuccessBanner(true)
        success('Profile updated successfully!')
      } else {
        console.log('🔄 Creating new profile')
        
        // Create new profile
        response = await artistsAPI.createProfile(formData)
        console.log('✅ Create response:', response)
        setSuccessMessage('Profile created successfully! You can now view your public profile and start adding flash items.')
        setShowSuccessBanner(true)
        success('Profile created successfully!')
        
        // Refresh user data to get the new profile ID
        try {
          console.log('🔄 Refreshing user data...')
          const userResponse = await rateLimitAwareCall(
            () => artistsAPI.getById(user.artistProfile.id),
            null
          )
          console.log('✅ User refresh response:', userResponse)
          if (userResponse?.data?.success) {
            // Update the user context with the new profile
            window.location.reload() // Simple refresh to get updated user data
          }
        } catch (err) {
          console.error('❌ Error refreshing user data:', err)
          // Continue anyway, the profile was created successfully
        }
      }
      
      setProfile(response.data.data.artistProfile || response.data.data.artist)
      setEditing(false)
      console.log('✅ Form submission completed successfully')
    } catch (err) {
      console.error('❌ Error saving profile:', err)
      console.error('❌ Error response:', err.response)
      console.error('❌ Error message:', err.message)
      console.error('❌ Error details:', err.response?.data)
      const errorMessage = err.response?.data?.error || 'Error saving profile'
      showError(errorMessage)
    } finally {
      setLoading(false)
      console.log('✅ Loading state set to false')
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.artistProfile?.id ? 'Artist Dashboard' : 'Create Artist Profile'}
          </h1>
          <p className="mt-2 text-gray-600">
            {user?.artistProfile?.id 
              ? 'Manage your profile, portfolio, and business' 
              : 'Set up your artist profile to start showcasing your work'
            }
          </p>
          
          {/* Navigation Links */}
          {user?.artistProfile?.id && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to={`/artists/${user.artistProfile.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Public Profile
              </Link>
              <Link
                to="/dashboard/gallery"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Manage Gallery
              </Link>
            </div>
          )}
        </div>

        {/* Success Banner */}
        {showSuccessBanner && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-green-900">Success!</h3>
                  <p className="mt-1 text-green-700">{successMessage}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {user?.artistProfile?.id && (
                  <Link
                    to={`/artists/${user.artistProfile.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Profile
                  </Link>
                )}
                <button
                  onClick={() => setShowSuccessBanner(false)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Creation/Management Banner */}
        {!user?.artistProfile?.id ? (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-900">Create Your Artist Profile</h3>
                <p className="mt-1 text-blue-700">
                  To start adding flash items and managing your portfolio, you need to create your artist profile first. 
                  Fill out the form below to get started.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-green-900">Profile Active</h3>
                  <p className="mt-1 text-green-700">
                    Your artist profile is active and verified. You can edit your profile, add flash items, and manage your portfolio below.
                  </p>
                </div>
              </div>
              <Link
                to={`/artists/${user.artistProfile.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Profile
              </Link>
            </div>
          </div>
        )}

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Profile Views</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.profileViews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.averageRating}/5</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalReviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Flash Items</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalFlash}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Gallery Items</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.totalGallery}</p>
              </div>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Profile Management</h2>
                <div className="flex items-center space-x-3">
                  {user?.artistProfile?.id && (
                    <Link
                      to={`/artists/${user.artistProfile.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Link>
                  )}
                  <button
                    onClick={() => setEditing(!editing)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      !user?.artistProfile?.id 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'text-blue-600 hover:text-blue-500'
                    }`}
                  >
                    {editing ? 'Cancel' : (!user?.artistProfile?.id ? 'Create Profile' : 'Edit')}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Required Fields Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <span className="text-red-500">*</span> Required fields. All other fields are optional and can be added later.
                    </p>
                  </div>
                  
                  {/* Studio Search & Linking */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Studio <span className="text-red-500">*</span>
                    </label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800 mb-3">
                        <strong>Studio Requirement:</strong> You must be linked to a studio to create your artist profile. 
                        Search for your studio below or create a new one if it doesn't exist. When creating a new studio, 
                        you'll need to provide the studio name, address, city, state, and country.
                      </p>
                      <StudioSearch 
                        onStudioLinked={(studio) => {
                          console.log('🎯 Studio linked callback received:', studio);
                          console.log('🎯 Studio ID:', studio.id);
                          console.log('🎯 Studio Title:', studio.title);
                          setFormData(prev => {
                            const updated = {
                              ...prev,
                              studioName: studio.title
                            };
                            console.log('🔄 Updated form data:', updated);
                            return updated;
                          });
                        }}
                        currentArtistId={user?.artistProfile?.id}
                      />
                    </div>
                    {formData.studioName && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-sm text-green-800">
                            Linked to: <strong>{formData.studioName}</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* About Me */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About Me <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell clients about your style, experience, and what makes you unique..."
                    />
                  </div>

                  {/* Profile Picture */}
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
                    disabled={loading}
                  />

                  {/* Studio Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Studio Name
                      </label>
                      <input
                        type="text"
                        name="studioName"
                        value={formData.studioName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your studio name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram
                      </label>
                      <input
                        type="text"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="@yourhandle"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook
                      </label>
                      <input
                        type="text"
                        name="facebook"
                        value={formData.facebook}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="facebook.com/yourpage"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="@yourhandle"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="youtube.com/yourchannel"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calendly URL
                      </label>
                      <input
                        type="url"
                        name="calendlyUrl"
                        value={formData.calendlyUrl}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://calendly.com/yourname/consultation"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Add your Calendly booking link for online appointments
                      </p>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          name="hourlyRate"
                          value={formData.hourlyRate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="150"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Price ($)
                        </label>
                        <input
                          type="number"
                          name="minPrice"
                          value={formData.minPrice}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Price ($)
                        </label>
                        <input
                          type="number"
                          name="maxPrice"
                          value={formData.maxPrice}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div>
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
                                    checked={formData.specialtyIds.includes(specialty.id)}
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
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Services</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(services || []).map((service) => (
                        <label key={service.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.serviceIds.includes(service.id)}
                            onChange={() => handleServiceChange(service.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{service.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Profile Picture */}
                  {profile?.profilePictureUrl && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
                      <div className="flex items-center space-x-4">
                        <img
                          src={profile.profilePictureUrl}
                          alt="Profile"
                          className="w-24 h-24 object-cover rounded-full border-4 border-white shadow-lg"
                        />
                        <div className="text-sm text-gray-500">
                          <div>Size: {profile.profilePictureWidth} × {profile.profilePictureHeight}</div>
                          <div>Format: {profile.profilePictureFormat?.toUpperCase()}</div>
                          <div>File size: {Math.round(profile.profilePictureBytes / 1024)} KB</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* About Me */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">About Me</h3>
                    <p className="text-gray-600">
                      {profile?.bio || 'No bio added yet. Click Edit to add your story.'}
                    </p>
                  </div>

                  {/* Studio Info */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Studio Information</h3>
                    <div className="space-y-2">
                      {profile?.studioName && (
                        <p className="text-gray-600"><strong>Studio:</strong> {profile.studioName}</p>
                      )}
                      {profile?.website && (
                        <p className="text-gray-600"><strong>Website:</strong> <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.website}</a></p>
                      )}
                    </div>
                  </div>

                  {/* Social Media */}
                  {(profile?.instagram || profile?.facebook || profile?.twitter || profile?.youtube || profile?.linkedin || profile?.pinterest) && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Social Media</h3>
                      <div className="space-y-2">
                        {profile?.instagram && (
                          <p className="text-gray-600"><strong>Instagram:</strong> <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@{profile.instagram}</a></p>
                        )}
                        {profile?.facebook && (
                          <p className="text-gray-600"><strong>Facebook:</strong> <a href={`https://facebook.com/${profile.facebook}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.facebook}</a></p>
                        )}
                        {profile?.twitter && (
                          <p className="text-gray-600"><strong>Twitter:</strong> <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@{profile.twitter}</a></p>
                        )}
                        {profile?.youtube && (
                          <p className="text-gray-600"><strong>YouTube:</strong> <a href={`https://youtube.com/${profile.youtube}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.youtube}</a></p>
                        )}
                        {profile?.linkedin && (
                          <p className="text-gray-600"><strong>LinkedIn:</strong> <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.linkedin}</a></p>
                        )}
                        {profile?.pinterest && (
                          <p className="text-gray-600"><strong>Pinterest:</strong> <a href={`https://pinterest.com/${profile.pinterest}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{profile.pinterest}</a></p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Pricing</h3>
                    <div className="space-y-2">
                      {profile?.hourlyRate && (
                        <p className="text-gray-600"><strong>Hourly Rate:</strong> ${profile.hourlyRate}</p>
                      )}
                      {profile?.minPrice && profile?.maxPrice && (
                        <p className="text-gray-600"><strong>Price Range:</strong> ${profile.minPrice} - ${profile.maxPrice}</p>
                      )}
                    </div>
                  </div>

                  {/* Specialties */}
                  {profile?.specialties && profile.specialties.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Specialties</h3>
                      <div className="space-y-4">
                        {(() => {
                          // Group specialties by category
                          const groupedSpecialties = profile.specialties.reduce((acc, specialty) => {
                            const category = specialty.category || 'Other';
                            if (!acc[category]) {
                              acc[category] = [];
                            }
                            acc[category].push(specialty);
                            return acc;
                          }, {});

                          return Object.entries(groupedSpecialties).map(([category, categorySpecialties]) => (
                            <div key={category} className="border border-gray-200 rounded-lg p-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-1">
                                {category}
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {categorySpecialties.map((specialty) => (
                                  <span key={specialty.id} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                    {specialty.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {profile?.services && profile.services.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Services</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.services.map((service) => (
                          <span key={service.id} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                            {service.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>


        </div>

        {/* Studio Management */}
        {user?.artistProfile?.id && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Studio Management</h2>
              
              {/* Current Studio Memberships */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Current Studio Memberships</h3>
                <StudioMemberships 
                  artistId={user.artistProfile.id}
                  onStudioLeft={() => {
                    // Refresh the page or update data when studio is left
                    window.location.reload();
                  }}
                />
              </div>
              
              {/* Find New Studio */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Find New Studio</h3>
                <StudioSearch 
                  onStudioLinked={(studio) => {
                    // Update form data when studio is linked from this section
                    setFormData(prev => ({
                      ...prev,
                      studioName: studio.title,
                      studioId: studio.id
                    }));
                  }}
                  currentArtistId={user.artistProfile.id}
                />
              </div>
            </div>
          </div>
        )}

        {/* Favorite Clients Management */}
        {user?.artistProfile?.id && (
          <div className="mt-8">
            <FavoriteClients />
          </div>
        )}

        {/* Message Management Section */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Message Panel</h2>
            <p className="text-sm text-gray-500">
              Create and manage messages that appear on your artist profile and cards
            </p>
          </div>
          <div className="p-6">
            {user?.artistProfile?.id ? (
              <MessageManagement />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">Create your artist profile first to manage messages.</p>
                <p className="text-sm">
                  Current user role: <strong>{user?.role || 'Unknown'}</strong>
                </p>
                {user?.role === 'ARTIST' || user?.role === 'ARTIST_ADMIN' ? (
                  <p className="text-sm text-blue-600 mt-2">
                    You have artist permissions but no profile yet. Create your profile above first.
                  </p>
                ) : (
                  <p className="text-sm text-red-600 mt-2">
                    You need ARTIST or ARTIST_ADMIN role to manage messages.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Reviews</h2>
          </div>
          <div className="p-6">
            {(reviews || []).length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={review.author?.avatar || `https://ui-avatars.com/api/?name=${review.author?.firstName || 'User'}+${review.author?.lastName || ''}`}
                            alt={`${review.author?.firstName || 'User'} ${review.author?.lastName || ''}`}
                          />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {review.author?.firstName || 'User'} {review.author?.lastName || ''}
                          </p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${i < (review.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-2 text-sm text-gray-500">{review.rating || 0}/5</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    {review.title && (
                      <p className="mt-2 text-sm font-medium text-gray-900">{review.title}</p>
                    )}
                    {review.comment && (
                      <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No reviews yet. Keep up the great work!</p>
            )}
          </div>
        </div>

        {/* Flash Gallery */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Flash Gallery</h2>
              {/* Only show flash form if user has artist profile */}
              {user?.artistProfile?.id ? (
                <button 
                  onClick={() => setShowFlashForm(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Add New Flash
                </button>
              ) : (
                <p className="text-sm text-gray-500">Create your artist profile first to add flash items</p>
              )}
            </div>
          </div>
          <div className="p-6">
            {(flash || []).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flash.slice(0, 6).map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={item.title || 'Flash Item'}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900">{item.title || 'Untitled'}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      {item.basePrice && (
                        <div className="mt-2">
                          <p className="text-lg font-semibold text-blue-600">${item.basePrice}</p>
                          {item.complexity && (
                            <p className="text-xs text-gray-500 capitalize">{item.complexity.toLowerCase()}</p>
                          )}
                          {item.timeEstimate && (
                            <p className="text-xs text-gray-500">{item.timeEstimate} min</p>
                          )}
                        </div>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No flash items yet. Start building your portfolio!</p>
            )}
          </div>
        </div>

        {/* Flash Form Modal */}
        {showFlashForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add New Flash Item</h3>
                <button
                  onClick={() => setShowFlashForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
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
                    placeholder="Enter flash title"
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
                    Image *
                  </label>
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    onImageRemove={handleImageRemove}
                    currentImageUrl={flashFormData.imageUrl}
                    currentImageData={flashFormData.imagePublicId ? {
                      imageWidth: flashFormData.imageWidth,
                      imageHeight: flashFormData.imageHeight,
                      imageFormat: flashFormData.imageFormat
                    } : null}
                    disabled={loading}
                  />
                </div>

                {/* Design Complexity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Design Complexity
                  </label>
                  <select
                    name="complexity"
                    value={flashFormData.complexity}
                    onChange={handleFlashInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SIMPLE">Simple - Basic designs, minimal detail</option>
                    <option value="MEDIUM">Medium - Moderate complexity, good detail</option>
                    <option value="COMPLEX">Complex - High detail, intricate work</option>
                    <option value="MASTERPIECE">Masterpiece - Exceptional detail, premium work</option>
                  </select>
                </div>

                {/* Base Price */}
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

                {/* Time Estimate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="timeEstimate"
                    value={flashFormData.timeEstimate}
                    onChange={handleFlashInputChange}
                    min="15"
                    max="480"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="120"
                  />
                </div>

                {/* Size-Based Pricing */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size-Based Pricing
                  </label>
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    {Object.entries(flashFormData.sizePricing).map(([size, pricing]) => (
                      <div key={size} className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </label>
                          <input
                            type="number"
                            value={pricing.price}
                            onChange={(e) => {
                              const newSizePricing = { ...flashFormData.sizePricing }
                              newSizePricing[size].price = parseFloat(e.target.value) || 0
                              setFlashFormData(prev => ({ ...prev, sizePricing: newSizePricing }))
                            }}
                            min="0"
                            step="0.01"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Price"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Time (min)
                          </label>
                          <input
                            type="number"
                            value={pricing.time}
                            onChange={(e) => {
                              const newSizePricing = { ...flashFormData.sizePricing }
                              newSizePricing[size].time = parseInt(e.target.value) || 0
                              setFlashFormData(prev => ({ ...prev, sizePricing: newSizePricing }))
                            }}
                            min="15"
                            max="480"
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Time"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Size Range
                          </label>
                          <input
                            type="text"
                            value={pricing.size}
                            onChange={(e) => {
                              const newSizePricing = { ...flashFormData.sizePricing }
                              newSizePricing[size].size = e.target.value
                              setFlashFormData(prev => ({ ...prev, sizePricing: newSizePricing }))
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="1-2 inches"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Repeatable Option */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isRepeatable"
                    checked={flashFormData.isRepeatable}
                    onChange={handleFlashInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    This design can be used multiple times
                  </label>
                </div>

                {/* Available for Booking */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={flashFormData.isAvailable}
                    onChange={handleFlashInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Available for booking
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowFlashForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Flash'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Next Steps Section */}
        {user?.artistProfile?.id && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">Next Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-blue-600 text-2xl mb-2">📸</div>
                <h3 className="font-medium text-gray-900 mb-2">Add Flash Items</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Create flash designs that clients can choose from. Add pricing, complexity, and time estimates.
                </p>
                <button
                  onClick={() => setShowFlashForm(true)}
                  className="w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  Add Flash Item
                </button>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-blue-600 text-2xl mb-2">🎨</div>
                <h3 className="font-medium text-gray-900 mb-2">Build Portfolio</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Upload your completed tattoo work to showcase your skills and attract new clients.
                </p>
                <Link
                  to="/dashboard/gallery"
                  className="block w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors text-center"
                >
                  Manage Gallery
                </Link>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-blue-600 text-2xl mb-2">👁️</div>
                <h3 className="font-medium text-gray-900 mb-2">View Profile</h3>
                <p className="text-sm text-gray-600 mb-3">
                  See how your profile appears to potential clients and make sure everything looks perfect.
                </p>
                <Link
                  to={`/artists/${user.artistProfile.id}`}
                  className="block w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors text-center"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        )}



        {/* Gallery Preview */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Tattoo Gallery Preview</h2>
              {user?.artistProfile?.id && (
                <Link 
                  to="/dashboard/gallery"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center space-x-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Manage Gallery</span>
                </Link>
              )}
            </div>
          </div>
          <div className="p-6">
            {gallery && gallery.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.slice(0, 6).map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={item.imageUrl || item.thumbnailUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={item.title || 'Gallery Item'}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900">{item.title || 'Untitled'}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      <div className="mt-2 space-y-1">
                        {item.tattooStyle && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Style:</span> {item.tattooStyle}
                          </p>
                        )}
                        {item.bodyLocation && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Location:</span> {item.bodyLocation}
                          </p>
                        )}
                        {item.tattooSize && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Size:</span> {item.tattooSize}
                          </p>
                        )}
                        {item.colorType && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Color:</span> {item.colorType}
                          </p>
                        )}
                        {item.sessionCount && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Sessions:</span> {item.sessionCount}
                          </p>
                        )}
                        {item.hoursSpent && (
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Hours:</span> {item.hoursSpent}
                          </p>
                        )}
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.completedAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          Completed: {new Date(item.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🎨</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Gallery Items Yet</h3>
                <p className="text-gray-600 mb-6">
                  {user?.artistProfile?.id 
                    ? 'Start building your tattoo portfolio by uploading your completed work.'
                    : 'Create your artist profile first to start building your tattoo portfolio.'
                  }
                </p>
                {user?.artistProfile?.id ? (
                  <Link
                    to="/dashboard/gallery"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span>Upload Gallery Items</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Create Artist Profile</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 