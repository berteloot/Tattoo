import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api'
import { MarkerClusterer } from '@react-google-maps/api'
import { MapPin, Star, Clock, Users, Map, Navigation, X, Search, ExternalLink, Phone, Mail, MessageSquare, List } from 'lucide-react'
import { Link } from 'react-router-dom'

import { StudioMessageForm } from './StudioMessageForm'
import { useToast } from '../contexts/ToastContext'
import { useGoogleMaps } from '../contexts/GoogleMapsContext'
import GoogleMapsErrorBoundary from './GoogleMapsErrorBoundary'
import { api } from '../services/api'

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
  const [googleMapsServices, setGoogleMapsServices] = useState(null)
  const [viewMode, setViewMode] = useState('map') // 'map' or 'list'
  const [isMapReady, setIsMapReady] = useState(false)
  const [componentError, setComponentError] = useState(false)
  const directionsService = useRef(null)
  const directionsRenderer = useRef(null)
  const mapRef = useRef(null)
  const { error: showError } = useToast()
  const { isLoaded: isGoogleMapsLoaded, loadError: googleMapsLoadError, hasApiKey } = useGoogleMaps()

  // Memoize the search parameters to prevent unnecessary re-renders
  const searchParams = useMemo(() => ({
    searchTerm,
    filterVerified,
    filterFeatured,
    focusStudioId
  }), [searchTerm, filterVerified, filterFeatured, focusStudioId])

  // Error boundary for component crashes
  if (componentError) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Component Error</h3>
          <p className="text-gray-500 mb-4">Something went wrong with the map component</p>
          <button 
            onClick={() => setComponentError(false)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

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
        if (!import.meta.env.PROD) {
          console.log('✅ Google Maps services initialized successfully')
        }
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
    try {
      if (isGoogleMapsLoaded && !googleMapsServices) {
        initializeGoogleMapsServices()
      }
    } catch (error) {
      console.error('Error initializing Google Maps services:', error)
      setComponentError(true)
    }
  }, [isGoogleMapsLoaded, googleMapsServices, initializeGoogleMapsServices])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupGoogleMapsServices()
    }
  }, [cleanupGoogleMapsServices])

  // Reset Google Maps loaded state when search parameters change
  useEffect(() => {
    // This is now handled by the context
  }, [searchParams])

  // Fit bounds when studios change
  useEffect(() => {
    if (isMapReady && studios.length > 0) {
      fitBoundsToStudios()
    }
  }, [studios, isMapReady])

  const fitBoundsToStudios = () => {
    if (!mapRef.current || !studios.length || !isMapReady) return
    
    try {
      const bounds = new window.google.maps.LatLngBounds()
      studios.forEach(studio => {
        if (studio.latitude && studio.longitude) {
          bounds.extend({ 
            lat: parseFloat(studio.latitude), 
            lng: parseFloat(studio.longitude) 
          })
        }
      })
      
      if (!bounds.isEmpty() && mapRef.current && typeof mapRef.current.fitBounds === 'function') {
        mapRef.current.fitBounds(bounds, { 
          top: 40, 
          right: 40, 
          bottom: 40, 
          left: 40 
        })
      }
    } catch (error) {
      console.warn('Error fitting bounds to studios:', error)
    }
  }

  useEffect(() => {
    fetchStudios()
  }, [filterVerified, filterFeatured, focusStudioId])

  // Debounced search effect
  useEffect(() => {
    if (searchTerm !== undefined) {
      setSearching(true)
      const timeoutId = setTimeout(() => {
        fetchStudios()
      }, 300) // 300ms debounce

      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm])

  // Focus on specific studio if provided
  useEffect(() => {
    if (focusStudioId && studios.length > 0) {
      const studio = studios.find(s => s.id === focusStudioId)
      if (studio && studio.latitude && studio.longitude) {
        setMapCenter({
          lat: parseFloat(studio.latitude),
          lng: parseFloat(studio.longitude)
        })
        setMapZoom(15)
        setSelectedStudio(studio)
      }
    }
  }, [focusStudioId, studios])

  // Focus on specific coordinates if provided
  useEffect(() => {
    if (focusCoordinates && focusCoordinates.lat && focusCoordinates.lng) {
      setMapCenter(focusCoordinates)
      setMapZoom(15)
    }
  }, [focusCoordinates])

  const fetchStudios = async () => {
    try {
      setSearching(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterVerified) params.append('verified', 'true')
      if (filterFeatured) params.append('featured', 'true')
      params.append('all', 'true')

      console.log('Fetching studios for map...')
      console.log('Search params:', Object.fromEntries(params))

      const response = await api.get(`/studios?${params.toString()}`)
      const result = response.data

      if (result.success) {
        const studiosData = result.data.studios || []
        
        console.log('🔍 Raw studios data:', studiosData)
        console.log('🔍 Result structure:', result)
        
        // Process studios data
        const processedStudiosData = studiosData.map(studio => ({
          ...studio,
          hasCoordinates: !!(studio.latitude && studio.longitude)
        }))
        
        // Filter out studios without coordinates for map display
        const studiosWithCoordinates = processedStudiosData.filter(studio => studio.hasCoordinates)
        setStudios(studiosWithCoordinates)
        
        // Log studios that need geocoding
        const studiosNeedingGeocoding = studiosData.filter(studio => !studio.hasCoordinates)
        if (studiosNeedingGeocoding.length > 0 && !import.meta.env.PROD) {
          console.log('🔍 Studios needing geocoding:', studiosNeedingGeocoding.map(s => s.title))
          console.log('🔍 First studio sample:', {
            title: studiosNeedingGeocoding[0]?.title,
            hasCoordinates: studiosNeedingGeocoding[0]?.hasCoordinates,
            latitude: studiosNeedingGeocoding[0]?.latitude,
            longitude: studiosNeedingGeocoding[0]?.longitude,
            address: studiosNeedingGeocoding[0]?.address
          })
        }
        
        if (!import.meta.env.PROD) {
          console.log('🔍 Studios with coordinates:', studiosWithCoordinates.length)
          console.log('🔍 Total studios processed:', processedStudiosData.length)
        }
      } else {
        console.error('API returned error:', result)
        throw new Error(`Geocoding API returned error: ${result.error || 'Unknown error'}`)
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

  const handleMapRetry = () => {
    setMapError(false)
    fetchStudios()
  }

  const handleDirectionsSubmit = async (e) => {
    e.preventDefault()
    if (!selectedStudio || !fromAddress.trim()) return
    
    try {
      setIsGettingDirections(true)
      
      // Geocode the from address
      if (!geocoder) {
        setGeocoder(new window.google.maps.Geocoder())
        return
      }
      
      const geocodeResult = await geocoder.geocode({ address: fromAddress })
      if (geocodeResult.results.length === 0) {
        showError('Invalid address', 'Please enter a valid address')
        return
      }
      
      const fromLocation = geocodeResult.results[0].geometry.location
      
      // Get directions
      const directionsResult = await directionsService.current.route({
        origin: fromLocation,
        destination: {
          lat: parseFloat(selectedStudio.latitude),
          lng: parseFloat(selectedStudio.longitude)
        },
        travelMode: window.google.maps.TravelMode.DRIVING
      })
      
      if (directionsResult.routes.length > 0) {
        const route = directionsResult.routes[0]
        const leg = route.legs[0]
        
        setDirections(directionsResult)
        setDirectionsInfo({
          distance: leg.distance.text,
          duration: leg.duration.text,
          startAddress: leg.start_address,
          endAddress: leg.end_address
        })
        
        // Render directions on map
        if (directionsRenderer.current) {
          directionsRenderer.current.setMap(mapRef.current)
          directionsRenderer.current.setDirections(directionsResult)
        }
        
        setShowDirectionsForm(false)
      }
    } catch (error) {
      console.error('Error getting directions:', error)
      showError('Directions Error', 'Failed to get directions. Please try again.')
    } finally {
      setIsGettingDirections(false)
    }
  }

  const getDirections = async (studio) => {
    if (!navigator.geolocation) {
      showError('Geolocation not supported', 'Your browser does not support geolocation')
      return
    }
    
    try {
      setIsGettingDirections(true)
      
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })
      
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      
      setUserLocation(userLocation)
      
      // Get directions from user location
      const directionsResult = await directionsService.current.route({
        origin: userLocation,
        destination: {
          lat: parseFloat(studio.latitude),
          lng: parseFloat(studio.longitude)
        },
        travelMode: window.google.maps.TravelMode.DRIVING
      })
      
      if (directionsResult.routes.length > 0) {
        const route = directionsResult.routes[0]
        const leg = route.legs[0]
        
        setDirections(directionsResult)
        setDirectionsInfo({
          distance: leg.distance.text,
          duration: leg.duration.text,
          startAddress: 'Your current location',
          endAddress: leg.end_address
        })
        
        // Render directions on map
        if (directionsRenderer.current) {
          directionsRenderer.current.setMap(mapRef.current)
          directionsRenderer.current.setDirections(directionsResult)
        }
      }
    } catch (error) {
      console.error('Error getting directions from current location:', error)
      showError('Directions Error', 'Failed to get directions from your location')
    } finally {
      setIsGettingDirections(false)
    }
  }

  const clearDirections = () => {
    setDirections(null)
    setDirectionsInfo(null)
    if (directionsRenderer.current) {
      directionsRenderer.current.setMap(null)
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
                    setSearchTerm('')
                    setFilterVerified(false)
                    setFilterFeatured(false)
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {studios.map((studio) => (
            <div key={studio.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{studio.title}</h3>

                    {studio.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>
                  
                  {studio.address && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{studio.address}, {studio.city}, {studio.state}</span>
                    </div>
                  )}
                  
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
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        !hasApiKey ? (
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
        ) : googleMapsLoadError ? (
          <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Unavailable</h3>
              <p className="text-gray-500 mb-4">Google Maps failed to load</p>
              <p className="text-sm text-gray-400">Domain may need to be authorized in Google Cloud Console</p>
            </div>
          </div>
        ) : !isGoogleMapsLoaded ? (
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
                  <p className="text-xs text-gray-400 mt-2">Google Maps API key may need domain authorization</p>
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

              {/* Google Map */}
              <GoogleMap
                ref={mapRef}
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={mapZoom}
                onLoad={(map) => {
                  mapRef.current = map
                  setIsMapReady(true)
                  if (!import.meta.env.PROD) {
                    console.log('✅ Google Map loaded successfully')
                  }
                  // Fit bounds if we already have studios data
                  if (studios.length > 0) {
                    // Use setTimeout to ensure map is fully ready
                    setTimeout(() => {
                      fitBoundsToStudios()
                    }, 100)
                  }
                }}
                onError={(error) => {
                  console.error('❌ Google Map error:', error)
                  setMapError(true)
                }}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: true,
                  fullscreenControl: true,
                  gestureHandling: 'cooperative'
                }}
              >
                {/* Studio Markers with Clustering */}
                <MarkerClusterer
                  options={{
                    styles: [
                      {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="20" cy="20" r="20" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
                            <circle cx="20" cy="20" r="16" fill="white"/>
                          </svg>
                        `),
                        width: 40,
                        height: 40,
                        textColor: '#1F2937',
                        textSize: 14,
                        anchor: [20, 20]
                      },
                      {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="25" cy="25" r="25" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
                            <circle cx="25" cy="25" r="20" fill="white"/>
                          </svg>
                        `),
                        width: 50,
                        height: 50,
                        textColor: '#1F2937',
                        textSize: 16,
                        anchor: [25, 25]
                      },
                      {
                        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="30" cy="30" r="30" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
                            <circle cx="30" cy="30" r="24" fill="white"/>
                          </svg>
                        `),
                        width: 60,
                        height: 60,
                        textColor: '#1F2937',
                        textSize: 18,
                        anchor: [30, 30]
                      }
                    ],
                    minimumClusterSize: 2,
                    gridSize: 50,
                    maxZoom: 15
                  }}
                >
                  {(clusterer) =>
                    studios.map((studio) => {
                      if (!studio.latitude || !studio.longitude) return null
                      
                      return (
                        <Marker
                          key={studio.id}
                          clusterer={clusterer}
                          position={{
                            lat: parseFloat(studio.latitude),
                            lng: parseFloat(studio.longitude)
                          }}
                          onClick={() => setSelectedStudio(studio)}
                          icon={{
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="16" cy="16" r="16" fill="${studio.isFeatured ? '#F59E0B' : '#6B7280'}"/>
                                <circle cx="16" cy="16" r="12" fill="white"/>
                                <circle cx="16" cy="16" r="8" fill="${studio.isFeatured ? '#F59E0B' : '#6B7280'}"/>
                              </svg>
                            `),
                            scaledSize: new window.google.maps.Size(32, 32),
                            anchor: new window.google.maps.Point(16, 16)
                          }}
                        />
                      )
                    })
                  }
                </MarkerClusterer>

                {/* User Location Marker */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={{
                      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="12" fill="#3B82F6"/>
                          <circle cx="12" cy="12" r="8" fill="white"/>
                          <circle cx="12" cy="12" r="4" fill="#3B82F6"/>
                        </svg>
                      `),
                      scaledSize: new window.google.maps.Size(24, 24),
                      anchor: new window.google.maps.Point(12, 12)
                    }}
                  />
                )}

                {/* Directions Renderer */}
                {directions && (
                  <DirectionsRenderer
                    directions={directions}
                    options={{
                      suppressMarkers: true,
                      polylineOptions: {
                        strokeColor: '#3B82F6',
                        strokeWeight: 4,
                        strokeOpacity: 0.8
                      }
                    }}
                  />
                )}

                {/* Selected Studio Info Window */}
                {selectedStudio && (
                  <InfoWindow
                    position={{
                      lat: parseFloat(selectedStudio.latitude),
                      lng: parseFloat(selectedStudio.longitude)
                    }}
                    onCloseClick={() => setSelectedStudio(null)}
                  >
                    <div className="p-2 max-w-xs">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {selectedStudio.title}
                      </h3>
                      {selectedStudio.address && (
                        <p className="text-xs text-gray-600 mb-1">
                          {selectedStudio.address}
                        </p>
                      )}
                      {selectedStudio.city && selectedStudio.state && (
                        <p className="text-xs text-gray-500 mb-2">
                          {selectedStudio.city}, {selectedStudio.state} {selectedStudio.zipCode}
                        </p>
                      )}
                      
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
                            <ExternalLink className="w-3 h-4" />
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
        )
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