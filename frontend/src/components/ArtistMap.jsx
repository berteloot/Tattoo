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

export const ArtistMap = ({ searchTerm = '', filterVerified = false, filterFeatured = false, focusArtistId = null, focusCoordinates = null }) => {
  const [artists, setArtists] = useState([])
  const [selectedArtist, setSelectedArtist] = useState(null)
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
    focusArtistId
  }), [searchTerm, filterVerified, filterFeatured, focusArtistId])

  // Fit bounds when artists change
  useEffect(() => {
    if (mapRef.current && artists.length > 0 && isGoogleMapsLoaded) {
      const bounds = new window.google.maps.LatLngBounds()
      artists.forEach(artist => {
        if (artist.latitude && artist.longitude) {
          bounds.extend({ 
            lat: parseFloat(artist.latitude), 
            lng: parseFloat(artist.longitude) 
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
  }, [artists, isGoogleMapsLoaded])

  useEffect(() => {
    fetchArtists()
  }, [filterVerified, filterFeatured, focusArtistId])

  // Debounced search effect
  useEffect(() => {
    if (searchTerm !== undefined) {
      setSearching(true)
      const timeoutId = setTimeout(() => {
        fetchArtists()
      }, 300) // 300ms debounce

      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm])

  // Focus on specific artist if provided
  useEffect(() => {
    if (focusArtistId && artists.length > 0) {
      const artist = artists.find(a => a.id === focusArtistId)
      if (artist && artist.latitude && artist.longitude) {
        setMapCenter({
          lat: parseFloat(artist.latitude),
          lng: parseFloat(artist.longitude)
        })
        setMapZoom(15)
        setSelectedArtist(artist)
      }
    }
  }, [focusArtistId, artists])

  // Focus on specific coordinates if provided
  useEffect(() => {
    if (focusCoordinates && focusCoordinates.lat && focusCoordinates.lng) {
      setMapCenter(focusCoordinates)
      setMapZoom(15)
    }
  }, [focusCoordinates])

  const fetchArtists = async () => {
    try {
      setSearching(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterVerified) params.append('verified', 'true')
      if (filterFeatured) params.append('featured', 'true')
      params.append('all', 'true')

      if (!import.meta.env.PROD) {
        console.log('Fetching artists for map...')
        console.log('Search params:', Object.fromEntries(params))
      }

      const response = await fetch(`/api/artists?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        const artistsData = result.data.artists || []
        
        // Process artists data
        const processedArtistsData = artistsData.map(artist => ({
          ...artist,
          hasCoordinates: !!(artist.latitude && artist.longitude)
        }))
        
        // Filter out artists without coordinates for map display
        const artistsWithCoordinates = processedArtistsData.filter(artist => artist.hasCoordinates)
        setArtists(artistsWithCoordinates)
        
        // Log artists that need geocoding
        const artistsNeedingGeocoding = artistsData.filter(artist => !artist.hasCoordinates)
        if (artistsNeedingGeocoding.length > 0 && !import.meta.env.PROD) {
          console.log('🔍 Artists needing geocoding:', artistsNeedingGeocoding.map(a => a.user?.firstName + ' ' + a.user?.lastName))
        }
        
        if (!import.meta.env.PROD) {
          console.log('🔍 Artists with coordinates:', artistsWithCoordinates.length)
          console.log('🔍 Total artists processed:', processedArtistsData.length)
        }
      } else {
        console.error('API returned error:', result)
        throw new Error(`API returned error: ${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error fetching artists for map:', error)
      setArtists([])
      
      showError(
        'Failed to load artists',
        'Unable to load artists from database. Please try again.'
      )
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  const handleMapRetry = () => {
    setMapError(false)
    fetchArtists()
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
          <p className="text-gray-600">Searching for artists...</p>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">Searching for: "{searchTerm}"</p>
          )}
        </div>
      </div>
    )
  }

  // Show message if no artists loaded
  if (!artists || artists.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Artists Found</h3>
          <p className="text-gray-500 mb-4">Unable to load artists from the database</p>
          <button 
            onClick={() => fetchArtists()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Loading Artists
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
                {artists.length} artist{artists.length !== 1 ? 's' : ''} found
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
          {artists.map((artist) => (
            <div key={artist.id} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {artist.user?.firstName} {artist.user?.lastName}
                    </h3>
                    {/* Only show verification badge for non-admin users */}
                    {artist.isVerified && artist.user?.role !== 'ADMIN' && artist.user?.role !== 'ARTIST_ADMIN' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        <Star className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {artist.isFeatured && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    )}
                  </div>
                  
                  {artist.address && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      <span>{artist.address}, {artist.city}, {artist.state}</span>
                    </div>
                  )}
                  
                  {artist.bio && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {artist.bio}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {artist.latitude && artist.longitude && (
                      <button
                        onClick={() => {
                          setViewMode('map')
                          setMapCenter({
                            lat: parseFloat(artist.latitude),
                            lng: parseFloat(artist.longitude)
                          })
                          setMapZoom(15)
                          setSelectedArtist(artist)
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
                    to={`/artists/${artist.id}`}
                    className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors text-center"
                  >
                    View Profile
                  </Link>
                  
                  {artist.website && (
                    <a
                      href={artist.website}
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
                {(artists || []).map((artist) => (
                  <div key={artist.id} className="bg-white p-3 rounded border">
                    <h4 className="font-medium">
                      {artist.user?.firstName} {artist.user?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {artist.address}, {artist.city}, {artist.state}
                    </p>
                    {artist.latitude && artist.longitude && (
                      <p className="text-xs text-gray-500">
                        📍 {artist.latitude}, {artist.longitude}
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
                  <p className="text-gray-500">Showing artist list instead</p>
                </div>
                <div className="space-y-2">
                  {(artists || []).map((artist) => (
                    <div key={artist.id} className="bg-white p-3 rounded border">
                      <h4 className="font-medium">
                        {artist.user?.firstName} {artist.user?.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {artist.address}, {artist.city}, {artist.state}
                      </p>
                      {artist.latitude && artist.longitude && (
                        <p className="text-xs text-gray-500">
                          📍 {artist.latitude}, {artist.longitude}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {/* Only show verification badge for non-admin users */}
                        {artist.isVerified && artist.user?.role !== 'ADMIN' && artist.user?.role !== 'ARTIST_ADMIN' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Verified
                          </span>
                        )}
                        {artist.isFeatured && (
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
                {/* Artist Markers with Clustering */}
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
                    artists.map((artist) => {
                      if (!artist.latitude || !artist.longitude) return null
                      
                      return (
                        <Marker
                          key={artist.id}
                          clusterer={clusterer}
                          position={{
                            lat: parseFloat(artist.latitude),
                            lng: parseFloat(artist.longitude)
                          }}
                          onClick={() => setSelectedArtist(artist)}
                          icon={{
                            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="16" cy="16" r="16" fill="${artist.isFeatured ? '#F59E0B' : artist.isVerified ? '#10B981' : '#6B7280'}"/>
                                <circle cx="16" cy="16" r="12" fill="white"/>
                                <circle cx="16" cy="16" r="8" fill="${artist.isFeatured ? '#F59E0B' : artist.isVerified ? '#10B981' : '#6B7280'}"/>
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

                {/* Selected Artist Info Window */}
                {selectedArtist && (
                  <InfoWindow
                    position={{
                      lat: parseFloat(selectedArtist.latitude),
                      lng: parseFloat(selectedArtist.longitude)
                    }}
                    onCloseClick={() => setSelectedArtist(null)}
                  >
                    <div className="p-2 max-w-xs">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {selectedArtist.user?.firstName} {selectedArtist.user?.lastName}
                      </h3>
                      {selectedArtist.address && (
                        <p className="text-xs text-gray-600 mb-1">
                          {selectedArtist.address}
                        </p>
                      )}
                      {selectedArtist.city && selectedArtist.state && (
                        <p className="text-xs text-gray-500 mb-2">
                          {selectedArtist.city}, {selectedArtist.state} {selectedArtist.zipCode}
                        </p>
                      )}
                      
                      {selectedArtist.bio && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {selectedArtist.bio}
                        </p>
                      )}
                      
                      {/* Contact Info */}
                      <div className="space-y-1 mb-2">
                        {selectedArtist.phoneNumber && (
                          <div className="flex items-center space-x-1">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <a 
                              href={`tel:${selectedArtist.phoneNumber}`}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              {selectedArtist.phoneNumber}
                            </a>
                          </div>
                        )}
                        {selectedArtist.email && (
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
                        {/* Only show verification badge for non-admin users */}
                        {selectedArtist.isVerified && selectedArtist.user?.role !== 'ADMIN' && selectedArtist.user?.role !== 'ARTIST_ADMIN' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Verified
                          </span>
                        )}
                        {selectedArtist.isFeatured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2">
                        <Link
                          to={`/artists/${selectedArtist.id}`}
                          className="w-full px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors text-center"
                          onClick={() => setSelectedArtist(null)}
                        >
                          View Profile
                        </Link>
                        
                        {selectedArtist.website && (
                          <a
                            href={selectedArtist.website}
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