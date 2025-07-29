import { useState, useEffect } from 'react'
import { GoogleMap, LoadScript, InfoWindow } from '@react-google-maps/api'
import { MapPin, Star, Clock, DollarSign } from 'lucide-react'

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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/artists?limit=10`)
      const data = await response.json()
      
      if (data.success) {
        setArtists(data.data.artists)
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

  // Debug logging
  console.log('Google Maps API Key:', googleMapsApiKey ? 'Present' : 'Missing');
  console.log('Environment variables:', import.meta.env);

  if (!googleMapsApiKey) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            <MapPin className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
            <p className="text-sm text-gray-600 mb-4">
              Google Maps integration requires an API key to be configured.
            </p>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium mb-2">Available Artists ({artists.length})</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {artists.map((artist) => (
                  <div key={artist.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">
                        {artist.user.firstName[0]}{artist.user.lastName[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">
                        {artist.user.firstName} {artist.user.lastName}
                      </h5>
                      <p className="text-xs text-gray-600">{artist.studioName}</p>
                    </div>
                    <button
                      onClick={() => window.location.href = `/artists/${artist.id}`}
                      className="px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <LoadScript googleMapsApiKey={googleMapsApiKey}>
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
          {/* Note: Markers are temporarily disabled due to Google Maps API deprecation */}
          {/* Artists are shown in the fallback list below when no API key is provided */}

          {/* InfoWindow removed - using fallback list instead */}
        </GoogleMap>
      </LoadScript>
    </div>
  )
} 