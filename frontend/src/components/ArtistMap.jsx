import { useState, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { MapPin, Star, Clock, DollarSign, Users, Map } from 'lucide-react'
import { artistsAPI } from '../services/api'

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

  useEffect(() => {
    fetchArtists()
  }, [])

  const fetchArtists = async () => {
    try {
      const response = await artistsAPI.getAll({ limit: 10 })
      
      if (response.data.success) {
        setArtists(response.data.data.artists)
      }
    } catch (error) {
      console.error('Error fetching artists:', error)
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
  console.log('API URL:', import.meta.env.VITE_API_URL)

  // If no API key, show fallback
  if (!googleMapsApiKey) {
    return (
      <div className="w-full">
        {/* Map Placeholder */}
        <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border-2 border-dashed border-blue-300 flex items-center justify-center mb-6">
          <div className="text-center">
            <Map className="w-16 h-16 mx-auto mb-4 text-blue-400" />
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Interactive Map</h3>
            <p className="text-sm text-gray-600 mb-4">
              Google Maps integration requires an API key to be configured.
            </p>
            <div className="bg-white px-4 py-2 rounded-lg border inline-block">
              <span className="text-sm text-gray-600">
                {artists.length} artists available in your area
              </span>
            </div>
          </div>
        </div>

        {/* Artists Grid */}
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Artists ({artists.length})
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>All verified artists</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {artists.map((artist) => (
                <div 
                  key={artist.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => window.location.href = `/artists/${artist.id}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 font-semibold text-sm">
                        {artist.user.firstName[0]}{artist.user.lastName[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {artist.user.firstName} {artist.user.lastName}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">{artist.studioName}</p>
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">
                          {artist.averageRating ? `${artist.averageRating.toFixed(1)} (${artist.reviewCount} reviews)` : 'No reviews yet'}
                        </span>
                      </div>

                      {/* Specialties */}
                      {artist.specialties && artist.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {artist.specialties.slice(0, 2).map((specialty) => (
                            <span 
                              key={specialty.id}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {specialty.name}
                            </span>
                          ))}
                          {artist.specialties.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              +{artist.specialties.length - 2} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Pricing */}
                      {artist.hourlyRate && (
                        <div className="flex items-center space-x-1 mt-2">
                          <DollarSign className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-gray-600">
                            ${artist.hourlyRate}/hr
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
        }}
        onLoad={() => {
          console.log('Google Maps loaded successfully')
        }}
      >
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
          {artists.map((artist) => {
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
      </LoadScript>
    </div>
  )
} 