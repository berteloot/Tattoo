import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api'
import { MapPin, Star, Clock, Users, Map, Navigation, X, Search, ExternalLink, Phone, Mail, MessageSquare, List } from 'lucide-react'
import { Link } from 'react-router-dom'
import { apiCallWithFallback, checkApiHealth } from '../utils/apiHealth'
import { StudioMessageForm } from './StudioMessageForm'
import { useToast } from '../contexts/ToastContext'
import GoogleMapsErrorBoundary from './GoogleMapsErrorBoundary'

const mapContainerStyle = {
  width: '100%',
  height: '600px'
}

const center = {
  lat: 45.5017,
  lng: -73.5673
}

export const StudioMap = ({ searchTerm = '', filterVerified = false, filterFeatured = false, focusStudioId = null, focusCoordinates = null }) => {
  const [studios, setStudios] = useState([])
  const [selectedStudio, setSelectedStudio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [directions, setDirections] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [isGettingDirections, setIsGettingDirections] = useState(false)
  const [directionsInfo, setDirectionsInfo] = useState(null)
  const [showDirectionsForm, setShowDirectionsForm] = useState(false)
  const [fromAddress, setFromAddress] = useState('')
  const [geocoder, setGeocoder] = useState(null)
  const [mapCenter, setMapCenter] = useState(center)
  const [mapZoom, setMapZoom] = useState(10)
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [viewMode, setViewMode] = useState('map') // 'map' or 'list'
  const [googleMapsServices, setGoogleMapsServices] = useState(null)
  const directionsService = useRef(null)
  const directionsRenderer = useRef(null)
  const { error: showError } = useToast()

  // Memoize the search parameters to prevent unnecessary re-renders
  const searchParams = useMemo(() => ({
    searchTerm,
    filterVerified,
    filterFeatured,
    focusStudioId
  }), [searchTerm, filterVerified, filterFeatured, focusStudioId])

  // Initialize Google Maps services only once
  const initializeGoogleMapsServices = useCallback(() => {
    if (window.google?.maps && !googleMapsServices) {
      try {
        const services = {
          DirectionsService: new window.google.maps.DirectionsService(),
          DirectionsRenderer: new window.google.maps.DirectionsRenderer(),
          Geocoder: new window.google.maps.Geocoder()
        }
        setGoogleMapsServices(services)
        directionsService.current = services.DirectionsService
        directionsRenderer.current = services.DirectionsRenderer
        console.log('✅ Google Maps services initialized successfully')
      } catch (error) {
        console.error('❌ Failed to initialize Google Maps services:', error)
        setMapError(true)
      }
    }
  }, [googleMapsServices])

  // Cleanup function to prevent memory leaks
  const cleanupGoogleMapsServices = useCallback(() => {
    if (googleMapsServices) {
      try {
        if (directionsRenderer.current) {
          directionsRenderer.current.setMap(null)
        }
        setGoogleMapsServices(null)
        directionsService.current = null
        directionsRenderer.current = null
      } catch (error) {
        console.warn('Warning during Google Maps cleanup:', error)
      }
    }
  }, [googleMapsServices])

  // Initialize Google Maps services when loaded
  useEffect(() => {
    if (googleMapsLoaded && !googleMapsServices) {
      initializeGoogleMapsServices()
    }
  }, [googleMapsLoaded, googleMapsServices, initializeGoogleMapsServices])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupGoogleMapsServices()
    }
  }, [cleanupGoogleMapsServices])

  // Reset Google Maps loaded state when search parameters change
  useEffect(() => {
    setGoogleMapsLoaded(false)
  }, [searchParams])

  useEffect(() => {
    // Check API health first
    checkApiHealth().then(() => {
      fetchStudios()
    })
  }, [filterVerified, filterFeatured, focusStudioId])

  // Debounced search effect
  useEffect(() => {
    if (searchTerm !== undefined) {
      setSearching(true)
      const timeoutId = setTimeout(() => {
        fetchStudios()
      }, 500) // 500ms delay

      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm])

  // Retry function for error boundary
  const handleMapRetry = () => {
    setGoogleMapsLoaded(false)
    setMapError(false)
    // Force a re-render of the LoadScript component
    setTimeout(() => {
      setGoogleMapsLoaded(false)
    }, 100)
  }

  // Focus on specific studio when focusStudioId changes
  useEffect(() => {
    if (focusStudioId && studios.length > 0) {
      const focusStudio = studios.find(s => s.id === focusStudioId)
      if (focusStudio && focusStudio.latitude && focusStudio.longitude) {
        setMapCenter({
          lat: focusStudio.latitude,
          lng: focusStudio.longitude
        })
        setMapZoom(15)
        setSelectedStudio(focusStudio)
      }
    }
  }, [focusStudioId, studios])

  // Focus on specific coordinates when focusCoordinates changes
  useEffect(() => {
    if (focusCoordinates) {
      setMapCenter(focusCoordinates)
      setMapZoom(15)
      // Clear any selected studio when focusing on coordinates
      setSelectedStudio(null)
    }
  }, [focusCoordinates])

    // Initialize directions service and geocoder when map loads
  const onMapLoad = (map) => {
    // Only initialize if Google Maps is fully loaded
    if (googleMapsLoaded && window.google && window.google.maps) {
      try {
        // Additional safety check - ensure all required services are available
        if (!window.google.maps.DirectionsService || !window.google.maps.DirectionsRenderer || !window.google.maps.Geocoder) {
          console.warn('Google Maps services not fully loaded yet, retrying...')
          setTimeout(() => {
            if (googleMapsLoaded) {
              onMapLoad(map)
            }
          }, 200)
          return
        }

        directionsService.current = new window.google.maps.DirectionsService()
        directionsRenderer.current = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true, // We'll handle our own markers
          polylineOptions: {
            strokeColor: '#3B82F6',
            strokeWeight: 6,
            strokeOpacity: 0.9
          },
          suppressInfoWindows: false
        })
        directionsRenderer.current.setMap(map)
        
        // Initialize geocoder for address lookup
        setGeocoder(new window.google.maps.Geocoder())
        
        console.log('✅ Google Maps services initialized successfully')
      } catch (error) {
        console.error('Error initializing Google Maps services:', error)
        // Don't retry on error, just log it
      }
    } else {
      console.warn('Google Maps API not fully loaded yet, retrying...')
      // Retry after a short delay
      setTimeout(() => {
        if (googleMapsLoaded) {
          onMapLoad(map)
        }
      }, 100)
    }
  }

  // Get user's current location (optional)
  const getUserLocation = () => {
    if (!googleMapsLoaded) {
      alert('Please wait for the map to fully load before getting your location.')
      return null
    }
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return null
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          resolve(location)
        },
        (error) => {
          console.error('Error getting location:', error)
          reject(error)
        }
      )
    })
  }

  // Geocode address to coordinates
  const geocodeAddress = async (address) => {
    if (!googleMapsLoaded || !geocoder) return null

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location
          resolve({
            lat: location.lat(),
            lng: location.lng()
          })
        } else {
          reject(new Error(`Geocoding failed: ${status}`))
        }
      })
    })
  }

  // Get directions to selected studio
  const getDirections = async (studio, originAddress = null) => {
    if (!googleMapsLoaded || !directionsService.current) {
      alert('Directions service not available. Please wait for the map to fully load.')
      return
    }

    if (!studio.latitude || !studio.longitude) {
      alert('Studio location not available')
      return
    }

    // Additional safety check for Google Maps API
    if (!window.google || !window.google.maps) {
      alert('Google Maps not ready. Please wait for the map to fully load.')
      return
    }

    setIsGettingDirections(true)

    try {
      let origin
      
      if (originAddress) {
        // Geocode the address
        const geocodedOrigin = await geocodeAddress(originAddress)
        if (!geocodedOrigin) {
          throw new Error('Could not find the starting address')
        }
        origin = geocodedOrigin
      } else if (userLocation) {
        origin = userLocation
      } else {
        // Get user's current location
        const location = await getUserLocation()
        if (!location) {
          throw new Error('Could not get your current location')
        }
        origin = location
      }

      const request = {
        origin,
        destination: {
          lat: parseFloat(studio.latitude),
          lng: parseFloat(studio.longitude)
        },
        travelMode: window.google.maps.TravelMode.DRIVING
      }

      const result = await directionsService.current.route(request)
      setDirections(result)
      
      // Extract route information
      const route = result.routes[0]
      const leg = route.legs[0]
      
      setDirectionsInfo({
        distance: leg.distance.text,
        duration: leg.duration.text,
        startAddress: leg.start_address,
        endAddress: leg.end_address
      })

      // Display the route on the map
      if (directionsRenderer.current) {
        console.log('🎯 Displaying route on map:', result)
        directionsRenderer.current.setDirections(result)
      } else {
        console.error('❌ DirectionsRenderer not available')
      }

      // Fit map to show entire route - with safety check
      if (window.google && window.google.maps) {
        const bounds = new window.google.maps.LatLngBounds()
        bounds.extend(origin)
        bounds.extend({
          lat: parseFloat(studio.latitude),
          lng: parseFloat(studio.longitude)
        })
        
        // Get map instance and fit to bounds
        if (directionsRenderer.current && directionsRenderer.current.getMap()) {
          directionsRenderer.current.getMap().fitBounds(bounds)
        }
      }
    } catch (error) {
      console.error('Error getting directions:', error)
      alert('Unable to get directions. Please check your address and try again.')
    } finally {
      setIsGettingDirections(false)
      setShowDirectionsForm(false)
    }
  }

  // Clear directions
  const clearDirections = () => {
    setDirections(null)
    setDirectionsInfo(null)
    setShowDirectionsForm(false)
    setFromAddress('')
    if (directionsRenderer.current) {
      directionsRenderer.current.setDirections({ routes: [] })
    }
  }

  // Handle directions form submission
  const handleDirectionsSubmit = (e) => {
    e.preventDefault()
    if (!fromAddress.trim()) {
      alert('Please enter a starting address')
      return
    }
    getDirections(selectedStudio, fromAddress.trim())
  }

  const fetchStudios = async () => {
    try {
      console.log('Fetching studios for map...')
      console.log('Search params:', { searchTerm, filterVerified, filterFeatured, focusStudioId })
      
      let response
      
      // If focusing on a specific studio, fetch just that studio
      if (focusStudioId) {
        response = await fetch(`/api/studios/${focusStudioId}`)
      } else {
        // Build query parameters for all studios
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (filterVerified) params.append('verified', 'true')
        if (filterFeatured) params.append('featured', 'true')
        params.append('all', 'true') // Fetch all studios for map display
        
        response = await fetch(`/api/studios?${params.toString()}`)
      }
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          console.log('Using geocoded studios data for map')
          console.log('🔍 Full API response:', result)
          console.log('🔍 Data structure:', result.data)
          
          let studiosData = []
          
          // Handle different response structures
          if (focusStudioId) {
            // Single studio response - result.data is the studio object
            if (result.data && result.data.id) {
              studiosData = [result.data]
            }
          } else {
            // Multiple studios response - result.data.studios is the array
            studiosData = result.data?.studios || []
          }
          
          console.log('🔍 Studios array:', studiosData)
          console.log('Studios with coordinates:', studiosData.length || 0)
          console.log('Stats:', { 
            total: studiosData.length || 0,
            withCoordinates: studiosData.filter(s => s.hasCoordinates)?.length || 0,
            withoutCoordinates: studiosData.filter(s => !s.hasCoordinates)?.length || 0
          })
          
          // Add default values for missing fields to prevent errors
          const processedStudiosData = studiosData.map(studio => ({
            ...studio,
            phoneNumber: studio.phoneNumber || null,
            email: studio.email || null,
            website: studio.website || null,
            isVerified: studio.isVerified || false,
            isFeatured: studio.isFeatured || false,
            _count: {
              artists: studio._count?.studioArtists || 0
            }
          }))
          
          // Filter out studios without coordinates for map display
          const studiosWithCoordinates = processedStudiosData.filter(studio => studio.hasCoordinates)
          setStudios(studiosWithCoordinates)
          
          // Log studios that need geocoding
          const studiosNeedingGeocoding = studiosData.filter(studio => !studio.hasCoordinates)
          if (studiosNeedingGeocoding.length > 0) {
            console.log('🔍 Studios needing geocoding:', studiosNeedingGeocoding.map(s => s.title))
            console.log('🔍 First studio sample:', {
              title: studiosNeedingGeocoding[0]?.title,
              hasCoordinates: studiosNeedingGeocoding[0]?.hasCoordinates,
              latitude: studiosNeedingGeocoding[0]?.latitude,
              longitude: studiosNeedingGeocoding[0]?.longitude,
              address: studiosNeedingGeocoding[0]?.address
            })
          }
          
          console.log('🔍 Studios with coordinates:', studiosWithCoordinates.length)
          console.log('🔍 Total studios processed:', processedStudiosData.length)
        } else {
          console.error('API returned error:', result)
          throw new Error(`Geocoding API returned error: ${result.error || 'Unknown error'}`)
        }
      } else {
        console.error('API request failed:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response body:', errorText)
        throw new Error(`Geocoding API request failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error fetching geocoded studios for map:', error)
      console.log('Failed to fetch studios from database')
      
      // Don't use dummy data - either show error or empty state
      setStudios([])
      
      // Show user-friendly error message with retry option
      showError(
        'Failed to load studios',
        'Unable to load studios from database. Please try again.'
      )
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (searching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching for studios...</p>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">Searching for: "{searchTerm}"</p>
          )}
        </div>
      </div>
    )
  }

  // Show message if no studios loaded
  if (!studios || studios.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Studios Found</h3>
          <p className="text-gray-500 mb-4">Unable to load studios from the database</p>
          <button 
            onClick={() => fetchStudios()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Loading Studios
          </button>
        </div>
      </div>
    )
  }

  // Check if Google Maps API key is available
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  
  // Debug: Log API key status (without exposing the actual key)
  console.log('Google Maps API Key available:', !!googleMapsApiKey)
  console.log('API Key length:', googleMapsApiKey?.length || 0)
  console.log('Environment:', import.meta.env.MODE)

  // If no API key, show fallback
  if (!googleMapsApiKey) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Unavailable</h3>
          <p className="text-gray-500 mb-4">Google Maps API key not configured</p>
          <div className="space-y-2">
            {(studios || []).map((studio) => (
              <div key={studio.id} className="bg-white p-3 rounded border">
                <h4 className="font-medium">{studio.title}</h4>
                <p className="text-sm text-gray-600">
                  {studio.address}, {studio.city}, {studio.state}
                </p>
                {studio.latitude && studio.longitude && (
                  <p className="text-xs text-gray-500">
                    📍 {studio.latitude}, {studio.longitude}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Search Results Header */}
      {(searchTerm || filterVerified || filterFeatured) && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {searchTerm && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    "{searchTerm}"
                  </span>
                )}
                {filterVerified && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    Verified Only
                  </span>
                )}
                {filterFeatured && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    Featured Only
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'map'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Map className="w-4 h-4 inline mr-1" />
                  Map
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="w-4 h-4 inline mr-1" />
                  List
                </button>
              </div>
              
              <div className="text-sm text-gray-500">
                {studios.length} studio{studios.length !== 1 ? 's' : ''} found
              </div>
              {(searchTerm || filterVerified || filterFeatured) && (
                <button
                  onClick={() => {
                    // Reset search state
                    if (typeof window !== 'undefined') {
                      // Clear URL parameters
                      const url = new URL(window.location)
                      url.searchParams.delete('search')
                      url.searchParams.delete('verified')
                      url.searchParams.delete('featured')
                      window.history.replaceState({}, '', url)
                    }
                    // Trigger parent component to clear search
                    window.dispatchEvent(new CustomEvent('clearMapSearch'))
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Studio List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg border border-gray-200 mb-4">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Studio List View
            </h3>
            <p className="text-sm text-gray-600">
              Browse all {studios.length} studio{studios.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {studios.map((studio) => (
              <div key={studio.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {studio.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {studio.isVerified && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Verified
                          </span>
                        )}
                        {studio.isFeatured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <p className="flex items-center gap-1 mb-1">
                        <MapPin className="w-4 h-4" />
                        {studio.address}, {studio.city}, {studio.state} {studio.zipCode}
                      </p>
                      {studio.phoneNumber && (
                        <p className="flex items-center gap-1 mb-1">
                          <Phone className="w-4 h-4" />
                          <a 
                            href={`tel:${studio.phoneNumber}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {studio.phoneNumber}
                          </a>
                        </p>
                      )}
                      {studio.email && (
                        <p className="flex items-center gap-1 mb-1">
                          <Mail className="w-4 h-4" />
                          <button
                            onClick={() => {
                              setSelectedStudio(studio)
                              setShowMessageForm(true)
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Send Message
                          </button>
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{studio._count?.studioArtists || 0} artists</span>
                      </div>
                      {studio.latitude && studio.longitude && (
                        <button
                          onClick={() => {
                            setViewMode('map')
                            setMapCenter({
                              lat: parseFloat(studio.latitude),
                              lng: parseFloat(studio.longitude)
                            })
                            setMapZoom(15)
                            setSelectedStudio(studio)
                          }}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Map className="w-3 h-3" />
                          Show on Map
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      to={`/studios/${studio.id}`}
                      className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    
                    {studio.latitude && studio.longitude && (
                      <button
                        onClick={() => {
                          setSelectedStudio(studio)
                          setShowDirectionsForm(true)
                          setFromAddress('')
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <Navigation className="w-4 h-4" />
                        Directions
                      </button>
                    )}
                    
                    {studio.website && (
                      <a
                        href={studio.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors text-center flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <LoadScript 
          googleMapsApiKey={googleMapsApiKey}
          onError={(error) => {
            console.error('Google Maps failed to load:', error)
            // Show fallback when Google Maps fails
            setMapError(true)
          }}
          onLoad={() => {
            console.log('Google Maps loaded successfully')
            setMapError(false)
            setGoogleMapsLoaded(true)
          }}
        >
        {mapError ? (
          <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Unavailable</h3>
              <p className="text-gray-500 mb-4">Google Maps failed to load</p>
              <p className="text-sm text-gray-400">Domain may need to be authorized in Google Cloud Console</p>
              <div className="mt-4 space-y-2">
                {(studios || []).map((studio) => (
                  <div key={studio.id} className="bg-white p-3 rounded border">
                    <h4 className="font-medium">{studio.title}</h4>
                    <p className="text-sm text-gray-600">
                      {studio.address}, {studio.city}, {studio.state}
                    </p>
                    {studio.latitude && studio.longitude && (
                      <p className="text-xs text-gray-500">
                        📍 {studio.latitude}, {studio.longitude}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : !googleMapsLoaded ? (
          <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Map...</h3>
              <p className="text-gray-500">Please wait while Google Maps initializes</p>
            </div>
          </div>
        ) : (
          <GoogleMapsErrorBoundary 
            onRetry={handleMapRetry}
            fallback={
              <div className="w-full h-96 bg-gray-100 rounded-lg p-4 overflow-y-auto">
                <div className="text-center mb-4">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Unavailable</h3>
                  <p className="text-gray-500">Showing studio list instead</p>
                </div>
                <div className="space-y-2">
                  {(studios || []).map((studio) => (
                    <div key={studio.id} className="bg-white p-3 rounded border">
                      <h4 className="font-medium">{studio.title}</h4>
                      <p className="text-sm text-gray-600">
                        {studio.address}, {studio.city}, {studio.state}
                      </p>
                      {studio.latitude && studio.longitude && (
                        <p className="text-xs text-gray-500">
                          📍 {studio.latitude}, {studio.longitude}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {studio.isVerified && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Verified
                          </span>
                        )}
                        {studio.isFeatured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <div className="relative">
              {/* Directions Form Modal */}
              {showDirectionsForm && (
                <div className="absolute top-4 left-4 z-20 bg-white rounded-lg shadow-xl p-6 max-w-sm border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Get Directions</h4>
                    <button
                      onClick={() => setShowDirectionsForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleDirectionsSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Address
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={fromAddress}
                          onChange={(e) => setFromAddress(e.target.value)}
                          placeholder="Enter your starting address..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">To: <strong>{selectedStudio?.title}</strong></p>
                      <p className="text-xs text-gray-500">
                        {selectedStudio?.address}, {selectedStudio?.city}, {selectedStudio?.state}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        disabled={isGettingDirections}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isGettingDirections ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
                            <span>Getting Directions...</span>
                          </>
                        ) : (
                          <>
                            <Navigation className="w-4 h-4" />
                            <span>Get Directions</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => getDirections(selectedStudio)}
                        disabled={isGettingDirections}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        title="Use my current location"
                      >
                        📍
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Directions Info Panel */}
              {directionsInfo && (
                <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4 max-w-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Route to Studio</h4>
                    <button
                      onClick={clearDirections}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Navigation className="w-4 h-4 text-primary-600" />
                      <span className="text-gray-600">{directionsInfo.distance}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-primary-600" />
                      <span className="text-gray-600">{directionsInfo.duration}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">From: {directionsInfo.startAddress}</p>
                      <p className="text-xs text-gray-500">To: {directionsInfo.endAddress}</p>
                    </div>
                  </div>
                </div>
              )}

              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={mapZoom}
                onLoad={onMapLoad}
                options={{
                  styles: [
                    {
                      featureType: 'poi',
                      elementType: 'labels',
                      stylers: [{ visibility: 'off' }]
                    }
                  ]
                }}
              >
              {/* User Location Marker */}
              {userLocation && googleMapsServices && (
                <Marker
                  position={userLocation}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new window.google.maps.Size(30, 30)
                  }}
                  title="Your Location"
                />
              )}

              {/* Studio Markers */}
              {googleMapsServices && (studios || []).map((studio) => {
                // Only show studios with coordinates
                if (!studio.latitude || !studio.longitude) return null;
                
                return (
                  <Marker
                    key={studio.id}
                    position={{ lat: parseFloat(studio.latitude), lng: parseFloat(studio.longitude) }}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                      scaledSize: new window.google.maps.Size(25, 25)
                    }}
                    title={studio.title}
                    onClick={() => setSelectedStudio(studio)}
                  />
                );
              })}

              {selectedStudio && (
                <InfoWindow
                  position={{
                    lat: parseFloat(selectedStudio.latitude),
                    lng: parseFloat(selectedStudio.longitude)
                  }}
                  onCloseClick={() => setSelectedStudio(null)}
                >
                  <div className="p-2 max-w-xs">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {selectedStudio.title}
                    </h3>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <p>{selectedStudio.address}</p>
                      <p>{selectedStudio.city}, {selectedStudio.state} {selectedStudio.zipCode}</p>
                    </div>
                    
                    {/* Contact Info */}
                    <div className="space-y-1 mb-2">
                      {selectedStudio.phoneNumber && (
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <a 
                            href={`tel:${selectedStudio.phoneNumber}`}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            {selectedStudio.phoneNumber}
                          </a>
                        </div>
                      )}
                      {selectedStudio.email && (
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3 text-gray-500" />
                          <button
                            onClick={() => setShowMessageForm(true)}
                            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Send Message
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {selectedStudio.isVerified && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Verified
                        </span>
                      )}
                      {selectedStudio.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Featured
                        </span>
                      )}
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          {selectedStudio._count?.studioArtists || 0} artists
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => {
                          setShowDirectionsForm(true)
                          setFromAddress('')
                        }}
                        className="w-full px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Get Directions</span>
                      </button>
                      
                      <Link
                        to={`/studios/${selectedStudio.id}`}
                        className="w-full px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors text-center"
                        onClick={() => setSelectedStudio(null)}
                      >
                        View Details
                      </Link>
                      
                      {selectedStudio.website && (
                        <a
                          href={selectedStudio.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors text-center flex items-center justify-center space-x-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Visit Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}
              </GoogleMap>
            </div>
          </GoogleMapsErrorBoundary>
        )}
        </LoadScript>
      )}
      
      {/* Studio Message Form */}
      <StudioMessageForm
        studio={selectedStudio}
        isOpen={showMessageForm}
        onClose={() => setShowMessageForm(false)}
      />
    </div>
  )
} 