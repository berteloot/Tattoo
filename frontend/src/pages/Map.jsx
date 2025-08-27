import { StudioMap } from '../components/StudioMap'
import { MapPin, Search, Filter, X, Phone, Mail, ExternalLink } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Link } from 'react-router-dom'

const Map = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFeatured, setFilterFeatured] = useState(false)
  const [focusStudioId, setFocusStudioId] = useState(null)
  const [focusCoordinates, setFocusCoordinates] = useState(null)
  const [cityFocusCoordinates, setCityFocusCoordinates] = useState(null)
  const [searchParams] = useSearchParams()
  const [selectedStudio, setSelectedStudio] = useState(null)

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

  const handleGetDirections = (studio) => {
    if (studio && studio.lat && studio.lng) {
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer();
      const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: studio.lat, lng: studio.lng },
        zoom: 15,
      });
      directionsRenderer.setMap(map);

      const request = {
        origin: focusCoordinates || cityFocusCoordinates || { lat: 0, lng: 0 }, // Use current focus or default to 0,0
        destination: { lat: studio.lat, lng: studio.lng },
        travelMode: google.maps.TravelMode.DRIVING,
      };

      directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    } else {
      alert('Studio does not have coordinates for directions.');
    }
  };

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
        <div className="border-2 border-black p-4">
          <StudioMap 
            searchTerm={searchTerm} 
            filterFeatured={filterFeatured} 
            focusStudioId={focusStudioId}
            focusCoordinates={focusCoordinates}
            cityFocusCoordinates={cityFocusCoordinates}
            onStudioClick={(studio) => setSelectedStudio(studio)}
          />
        </div>
      </div>
    </div>
  )
}

export default Map 