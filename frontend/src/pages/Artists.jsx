import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Filter, Search, DollarSign } from 'lucide-react'

export const Artists = () => {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [specialties, setSpecialties] = useState([])

  useEffect(() => {
    fetchArtists()
    fetchSpecialties()
  }, [])

  const fetchArtists = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/artists?limit=20`)
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

  const fetchSpecialties = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/specialties`)
      const data = await response.json()
      
      if (data.success) {
        setSpecialties(data.data)
      }
    } catch (error) {
      console.error('Error fetching specialties:', error)
    }
  }

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.studioName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpecialty = !selectedSpecialty || 
                            artist.specialties?.some(s => s.name === selectedSpecialty)
    
    return matchesSearch && matchesSpecialty
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tattoo Artists</h1>
        <p className="text-gray-600">
          Discover talented tattoo artists in Montreal. Filter by specialty, location, and more.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search artists, studios, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="md:w-64">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Specialties</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.name}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredArtists.length} of {artists.length} artists
        </p>
      </div>

      {/* Artists Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtists.map((artist) => (
          <div key={artist.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <div className="text-white text-6xl">
                {artist.user.firstName[0]}{artist.user.lastName[0]}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">
                {artist.user.firstName} {artist.user.lastName}
              </h3>
              <p className="text-gray-600 mb-3">{artist.studioName}</p>
              
              <div className="flex items-center space-x-2 mb-3">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm text-gray-600">
                  {artist.averageRating || 'New'} 
                  {artist.reviewCount > 0 && ` (${artist.reviewCount} reviews)`}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {artist.city}, {artist.state}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  ${artist.hourlyRate}/hr
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {artist.specialties?.slice(0, 3).map((specialty) => (
                  <span
                    key={specialty.id}
                    className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                  >
                    {specialty.name}
                  </span>
                ))}
                {artist.specialties?.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{artist.specialties.length - 3} more
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {artist.bio}
              </p>
              
              <Link
                to={`/artists/${artist.id}`}
                className="w-full block text-center bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
              >
                View Profile
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredArtists.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No artists found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or browse all artists.
          </p>
        </div>
      )}
    </div>
  )
} 