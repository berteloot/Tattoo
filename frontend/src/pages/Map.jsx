import { StudioMap } from '../components/StudioMap'
import { MapPin, Search, Filter, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const Map = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFeatured, setFilterFeatured] = useState(false)
  const [focusStudioId, setFocusStudioId] = useState(null)
  const [focusCoordinates, setFocusCoordinates] = useState(null)
  const [cityFocusCoordinates, setCityFocusCoordinates] = useState(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check if there's a studio ID in the URL params
    const studioId = searchParams.get('studio')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    
    if (studioId) {
      setFocusStudioId(studioId)
    }
    
    if (lat && lng) {
      setFocusCoordinates({
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      })
    }
    
    // If city is provided but no coordinates, geocode the city and focus on it
    if (city && !lat && !lng) {
      const citySearch = state ? `${city}, ${state}` : city
      setSearchTerm(citySearch)
      console.log('Focusing on city:', citySearch)
      
      // Geocode the city to get coordinates for focusing
      geocodeCity(citySearch)
    }
  }, [searchParams])

  // Listen for clear search event from StudioMap
  useEffect(() => {
    const handleClearSearch = () => {
      setSearchTerm('')
      setFilterFeatured(false)
      setFocusStudioId(null)
      setFocusCoordinates(null)
    }

    window.addEventListener('clearMapSearch', handleClearSearch)
    return () => window.removeEventListener('clearMapSearch', handleClearSearch)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    // Clear focus when searching
    setFocusStudioId(null)
    setFocusCoordinates(null)
    // Search is handled automatically by the StudioMap component
    console.log('Searching for:', searchTerm)
    console.log('Filters:', { featured: filterFeatured })
  }

  // Geocode a city to get coordinates for focusing
  const geocodeCity = async (cityName) => {
    try {
      // Wait for Google Maps to be loaded
      if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
        console.log('Waiting for Google Maps to load before geocoding city...')
        // Retry after a short delay
        setTimeout(() => geocodeCity(cityName), 1000)
        return
      }
      
      // Use Google Maps Geocoding API
      const geocoder = new window.google.maps.Geocoder()
      const result = await geocoder.geocode({ address: cityName })
      
      if (result.results.length > 0) {
        const location = result.results[0].geometry.location
        const cityCoords = {
          lat: location.lat(),
          lng: location.lng()
        }
        setCityFocusCoordinates(cityCoords)
        console.log('City geocoded successfully:', cityName, cityCoords)
      } else {
        console.warn('Could not geocode city:', cityName)
      }
    } catch (error) {
      console.error('Error geocoding city:', error)
    }
  }

  // Clear search and reset map view
  const handleClearSearch = () => {
    setSearchTerm('')
    setFocusStudioId(null)
    setFocusCoordinates(null)
    setCityFocusCoordinates(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-primary-600" />
                  Studio Map
                </h1>
                <p className="mt-2 text-gray-600">
                  Find tattoo studios near you and get directions
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <form onSubmit={handleSearch} className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search studios by name, city, or address..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-80"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filterFeatured}
                        onChange={(e) => setFilterFeatured(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Featured Only</span>
                    </label>
                  </div>
                  
                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <StudioMap 
            searchTerm={searchTerm} 
            filterFeatured={filterFeatured} 
            focusStudioId={focusStudioId}
            focusCoordinates={focusCoordinates}
            cityFocusCoordinates={cityFocusCoordinates}
          />
        </div>
        
        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">🔍 Search Results</h3>
            <p className="text-blue-800">
              Showing studios matching "<strong>{searchTerm}</strong>"
              {filterFeatured && " (Featured only)"}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Use the filters above to narrow down your search results
            </p>
          </div>
        )}

        {/* Map Legend */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Map Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white"></div>
              <span className="text-sm text-gray-600">Tattoo Studios</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>
              <span className="text-sm text-gray-600">Artist Locations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
              <span className="text-sm text-gray-600">Needs Geocoding</span>
            </div>
          </div>
        </div>
        
        {/* Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Search:</strong> Type studio name, city, or address to find specific studios</li>
            <li>• <strong>Filters:</strong> Use the checkbox to show only featured studios</li>
            <li>• <strong>Map Navigation:</strong> Click on any studio marker to see details and get directions</li>
            <li>• <strong>Directions:</strong> Use the "Get Directions" feature to find the best route</li>
            <li>• <strong>Studio Focus:</strong> Click the map pin on a studio page to focus on that studio</li>
            <li>• <strong>Coordinates:</strong> Studios with coordinates are shown on the map</li>
            <li>• <strong>Status Badges:</strong> Verified studios have green badges, featured studios have purple badges</li>
            <li>• <strong>Clear Search:</strong> Click the X button to clear your search and see all studios</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Map 