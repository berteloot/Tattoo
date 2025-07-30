import { useState, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { MapPin, Star, Clock, DollarSign, Users, Map } from 'lucide-react'
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

  useEffect(() => {
    // Check API health first
    checkApiHealth().then(() => {
      fetchArtists()
    })
  }, [])

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
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
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

                <button
                  onClick={() => {
                    window.location.href = `/artists/${selectedArtist.id}`;
                    setSelectedArtist(null);
                  }}
                  className="w-full mt-2 px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors"
                >
                  View Profile
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
        )}
      </LoadScript>
    </div>
  )
} 