import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { 
  useArtistProfile, 
  useArtistFlash, 
  useArtistReviews, 
  useSpecialties, 
  useServices 
} from '../hooks/useDashboardQueries'
import { api, artistsAPI } from '../services/api'
import ProfilePictureUpload from '../components/ProfilePictureUpload'
import { MessageManagement } from '../components/MessageManagement'
import StudioSelect from '../components/StudioSelect'
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
  Building
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
    error: flashError 
  } = useArtistFlash(artistId)
  
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

  // Handle errors gracefully
  if (profileError) {
    console.error('Error loading artist profile:', profileError)
  }
  
  if (flashError) {
    console.error('Error loading flash items:', flashError)
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

  // Loading state
  const isLoading = profileLoading || flashLoading || reviewsLoading || specialtiesLoading || servicesLoading

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
                    <Camera className="h-4 w-4 mr-2" />
                    Gallery
                  </button>
                  
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Settings
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
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, calendlyUrl: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="facebook.com/username"
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
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="State"
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
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, minPrice: e.target.value }))}
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
                      onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Profile Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      // If studio is selected, ensure studio data is included in profile
                      let profileDataToSave = { ...formData };
                      
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
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verification Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.verificationStatus === 'APPROVED' 
                      ? 'bg-green-100 text-green-800'
                      : profile.verificationStatus === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.verificationStatus || 'PENDING'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reviews</h3>
              
              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.slice(0, 3).map((review) => (
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
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
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
                  <Camera className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-purple-800 font-medium">Manage Gallery</span>
                </button>
                
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-blue-800 font-medium">Profile Settings</span>
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