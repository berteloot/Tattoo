import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api'
import { MarkerClusterer } from '@react-google-maps/api'
import { MapPin, Star, Users, Map, Navigation, X, ExternalLink, Phone, Mail, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { useGoogleMaps } from '../contexts/GoogleMapsContext'
import GoogleMapsErrorBoundary from './GoogleMapsErrorBoundary'

const mapContainerStyle = {
  width: '100%',
  height: '600px'
}

const center = {
  lat: 45.5017,
  lng: -73.5673
}

export const StudioMapPostgres = ({ searchTerm = '', filterVerified = false, filterFeatured = false, focusStudioId = null, focusCoordinates = null }) => {
  const [studios, setStudios] = useState([])
  const [selectedStudio, setSelectedStudio] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [mapError, setMapError] = useState(false)
  const [mapCenter, setMapCenter] = useState(center)
  const [mapZoom, setMapZoom] = useState(10)
  const [showMessageForm, setShowMessageForm] = useState(false)
  const [viewMode, setViewMode] = useState('map') // 'map' or 'list'
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

  // Fit bounds when studios change
  useEffect(() => {
    if (mapRef.current && studios.length > 0 && isGoogleMapsLoaded) {
      const bounds = new window.google.maps.LatLngBounds()
      studios.forEach(studio => {
        if (studio.latitude && studio.longitude) {
          bounds.extend({ 
            lat: parseFloat(studio.latitude), 
            lng: parseFloat(studio.longitude) 
          })
        }
      })
      
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, { 
          top: 40, 
          right: 40, 
          bottom: 40, 
          left: 40 
        })
      }
    }
  }, [studios, isGoogleMapsLoaded])

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

      if (!import.meta.env.PROD) {
        console.log('Fetching studios for map...')
        console.log('Search params:', Object.fromEntries(params))
      }

      const response = await fetch(`/api/studios?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        const studiosData = result.data.studios || []
        
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
        }
        
        if (!import.meta.env.PROD) {
          console.log('🔍 Studios with coordinates:', studiosWithCoordinates.length)
          console.log('🔍 Total studios processed:', processedStudiosData.length)
        }
      } else {
        console.error('API returned error:', result)
        throw new Error(`API returned error: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error fetching studios for map:', error)
      setStudios([])
      
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
                  <Users className="w-4 h-4 inline mr-1" />
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
                    {studio.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        <Star className="w-3 h-3" />
                        Verified
                      </span>
                    )}
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
              {/* Google Map */}
              <GoogleMap
                ref={mapRef}
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={mapZoom}
                onLoad={(map) => {
                  if (!import.meta.env.PROD) {
                    console.log('✅ Google Map loaded successfully')
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
                <MarkerClusterer>
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
                                <circle cx="16" cy="16" r="16" fill="${studio.isFeatured ? '#F59E0B' : studio.isVerified ? '#10B981' : '#6B7280'}"/>
                                <circle cx="16" cy="16" r="12" fill="white"/>
                                <circle cx="16" cy="16" r="8" fill="${studio.isFeatured ? '#F59E0B' : studio.isVerified ? '#10B981' : '#6B7280'}"/>
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
                            <Mail className="w-3 h-3 text-gray-500" />
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
                        <Link
                          to={`/studios/${selectedStudio.id}`}
                          className="w-full px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors text-center"
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
    </div>
  )
} 