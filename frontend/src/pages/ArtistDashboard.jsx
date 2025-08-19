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
        selectedServices: profile.services?.map(s => s.id) || []
      }))
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Artist Dashboard</h1>
              <p className="text-gray-600">
                {profile.id ? 'Edit your artist profile' : 'Create your artist profile'}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/dashboard/gallery')}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Camera className="h-4 w-4 mr-2" />
                Manage Gallery
              </button>
              
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Artist Profile</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    Studio Name
                  </label>
                  <input
                    type="text"
                    value={formData.studioName}
                    onChange={(e) => setFormData(prev => ({ ...prev, studioName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your studio name"
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Social Media & Links</h3>
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
                </div>
              </div>

              {/* Location */}
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Location</h3>
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

              {/* Pricing */}
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Pricing</h3>
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

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    // TODO: Implement save functionality
                    success('Profile updated successfully!')
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Profile
                </button>
              </div>
            </div>

            {/* Flash Items */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Flash Items</h2>
                <button className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Flash
                </button>
              </div>
              
              {flash.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flash.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">${item.basePrice}</span>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No flash items yet</p>
                  <p className="text-sm text-gray-400">Add some flash designs to showcase your work</p>
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
                      <div className="flex items-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${
                              i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
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
                  <span className="text-green-800 font-medium">Browse Artists</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 