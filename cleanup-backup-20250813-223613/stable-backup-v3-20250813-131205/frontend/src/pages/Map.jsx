import { StudioMap } from '../components/StudioMap'
import { MapPin, Search, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

const Map = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterVerified, setFilterVerified] = useState(false)
  const [filterFeatured, setFilterFeatured] = useState(false)
  const [focusStudioId, setFocusStudioId] = useState(null)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check if there's a studio ID in the URL params
    const studioId = searchParams.get('studio')
    if (studioId) {
      setFocusStudioId(studioId)
    }
  }, [searchParams])

  const handleSearch = (e) => {
    e.preventDefault()
    // Clear focus when searching
    setFocusStudioId(null)
    // TODO: Implement search functionality for map
    console.log('Searching for:', searchTerm)
    console.log('Filters:', { verified: filterVerified, featured: filterFeatured })
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
                      placeholder="Search studios..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filterVerified}
                        onChange={(e) => setFilterVerified(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Verified Only</span>
                    </label>
                    
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
          <StudioMap searchTerm={searchTerm} filterVerified={filterVerified} filterFeatured={filterFeatured} focusStudioId={focusStudioId} />
        </div>
        
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
            <li>• Click on any studio marker to see details and get directions</li>
            <li>• Use the "Get Directions" feature to find the best route</li>
            <li>• Studios with coordinates are shown on the map</li>
            <li>• Studios without coordinates need geocoding to appear on map</li>
            <li>• Verified studios are marked with a green badge</li>
            <li>• Featured studios are highlighted with a yellow badge</li>
            <li>• Use the search bar to find specific studios by name</li>
            <li>• Filter by verified or featured studios using the checkboxes</li>
            <li>• Click the map pin on a studio page to focus on that studio</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Map 