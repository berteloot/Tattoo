import { useState, useEffect } from 'react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
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
          {artists.map((artist) => (
            <Marker
              key={artist.id}
              position={{
                lat: artist.latitude || center.lat,
                lng: artist.longitude || center.lng
              }}
              onClick={() => setSelectedArtist(artist)}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#ef4444" stroke="white" stroke-width="2"/>
                    <path d="M20 8L24.5 15.5L32 16L26 21.5L27.5 29L20 25.5L12.5 29L14 21.5L8 16L15.5 15.5L20 8Z" fill="white"/>
                  </svg>
                `),
                scaledSize: { width: 40, height: 40 }
              }}
            />
          ))}

          {selectedArtist && (
            <InfoWindow
              position={{
                lat: selectedArtist.latitude || center.lat,
                lng: selectedArtist.longitude || center.lng
              }}
              onCloseClick={() => setSelectedArtist(null)}
            >
              <div className="p-2 max-w-xs">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {selectedArtist.user.firstName[0]}{selectedArtist.user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedArtist.user.firstName} {selectedArtist.user.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedArtist.studioName}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-1 text-sm">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-gray-700">
                      {selectedArtist.averageRating || 'New'} 
                      {selectedArtist.reviewCount > 0 && ` (${selectedArtist.reviewCount} reviews)`}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">
                      ${selectedArtist.hourlyRate}/hr
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {selectedArtist.city}, {selectedArtist.state}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedArtist.specialties?.slice(0, 3).map((specialty) => (
                      <span
                        key={specialty.id}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                      >
                        {specialty.name}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => {
                      window.location.href = `/artists/${selectedArtist.id}`
                    }}
                    className="w-full mt-3 px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  )
} 