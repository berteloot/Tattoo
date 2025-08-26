import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Filter, Search, DollarSign, Eye, Calendar, Award, Instagram, Globe, Grid, List, Users } from 'lucide-react'
import { FavoriteButton } from '../components/FavoriteButton'
import { artistsAPI, specialtiesAPI } from '../services/api'
import { apiCallWithFallback, checkApiHealth } from '../utils/apiHealth'
import { ArtistMessages } from '../components/ArtistMessage'

export const Artists = () => {
  console.log('Artists component rendering')
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [specialties, setSpecialties] = useState([])
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('rating') // 'rating', 'price', 'name'

  useEffect(() => {
    console.log('Artists component mounted, fetching data...')
    // Fetch data directly without health check
    fetchArtists()
    fetchSpecialties()
  }, [])

  const fetchArtists = async () => {
    try {
      console.log('Fetching artists from API...')
      console.log('API URL:', import.meta.env.VITE_API_URL || '/api')
      
      const response = await artistsAPI.getAll({ limit: 20 })
      console.log('API response:', response)
      
      if (response.data?.success) {
        console.log('Using API artists data')
        setArtists(response.data.data.artists || [])
      } else {
        console.error('API returned error:', response.data)
        setArtists([])
      }
    } catch (error) {
      console.error('Error fetching artists:', error)
      setArtists([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSpecialties = async () => {
    try {
      console.log('Fetching specialties from API...')
      
      const result = await apiCallWithFallback(
        () => specialtiesAPI.getAll(),
        { specialties: getDummySpecialties() }
      )
      
      if (result.isFallback) {
        console.log('Using fallback specialties data')
        setSpecialties(result.data.specialties)
      } else {
        console.log('Using API specialties data')
        setSpecialties(result.data.data.specialties || [])
      }
    } catch (error) {
      console.error('Unexpected error in fetchSpecialties:', error)
      const dummySpecialties = getDummySpecialties()
      setSpecialties(dummySpecialties)
    }
  }

  const getDummyArtists = () => [
    {
      id: '1',
      user: { firstName: 'Sarah', lastName: 'Chen', role: 'ARTIST' },
      studioName: 'Ink & Soul Studio',
      bio: 'Award-winning traditional tattoo artist with 8 years of experience. Specializing in classic American traditional and Japanese styles.',
      city: 'Tokyo',
      state: 'Japan',
      hourlyRate: 120,
      averageRating: 4.9,
      reviewCount: 327,
      specialties: [{ id: '1', name: 'Traditional' }, { id: '2', name: 'Japanese' }],
      isVerified: true,
      featured: true,
      portfolioCount: 145,
      profilePictureUrl: 'https://via.placeholder.com/150'
    },
    {
      id: '2',
      user: { firstName: 'Marcus', lastName: 'Rodriguez', role: 'ARTIST' },
      studioName: 'Black Canvas Tattoo',
      bio: 'Master of black and grey realism. Creating stunning portraits and detailed artwork that tells your story.',
      city: 'Los Angeles',
      state: 'California',
      hourlyRate: 150,
      averageRating: 4.8,
      reviewCount: 289,
      specialties: [{ id: '3', name: 'Black & Grey' }, { id: '4', name: 'Realistic' }],
      isVerified: true,
      featured: true,
      portfolioCount: 89,
      profilePictureUrl: 'https://via.placeholder.com/150'
    },
    {
      id: '3',
      user: { firstName: 'Emma', lastName: 'Thompson', role: 'ARTIST' },
      studioName: 'Simple Lines Studio',
      bio: 'Minimalist tattoo specialist creating elegant, simple designs that speak volumes through simplicity.',
      city: 'London',
      state: 'England',
      hourlyRate: 100,
      averageRating: 4.7,
      reviewCount: 456,
      specialties: [{ id: '5', name: 'Minimalist' }, { id: '6', name: 'Neo-Traditional' }],
      isVerified: true,
      featured: false,
      portfolioCount: 234,
      profilePictureUrl: 'https://via.placeholder.com/150'
    }
  ]

  const getDummySpecialties = () => [
    { id: '1', name: 'Traditional' },
    { id: '2', name: 'Japanese' },
    { id: '3', name: 'Black & Grey' },
    { id: '4', name: 'Realistic' },
    { id: '5', name: 'Minimalist' },
    { id: '6', name: 'Neo-Traditional' },
    { id: '7', name: 'Watercolor' },
    { id: '8', name: 'Geometric' }
  ]

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = !searchTerm || 
      artist.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.studioName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.bio.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSpecialty = !selectedSpecialty || 
      artist.specialties.some(s => s.name === selectedSpecialty)

    return matchesSearch && matchesSpecialty
  })

  const sortedArtists = [...filteredArtists].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0)
      case 'price':
        return (a.hourlyRate || 0) - (b.hourlyRate || 0)
      case 'name':
        return a.user.firstName.localeCompare(b.user.firstName)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="small">DISCOVERING AMAZING ARTISTS...</p>
          <p className="small text-gray-500 mt-2">LOADING FROM API...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <span className="tag tag--yellow">GLOBAL TALENT NETWORK</span>
          <h1>DISCOVER WORLD-CLASS TATTOO ARTISTS</h1>
          <p className="deck">
            Connect with verified artists worldwide, explore diverse styles, and find your perfect artist anywhere on the planet
          </p>

        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Filters and Controls */}
          <div className="border border-gray-200 p-4 sm:p-6 mb-8 md:mb-12 rounded-lg">
            <div className="space-y-4 sm:space-y-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search artists, studios, cities, or countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input w-full pl-12 text-base"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Specialty Filter */}
                <div className="flex-1 sm:min-w-[200px]">
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="input w-full text-base"
                  >
                    <option value="">ALL SPECIALTIES</option>
                    {specialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.name}>
                        {specialty.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div className="flex-1 sm:min-w-[150px]">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input w-full text-base"
                  >
                    <option value="rating">SORT BY RATING</option>
                    <option value="price">SORT BY PRICE</option>
                    <option value="name">SORT BY NAME</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {sortedArtists.length} artist{sortedArtists.length !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedSpecialty && ` in ${selectedSpecialty}`}
            </p>
          </div>

          {/* Artists Grid/List */}
          {sortedArtists.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No artists found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or browse all artists
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedSpecialty('')
                }}
                className="cta"
              >
                CLEAR FILTERS
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'
              : 'space-y-6'
            }>
              {sortedArtists.map((artist) => (
                <div key={artist.id} className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group ${viewMode === 'list' ? 'flex' : ''}`}>
                  {/* Profile Image Section */}
                  <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'h-64'}`}>
                    {artist.profilePictureUrl ? (
                      <img
                        src={artist.profilePictureUrl}
                        alt={`${artist.user.firstName} ${artist.user.lastName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Users className="w-20 h-20 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Featured Badge */}
                    {artist.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          FEATURED
                        </span>
                      </div>
                    )}
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-semibold text-gray-800">
                          {artist.averageRating || 'New'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className={`${viewMode === 'list' ? 'flex-1' : ''} p-6`}>
                    {/* Artist Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {artist.user.firstName} {artist.user.lastName}
                    </h3>

                    {/* Location & Rate */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {artist.city}, {artist.state}
                        </span>
                      </div>
                      {artist.hourlyRate && (
                        <div className="flex items-center gap-1 text-green-600">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold">${artist.hourlyRate}</span>
                          <span className="text-sm text-gray-500">/hr</span>
                        </div>
                      )}
                    </div>

                    {/* Artist Messages */}
                    {artist.messages && artist.messages.length > 0 && (
                      <div className="mb-4">
                        <ArtistMessages messages={artist.messages} variant="card" />
                      </div>
                    )}

                    {/* Bio */}
                    <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                      {artist.bio || "No bio available"}
                    </p>

                    {/* Review Count */}
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>
                        {artist.reviewCount || 0} review{(artist.reviewCount || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {artist.specialties.slice(0, 3).map((specialty, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          {specialty.name}
                        </span>
                      ))}
                      {artist.specialties.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                          +{artist.specialties.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <Link 
                        to={`/artists/${artist.id}`} 
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                      >
                        <Eye className="w-4 h-4" />
                        View Profile
                      </Link>
                      
                      <FavoriteButton artistId={artist.id} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
} 