import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Filter, Search, DollarSign, Heart, Eye, Calendar, Award, Instagram, Globe } from 'lucide-react'
import { artistsAPI, specialtiesAPI } from '../services/api'

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
    fetchArtists()
    fetchSpecialties()
  }, [])

  const fetchArtists = async () => {
    try {
      const response = await artistsAPI.getAll({ limit: 20 })
      console.log('Artists API response:', response.data)
      if (response.data.success) {
        const artistsData = response.data.data.artists || []
        console.log('Setting artists:', artistsData)
        setArtists(artistsData)
      }
    } catch (error) {
      console.error('Error fetching artists:', error)
      // Fallback to dummy data for demo
      const dummyArtists = getDummyArtists()
      console.log('Using dummy artists:', dummyArtists)
      setArtists(dummyArtists)
    } finally {
      setLoading(false)
    }
  }

  const fetchSpecialties = async () => {
    try {
      const response = await specialtiesAPI.getAll()
      if (response.data.success) {
        setSpecialties(response.data.data.specialties || [])
      }
    } catch (error) {
      console.error('Error fetching specialties:', error)
      // Fallback to dummy data
      setSpecialties(getDummySpecialties())
    }
  }

  const getDummyArtists = () => [
    {
      id: '1',
      user: { firstName: 'Sarah', lastName: 'Chen' },
      studioName: 'Ink & Soul Studio',
      bio: 'Award-winning traditional tattoo artist with 8 years of experience. Specializing in classic American traditional and Japanese styles.',
      city: 'Montreal',
      state: 'Quebec',
      hourlyRate: 120,
      averageRating: 4.9,
      reviewCount: 127,
      specialties: [{ id: '1', name: 'Traditional' }, { id: '2', name: 'Japanese' }],
      isVerified: true,
      featured: true,
      portfolioCount: 45
    },
    {
      id: '2',
      user: { firstName: 'Marcus', lastName: 'Rodriguez' },
      studioName: 'Black Canvas Tattoo',
      bio: 'Master of black and grey realism. Creating stunning portraits and detailed artwork that tells your story.',
      city: 'Montreal',
      state: 'Quebec',
      hourlyRate: 150,
      averageRating: 4.8,
      reviewCount: 89,
      specialties: [{ id: '3', name: 'Black & Grey' }],
      isVerified: true,
      featured: true,
      portfolioCount: 32
    },
    {
      id: '3',
      user: { firstName: 'Emma', lastName: 'Thompson' },
      studioName: 'Simple Lines Studio',
      bio: 'Minimalist tattoo specialist creating elegant, simple designs that speak volumes.',
      city: 'Montreal',
      state: 'Quebec',
      hourlyRate: 100,
      averageRating: 4.7,
      reviewCount: 156,
      specialties: [{ id: '4', name: 'Minimalist' }, { id: '5', name: 'Neo-Traditional' }],
      isVerified: true,
      featured: false,
      portfolioCount: 28
    },
    {
      id: '4',
      user: { firstName: 'David', lastName: 'Kim' },
      studioName: 'Color Flow Tattoo',
      bio: 'Watercolor tattoo artist bringing paintings to life on skin. Specializing in vibrant, flowing designs.',
      city: 'Montreal',
      state: 'Quebec',
      hourlyRate: 130,
      averageRating: 4.6,
      reviewCount: 73,
      specialties: [{ id: '6', name: 'Watercolor' }, { id: '5', name: 'Neo-Traditional' }],
      isVerified: true,
      featured: false,
      portfolioCount: 41
    },
    {
      id: '5',
      user: { firstName: 'Lisa', lastName: 'Tanaka' },
      studioName: 'Dragon\'s Den Tattoo',
      bio: 'Japanese tattoo specialist trained in traditional Irezumi techniques with deep cultural respect.',
      city: 'Montreal',
      state: 'Quebec',
      hourlyRate: 140,
      averageRating: 4.9,
      reviewCount: 94,
      specialties: [{ id: '2', name: 'Japanese' }, { id: '1', name: 'Traditional' }],
      isVerified: true,
      featured: true,
      portfolioCount: 38
    }
  ]

  const getDummySpecialties = () => [
    { id: '1', name: 'Traditional', icon: '🎨' },
    { id: '2', name: 'Japanese', icon: '🐉' },
    { id: '3', name: 'Black & Grey', icon: '⚫' },
    { id: '4', name: 'Minimalist', icon: '📐' },
    { id: '5', name: 'Neo-Traditional', icon: '🌟' },
    { id: '6', name: 'Watercolor', icon: '🎨' }
  ]

  console.log('Current artists state:', artists)
  console.log('Search term:', searchTerm)
  console.log('Selected specialty:', selectedSpecialty)
  
  const filteredAndSortedArtists = artists
    .filter(artist => {
      const matchesSearch = !searchTerm || 
                           artist.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           artist.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           artist.studioName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           artist.city.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSpecialty = !selectedSpecialty || 
                              artist.specialties?.some(s => s.name === selectedSpecialty)
      
      return matchesSearch && matchesSpecialty
    })
    
  console.log('Filtered artists:', filteredAndSortedArtists)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0)
        case 'price':
          return (a.hourlyRate || 0) - (b.hourlyRate || 0)
        case 'name':
          return `${a.user.firstName} ${a.user.lastName}`.localeCompare(`${b.user.firstName} ${b.user.lastName}`)
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Discovering amazing artists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Discover Montreal's Finest Tattoo Artists</h1>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Connect with award-winning artists, explore unique styles, and find the perfect match for your next piece of art
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">{artists.length}+</div>
                <div className="text-primary-200">Verified Artists</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">4.8★</div>
                <div className="text-primary-200">Average Rating</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-primary-200">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search artists, studios, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                />
              </div>
            </div>

            {/* Specialty Filter */}
            <div className="lg:w-64">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.name}>
                    {specialty.icon} {specialty.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              >
                <option value="rating">Top Rated</option>
                <option value="price">Price: Low to High</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 text-lg">
            Showing {filteredAndSortedArtists.length} of {artists.length} artists
          </p>
        </div>

        {/* Artists Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAndSortedArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAndSortedArtists.map((artist) => (
              <ArtistListCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredAndSortedArtists.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-8xl mb-6">🎨</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No artists found</h3>
            <p className="text-gray-600 text-lg mb-8">
              Try adjusting your search criteria or browse all artists.
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedSpecialty('')
              }}
              className="bg-primary-600 text-white px-8 py-3 rounded-xl hover:bg-primary-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const ArtistCard = ({ artist }) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
    {/* Header Image */}
    <div className="relative h-64 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      {artist.featured && (
        <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
          <Award className="w-4 h-4 mr-1" />
          Featured
        </div>
      )}
      {artist.isVerified && (
        <div className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white text-8xl font-bold opacity-20">
          {artist.user.firstName[0]}{artist.user.lastName[0]}
        </div>
      </div>
    </div>

    <div className="p-6">
      {/* Artist Info */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {artist.user.firstName} {artist.user.lastName}
          </h3>
          <p className="text-primary-600 font-semibold">{artist.studioName}</p>
        </div>
        <button className="text-gray-400 hover:text-red-500 transition-colors">
          <Heart className="w-6 h-6" />
        </button>
      </div>

      {/* Rating and Location */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-1">
          <Star className="w-5 h-5 text-yellow-500 fill-current" />
          <span className="font-semibold text-gray-900">{artist.averageRating}</span>
          <span className="text-gray-500">({artist.reviewCount})</span>
        </div>
        <div className="flex items-center space-x-1 text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>{artist.city}, {artist.state}</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center space-x-2 mb-4">
        <DollarSign className="w-5 h-5 text-green-600" />
        <span className="text-lg font-semibold text-gray-900">${artist.hourlyRate}</span>
        <span className="text-gray-500">/hour</span>
      </div>

      {/* Specialties */}
      <div className="flex flex-wrap gap-2 mb-4">
        {artist.specialties?.slice(0, 3).map((specialty) => (
          <span
            key={specialty.id}
            className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full font-medium"
          >
            {specialty.name}
          </span>
        ))}
        {artist.specialties?.length > 3 && (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
            +{artist.specialties.length - 3} more
          </span>
        )}
      </div>

      {/* Bio */}
      <p className="text-gray-600 mb-6 line-clamp-3">
        {artist.bio}
      </p>

      {/* Portfolio Count */}
      <div className="flex items-center space-x-2 mb-6 text-gray-500">
        <Eye className="w-4 h-4" />
        <span>{artist.portfolioCount} portfolio pieces</span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Link
          to={`/artists/${artist.id}`}
          className="flex-1 bg-primary-600 text-white py-3 px-4 rounded-xl hover:bg-primary-700 transition-colors text-center font-semibold"
        >
          View Profile
        </Link>
        <button className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors">
          <Calendar className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
)

const ArtistListCard = ({ artist }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-start space-x-6">
      {/* Avatar */}
      <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center flex-shrink-0">
        <div className="text-white text-3xl font-bold">
          {artist.user.firstName[0]}{artist.user.lastName[0]}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {artist.user.firstName} {artist.user.lastName}
            </h3>
            <p className="text-primary-600 font-semibold mb-2">{artist.studioName}</p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="font-semibold">{artist.averageRating}</span>
                <span className="text-gray-500">({artist.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{artist.city}, {artist.state}</span>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">${artist.hourlyRate}/hr</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {artist.featured && (
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Featured
              </span>
            )}
            {artist.isVerified && (
              <span className="bg-blue-500 text-white p-2 rounded-full">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            <button className="text-gray-400 hover:text-red-500 transition-colors">
              <Heart className="w-6 h-6" />
            </button>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{artist.bio}</p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {artist.specialties?.map((specialty) => (
              <span
                key={specialty.id}
                className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-full font-medium"
              >
                {specialty.name}
              </span>
            ))}
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/artists/${artist.id}`}
              className="bg-primary-600 text-white py-2 px-6 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
            >
              View Profile
            </Link>
            <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-200 transition-colors">
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
) 