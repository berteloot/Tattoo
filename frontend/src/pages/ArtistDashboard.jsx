import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { api, artistsAPI, flashAPI, reviewsAPI, specialtiesAPI, servicesAPI } from '../services/api'
import ImageUpload from '../components/ImageUpload'

export const ArtistDashboard = () => {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  
  // State management
  const [profile, setProfile] = useState(null)
  const [flash, setFlash] = useState([])
  const [reviews, setReviews] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [showFlashForm, setShowFlashForm] = useState(false)
  
  // Form states
  const [formData, setFormData] = useState({
    bio: '',
    studioName: '',
    website: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    linkedin: '',
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
    monthlyEarnings: 0
  })

  useEffect(() => {
    console.log('🔍 ArtistDashboard mounted')
    console.log('User state:', user)
    console.log('User artist profile:', user?.artistProfile)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    console.log('🔍 Loading dashboard data...')
    try {
      setLoading(true)
      
      let reviewsData = []
      let flashData = []
      
      // Load artist profile
      if (user?.artistProfile?.id) {
        console.log('✅ User has artist profile, loading details...')
        try {
          const profileResponse = await artistsAPI.getById(user.artistProfile.id)
          console.log('✅ Profile response:', profileResponse)
          if (profileResponse?.data?.data?.artist) {
            const artist = profileResponse.data.data.artist
            setProfile(artist)
            console.log('✅ Profile set:', artist)
            
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
              serviceIds: artist.services?.map(s => s.id) || []
            })
            console.log('✅ Form data set')
          }
        } catch (profileError) {
          console.error('❌ Error loading artist profile:', profileError)
          // Profile might not exist, continue with empty form
        }
      } else {
        console.log('⚠️  User does not have artist profile')
      }

      // Load flash items (only if artist profile exists)
      if (user?.artistProfile?.id) {
        try {
          const flashResponse = await flashAPI.getAll({ artistId: user.artistProfile.id })
          flashData = flashResponse?.data?.data?.flash || []
          setFlash(flashData)
        } catch (flashError) {
          console.error('Error loading flash items:', flashError)
          setFlash([])
        }
      } else {
        setFlash([])
      }

      // Load reviews
      try {
        const reviewsResponse = await reviewsAPI.getAll({ recipientId: user?.id })
        reviewsData = reviewsResponse?.data?.data?.reviews || []
        setReviews(reviewsData)
      } catch (reviewsError) {
        console.error('Error loading reviews:', reviewsError)
        setReviews([])
      }

      // Load specialties and services with error handling
      try {
        const [specialtiesResponse, servicesResponse] = await Promise.all([
          specialtiesAPI.getAll(),
          servicesAPI.getAll()
        ])
        
        setSpecialties(specialtiesResponse?.data?.data?.specialties || [])
        setServices(servicesResponse?.data?.data?.services || [])
      } catch (apiError) {
        console.error('Error loading specialties/services:', apiError)
        setSpecialties([])
        setServices([])
      }

      // Calculate analytics with safety checks
      const avgRating = (reviewsData || []).length > 0
        ? (reviewsData || []).reduce((sum, review) => sum + (review.rating || 0), 0) / (reviewsData || []).length
        : 0

      setAnalytics({
        profileViews: Math.floor(Math.random() * 100) + 50, // Mock data for now
        totalReviews: (reviewsData || []).length,
        averageRating: Math.round(avgRating * 10) / 10,
        totalFlash: (flashData || []).length,
        monthlyEarnings: Math.floor(Math.random() * 5000) + 1000 // Mock data for now
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
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

  const handleFlashSubmit = async (e) => {
    e.preventDefault()
    
    // Check if user has artist profile
    if (!user?.artistProfile?.id) {
              showError('You need to create an artist profile first before adding flash items.')
      return
    }
    
    try {
      setLoading(true)
      
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
    } catch (error) {
      console.error('Error creating flash item:', error)
      const errorMessage = error.response?.data?.error || 'Error creating flash item'
      error(errorMessage)
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
    console.log('🔍 City field value:', formData.city)
    console.log('🔍 Specialty IDs:', formData.specialtyIds)
    console.log('🔍 Service IDs:', formData.serviceIds)
    
    // Validate required fields
    if (!formData.bio || formData.bio.trim().length < 10) {
      console.error('❌ Bio validation failed - too short or empty')
      showError('Bio is required and must be at least 10 characters long')
      return
    }
    
    if (!formData.city || formData.city.trim().length === 0) {
      console.error('❌ City validation failed - empty')
      showError('City is required')
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
        success('Profile updated successfully!')
      } else {
        console.log('🔄 Creating new profile')
        // Create new profile
        response = await artistsAPI.createProfile(formData)
        console.log('✅ Create response:', response)
        success('Profile created successfully!')
        
        // Refresh user data to get the new profile ID
        try {
          console.log('🔄 Refreshing user data...')
          const userResponse = await api.get('/auth/me')
          console.log('✅ User refresh response:', userResponse)
          if (userResponse.data.success) {
            // Update the user context with the new profile
            window.location.reload() // Simple refresh to get updated user data
          }
        } catch (error) {
          console.error('❌ Error refreshing user data:', error)
          // Continue anyway, the profile was created successfully
        }
      }
      
      setProfile(response.data.data.artistProfile || response.data.data.artist)
      setEditing(false)
      console.log('✅ Form submission completed successfully')
    } catch (error) {
      console.error('❌ Error saving profile:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error message:', error.message)
      console.error('❌ Error details:', error.response?.data)
      const errorMessage = error.response?.data?.error || 'Error saving profile'
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
          <h1 className="text-3xl font-bold text-gray-900">Artist Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your profile, portfolio, and business</p>
        </div>

        {/* Profile Creation Banner */}
        {!user?.artistProfile?.id && (
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
                  Click the "Edit" button in the Profile Management section below to get started.
                </p>
              </div>
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
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">${analytics.monthlyEarnings}</p>
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

            <div className="p-6">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Required Fields Note */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <span className="text-red-500">*</span> Required fields. All other fields are optional and can be added later.
                    </p>
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
                  {(profile?.instagram || profile?.facebook || profile?.twitter || profile?.youtube || profile?.linkedin) && (
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

          {/* Location Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Studio Location</h2>
              <p className="text-sm text-gray-600 mt-1">Click on the map to set your studio location</p>
            </div>

            <div className="p-6">
              {editing ? (
                <div className="space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New York"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Zip Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10001"
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
                        placeholder="USA"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Latitude
                      </label>
                      <input
                        type="number"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        step="any"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="40.7128"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Longitude
                      </label>
                      <input
                        type="number"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        step="any"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="-74.0060"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Location information will be displayed here.</p>
                  </div>

                  {profile?.address && (
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium text-gray-900">Address</h3>
                      <p className="text-gray-600">
                        {profile.address}<br />
                        {profile.city}, {profile.state} {profile.zipCode}<br />
                        {profile.country}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
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
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
      </div>
    </div>
  )
} 