import { useState, useEffect, useRef } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api'
import { MapPin, Star, Clock, DollarSign, Users, Map, Navigation, X } from 'lucide-react'
import { artistsAPI } from '../services/api'
import { apiCallWithFallback, checkApiHealth } from '../utils/apiHealth'

const mapContainerStyle = {
  width: '100%',
  height: '500px'
}

const center = {
  lat: 45.5017,
  lng: -73.5673
}

export const ArtistMap = () => {
  const [artists, setArtists] = useState([])
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mapError, setMapError] = useState(false)
  const [directions, setDirections] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [isGettingDirections, setIsGettingDirections] = useState(false)
  const [directionsInfo, setDirectionsInfo] = useState(null)
  const directionsService = useRef(null)
  const directionsRenderer = useRef(null)

  useEffect(() => {
    // Check API health first
    checkApiHealth().then(() => {
      fetchArtists()
    })
  }, [])

  // Initialize directions service when map loads
  const onMapLoad = (map) => {
    if (window.google) {
      directionsService.current = new window.google.maps.DirectionsService()
      directionsRenderer.current = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true, // We'll handle our own markers
        polylineOptions: {
          strokeColor: '#DC2626',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      })
      directionsRenderer.current.setMap(map)
    }
  }

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    setIsGettingDirections(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(location)
        return location
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to get your location. Please check your browser settings.')
        setIsGettingDirections(false)
      }
    )
  }

  // Get directions to selected artist
  const getDirections = async (artist) => {
    if (!directionsService.current || !userLocation) {
      // If no user location, get it first
      const location = await getUserLocation()
      if (!location) return
    }

    if (!artist.latitude || !artist.longitude) {
      alert('Artist location not available')
      return
    }

    setIsGettingDirections(true)

    const request = {
      origin: userLocation,
      destination: {
        lat: parseFloat(artist.latitude),
        lng: parseFloat(artist.longitude)
      },
      travelMode: window.google.maps.TravelMode.DRIVING
    }

    try {
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

      // Fit map to show entire route
      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend(userLocation)
      bounds.extend({
        lat: parseFloat(artist.latitude),
        lng: parseFloat(artist.longitude)
      })
      
      // Get map instance and fit to bounds
      if (directionsRenderer.current && directionsRenderer.current.getMap()) {
        directionsRenderer.current.getMap().fitBounds(bounds)
      }
    } catch (error) {
      console.error('Error getting directions:', error)
      alert('Unable to get directions. Please try again.')
    } finally {
      setIsGettingDirections(false)
    }
  }

  // Clear directions
  const clearDirections = () => {
    setDirections(null)
    setDirectionsInfo(null)
    if (directionsRenderer.current) {
      directionsRenderer.current.setDirections({ routes: [] })
    }
  }

  const getDummyArtists = () => [
    {
      id: '1',
      user: { firstName: 'Sarah', lastName: 'Chen' },
      studioName: 'Ink & Soul Studio',
      city: 'Montreal',
      state: 'Quebec',
      latitude: 45.5017,
      longitude: -73.5673,
      averageRating: 4.9,
      reviewCount: 127,
      specialties: [{ name: 'Traditional' }, { name: 'Japanese' }],
      isVerified: true
    },
    {
      id: '2',
      user: { firstName: 'Marcus', lastName: 'Rodriguez' },
      studioName: 'Black Canvas Tattoo',
      city: 'Montreal',
      state: 'Quebec',
      latitude: 45.5048,
      longitude: -73.5732,
      averageRating: 4.8,
      reviewCount: 89,
      specialties: [{ name: 'Black & Grey' }],
      isVerified: true
    },
    {
      id: '3',
      user: { firstName: 'Emma', lastName: 'Thompson' },
      studioName: 'Simple Lines Studio',
      city: 'Montreal',
      state: 'Quebec',
      latitude: 45.4972,
      longitude: -73.5784,
      averageRating: 4.7,
      reviewCount: 156,
      specialties: [{ name: 'Minimalist' }, { name: 'Neo-Traditional' }],
      isVerified: true
    }
  ]

  const fetchArtists = async () => {
    try {
      console.log('Fetching artists for map...')
      
      const result = await apiCallWithFallback(
        () => artistsAPI.getAll({ limit: 10 }),
        { artists: getDummyArtists() }
      )
      
      if (result.isFallback) {
        console.log('Using fallback artists data for map')
        setArtists(result.data.artists)
      } else {
        console.log('Using API artists data for map')
        setArtists(result.data.data.artists || [])
      }
    } catch (error) {
      console.error('Unexpected error in fetchArtists for map:', error)
      setArtists(getDummyArtists())
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Check if Google Maps API key is available
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  
  // Debug: Log API key status (without exposing the actual key)
  console.log('Google Maps API Key available:', !!googleMapsApiKey)
  console.log('API Key length:', googleMapsApiKey?.length || 0)
  console.log('Environment:', import.meta.env.MODE)
  console.log('API URL:', '/api') // Hardcode since env var not working in production

  // If no API key, show fallback
  if (!googleMapsApiKey) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Unavailable</h3>
          <p className="text-gray-500 mb-4">Google Maps API key not configured</p>
          <div className="space-y-2">
            {(artists || []).map((artist) => (
              <div key={artist.id} className="bg-white p-3 rounded border">
                <h4 className="font-medium">{artist.user.firstName} {artist.user.lastName}</h4>
                <p className="text-sm text-gray-600">{artist.studioName}</p>
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
    )
  }

  return (
    <div className="w-full">
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
                {(artists || []).map((artist) => (
                  <div key={artist.id} className="bg-white p-3 rounded border">
                    <h4 className="font-medium">{artist.user.firstName} {artist.user.lastName}</h4>
                    <p className="text-sm text-gray-600">{artist.studioName}</p>
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
        ) : (
          <div className="relative">
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
              center={center}
              zoom={12}
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
                  scaledSize: window.google?.maps ? new window.google.maps.Size(24, 24) : undefined,
                  anchor: window.google?.maps ? new window.google.maps.Point(12, 12) : undefined
                }}
              />
            )}

            {(artists || []).map((artist) => {
              // Only show artists with coordinates
              if (!artist.latitude || !artist.longitude) return null;
              
              return (
                <Marker
                  key={artist.id}
                  position={{
                    lat: parseFloat(artist.latitude),
                    lng: parseFloat(artist.longitude)
                  }}
                  onClick={() => setSelectedArtist(artist)}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="16" fill="#DC2626"/>
                        <circle cx="16" cy="16" r="12" fill="white"/>
                        <circle cx="16" cy="16" r="8" fill="#DC2626"/>
                      </svg>
                    `),
                    scaledSize: window.google?.maps ? new window.google.maps.Size(32, 32) : undefined,
                    anchor: window.google?.maps ? new window.google.maps.Point(16, 16) : undefined
                  }}
                />
              );
            })}

            {selectedArtist && (
              <InfoWindow
                position={{
                  lat: parseFloat(selectedArtist.latitude),
                  lng: parseFloat(selectedArtist.longitude)
                }}
                onCloseClick={() => setSelectedArtist(null)}
              >
                <div className="p-2 max-w-xs">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {selectedArtist.user.firstName} {selectedArtist.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedArtist.studioName}</p>
                  
                  {selectedArtist.averageRating && (
                    <div className="flex items-center space-x-1 mb-2">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">
                        {selectedArtist.averageRating.toFixed(1)} ({selectedArtist.reviewCount} reviews)
                      </span>
                    </div>
                  )}

                  {selectedArtist.specialties && selectedArtist.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {selectedArtist.specialties.slice(0, 2).map((specialty) => (
                        <span 
                          key={specialty.id}
                          className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                        >
                          {specialty.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {selectedArtist.hourlyRate && (
                    <div className="flex items-center space-x-1 mb-2">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-gray-600">${selectedArtist.hourlyRate}/hr</span>
                    </div>
                  )}

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => {
                        getDirections(selectedArtist)
                        setSelectedArtist(null)
                      }}
                      disabled={isGettingDirections}
                      className="w-full px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                    >
                      {isGettingDirections ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                          <span>Getting Directions...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3 h-3" />
                          <span>Get Directions</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        window.location.href = `/artists/${selectedArtist.id}`;
                        setSelectedArtist(null);
                      }}
                      className="w-full px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
            </GoogleMap>
          </div>
        )}
      </LoadScript>
    </div>
  )
} 