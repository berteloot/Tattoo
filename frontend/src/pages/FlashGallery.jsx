import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Filter, Eye, DollarSign, Tag, Calendar, Star, MapPin, Instagram } from 'lucide-react'
import { FavoriteButton } from '../components/FavoriteButton'
import { flashAPI, artistsAPI } from '../services/api'
import { apiCallWithFallback, checkApiHealth } from '../utils/apiHealth'

export const FlashGallery = () => {
  console.log('FlashGallery component rendering')
  const [flashItems, setFlashItems] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArtist, setSelectedArtist] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [priceRange, setPriceRange] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'masonry'
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'price', 'popular'

  const navigate = useNavigate()

  useEffect(() => {
    console.log('FlashGallery component mounted, fetching data...')
    // Check API health first
    checkApiHealth().then(() => {
      fetchFlashItems()
      fetchArtists()
    })
  }, [])

  const fetchFlashItems = async () => {
    try {
      console.log('Fetching flash items from API...')
      
      const result = await apiCallWithFallback(
        () => flashAPI.getAll({ limit: 50 }),
        { flash: getDummyFlashItems() }
      )
      
      if (result.isFallback) {
        console.log('Using fallback flash items data')
        setFlashItems(result.data.flash)
      } else {
        console.log('Using API flash items data')
        setFlashItems(result.data.data.flash || [])
      }
    } catch (error) {
      console.error('Unexpected error in fetchFlashItems:', error)
      const dummyFlash = getDummyFlashItems()
      setFlashItems(dummyFlash)
    } finally {
      setLoading(false)
    }
  }

  const fetchArtists = async () => {
    try {
      console.log('Fetching artists for flash gallery...')
      
      const result = await apiCallWithFallback(
        () => artistsAPI.getAll({ limit: 20 }),
        { artists: [] }
      )
      
      if (result.isFallback) {
        console.log('Using fallback artists data for flash gallery')
        setArtists(result.data.artists)
      } else {
        console.log('Using API artists data for flash gallery')
        setArtists(result.data.data.artists || [])
      }
    } catch (error) {
      console.error('Unexpected error in fetchArtists:', error)
      setArtists([])
    }
  }

  const getDummyFlashItems = () => [
    {
      id: '1',
      title: 'Traditional Rose',
      description: 'Classic red rose with green leaves in traditional American style',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      price: 120,
      isAvailable: true,
      tags: ['traditional', 'rose', 'red', 'nature'],
      artist: {
        id: '1',
        user: { firstName: 'Sarah', lastName: 'Chen' },
        studioName: 'Ink & Soul Studio',
        city: 'Tokyo'
      },
      style: 'Traditional',
      createdAt: '2024-01-15T10:00:00Z',
      likes: 245,
      views: 1234,
      size: 1.5
    },
    {
      id: '2',
      title: 'Portrait Sketch',
      description: 'Realistic black and grey portrait with dramatic lighting',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      price: 300,
      isAvailable: true,
      tags: ['portrait', 'black-grey', 'realistic', 'dramatic'],
      artist: {
        id: '2',
        user: { firstName: 'Marcus', lastName: 'Rodriguez' },
        studioName: 'Black Canvas Tattoo',
        city: 'Los Angeles'
      },
      style: 'Black & Grey',
      createdAt: '2024-01-10T14:30:00Z',
      likes: 167,
      views: 2456,
      size: 2
    },
    {
      id: '3',
      title: 'Minimalist Mountain',
      description: 'Simple line art mountain range with geometric elements',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      price: 80,
      isAvailable: true,
      tags: ['minimalist', 'mountain', 'nature', 'geometric'],
      artist: {
        id: '3',
        user: { firstName: 'Emma', lastName: 'Thompson' },
        studioName: 'Simple Lines Studio',
        city: 'London'
      },
      style: 'Minimalist',
      createdAt: '2024-01-12T09:15:00Z',
      likes: 189,
      views: 1567,
      size: 1
    },
    {
      id: '4',
      title: 'Watercolor Butterfly',
      description: 'Vibrant watercolor butterfly with flowing colors',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      price: 150,
      isAvailable: true,
      tags: ['watercolor', 'butterfly', 'colorful', 'nature'],
      artist: {
        id: '4',
        user: { firstName: 'Diego', lastName: 'Silva' },
        studioName: 'Amazonia Ink',
        city: 'São Paulo'
      },
      style: 'Watercolor',
      createdAt: '2024-01-08T16:45:00Z',
      likes: 323,
      views: 2789,
      size: 1.2
    },
    {
      id: '5',
      title: 'Japanese Dragon',
      description: 'Traditional Japanese dragon with detailed scales and clouds',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      price: 250,
      isAvailable: true,
      tags: ['japanese', 'dragon', 'traditional', 'mythical'],
      artist: {
        id: '1',
        user: { firstName: 'Sarah', lastName: 'Chen' },
        studioName: 'Ink & Soul Studio',
        city: 'Tokyo'
      },
      style: 'Japanese',
      createdAt: '2024-01-05T11:20:00Z',
      likes: 456,
      views: 3892,
      size: 1.8
    },
    {
      id: '6',
      title: 'Sacred Geometry',
      description: 'Intricate mandala with golden ratio proportions and spiritual symbolism',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      price: 180,
      isAvailable: true,
      tags: ['geometric', 'mandala', 'sacred', 'spiritual'],
      artist: {
        id: '5',
        user: { firstName: 'Amara', lastName: 'Singh' },
        studioName: 'Golden Temple Tattoo',
        city: 'Mumbai'
      },
      style: 'Geometric',
      createdAt: '2024-01-03T13:10:00Z',
      likes: 278,
      views: 2345,
      size: 1.5
    },
    {
      id: '7',
      title: 'Blackwork Wolf',
      description: 'Bold blackwork wolf design with geometric patterns and dotwork details',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      price: 140,
      isAvailable: true,
      tags: ['blackwork', 'wolf', 'geometric', 'animal'],
      artist: {
        id: '6',
        user: { firstName: 'Klaus', lastName: 'Weber' },
        studioName: 'Berlin Blackwork',
        city: 'Berlin'
      },
      style: 'Black & Grey',
      createdAt: '2024-01-01T15:30:00Z',
      likes: 192,
      views: 1478,
      size: 1.2
    },
    {
      id: '8',
      title: 'Neo-Traditional Eagle',
      description: 'Modern interpretation of classic eagle with vibrant colors and bold lines',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      price: 200,
      isAvailable: true,
      tags: ['neo-traditional', 'eagle', 'colorful', 'bold'],
      artist: {
        id: '2',
        user: { firstName: 'Marcus', lastName: 'Rodriguez' },
        studioName: 'Black Canvas Tattoo',
        city: 'Los Angeles'
      },
      style: 'Neo-Traditional',
      createdAt: '2023-12-28T10:45:00Z',
      likes: 334,
      views: 2623,
      size: 1.8
    },
    {
      id: '9',
      title: 'Violette Floral Design',
      description: 'Elegant violette flower arrangement with delicate petals and soft colors',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      price: 160,
      isAvailable: true,
      tags: ['floral', 'violette', 'delicate', 'soft', 'nature'],
      artist: {
        id: '7',
        user: { firstName: 'Violette', lastName: 'Dubois' },
        studioName: 'Paris Ink Studio',
        city: 'Paris'
      },
      style: 'Watercolor',
      createdAt: '2024-01-20T12:00:00Z',
      likes: 189,
      views: 1123,
      size: 1.2
    }
  ]

  const styles = [
    'Traditional', 'Japanese', 'Black & Grey', 'Minimalist', 'Watercolor', 'Neo-Traditional', 'Geometric'
  ]

  console.log('Current flash items state:', flashItems)
  console.log('Search term:', searchTerm)
  console.log('Selected artist:', selectedArtist)
  console.log('Selected style:', selectedStyle)
  console.log('Price range:', priceRange)
  
  const filteredAndSortedItems = (flashItems || [])
    .filter(item => {
      if (!item) return false
      
      // Enhanced search that includes artist names, studio names, and cities
      const matchesSearch = !searchTerm || 
                           item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           item.artist?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.artist?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.artist?.studioName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.artist?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.style?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesArtist = !selectedArtist || item.artist?.id === selectedArtist
      const matchesStyle = !selectedStyle || item.style === selectedStyle
      
      const matchesPrice = priceRange === 'all' || 
        (priceRange === 'under100' && item.price < 100) ||
        (priceRange === '100-200' && item.price >= 100 && item.price <= 200) ||
        (priceRange === 'over200' && item.price > 200)
      
      // Debug logging for search matching
      if (searchTerm && searchTerm.trim() !== '') {
        console.log(`Searching for "${searchTerm}" in item:`, {
          title: item.title,
          description: item.description,
          tags: item.tags,
          artistName: `${item.artist?.user?.firstName} ${item.artist?.user?.lastName}`,
          studioName: item.artist?.studioName,
          city: item.artist?.city,
          style: item.style,
          matchesSearch
        })
      }
      
      return matchesSearch && matchesArtist && matchesStyle && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        case 'price':
          return (a.price || 0) - (b.price || 0)
        case 'popular':
          return (b.likes || 0) - (a.likes || 0)
        default:
          return 0
      }
    })
    
  console.log('Filtered flash items:', filteredAndSortedItems)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing flash designs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <span className="tag tag--yellow">FLASH GALLERY</span>
          <h1>DISCOVER EXCEPTIONAL FLASH DESIGNS</h1>
          <p className="deck">
            Premium ready-to-ink artwork from world-class artists across the globe
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
                    placeholder="Search by design name, artist, studio, city, style, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input w-full pl-12 text-base"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Clear search"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {searchTerm && (
                  <p className="text-sm text-gray-500 mt-2">
                    Search includes: titles, descriptions, tags, artist names, studio names, cities, and styles
                  </p>
                )}
                {!searchTerm && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-2">Try searching for:</p>
                    <div className="flex flex-wrap gap-2">
                      {['rose', 'dragon', 'minimalist', 'traditional', 'Sarah', 'Tokyo', 'Los Angeles', 'watercolor'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setSearchTerm(suggestion)}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Artist Filter */}
                <div className="flex-1 sm:min-w-[200px]">
                  <select
                    value={selectedArtist}
                    onChange={(e) => setSelectedArtist(e.target.value)}
                    className="input w-full text-base"
                  >
                    <option value="">ALL ARTISTS</option>
                    {(artists || []).map((artist) => (
                      <option key={artist.id} value={artist.id}>
                        {artist.user?.firstName} {artist.user?.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Style Filter */}
                <div className="flex-1 sm:min-w-[200px]">
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="input w-full text-base"
                  >
                    <option value="">ALL STYLES</option>
                    {styles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="flex-1 sm:min-w-[150px]">
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="input w-full text-base"
                  >
                    <option value="all">ALL PRICES</option>
                    <option value="under100">UNDER $100</option>
                    <option value="100-200">$100 - $200</option>
                    <option value="over200">OVER $200</option>
                  </select>
                </div>

                {/* Sort By */}
                <div className="flex-1 sm:min-w-[150px]">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input w-full text-base"
                  >
                    <option value="newest">SORT BY NEWEST</option>
                    <option value="price">SORT BY PRICE</option>
                    <option value="popular">SORT BY POPULAR</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('masonry')}
                    className={`px-3 sm:px-4 py-2 text-sm font-medium transition-colors ${
                      viewMode === 'masonry' 
                        ? 'bg-gray-900 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Masonry
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredAndSortedItems.length} of {flashItems.length} flash designs
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedArtist && ` by selected artist`}
              {selectedStyle && ` in ${selectedStyle} style`}
            </p>
          </div>

          {/* Flash Items Grid/Masonry */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredAndSortedItems.map((item) => (
                <FlashCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredAndSortedItems.map((item) => (
                <div key={item.id} className="break-inside-avoid mb-4 sm:mb-6 lg:mb-8">
                  <FlashCard key={item.id} item={item} />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {filteredAndSortedItems.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 text-8xl mb-6">🎨</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No flash designs found</h3>
              <p className="text-gray-600 text-lg mb-8">
                Try adjusting your search criteria or browse all designs.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedArtist('')
                  setSelectedStyle('')
                  setPriceRange('all')
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

const FlashCard = ({ item }) => (
  <div className="bg-white border-2 border-black overflow-hidden">
    {/* Image */}
    <div className="relative group">
      <img
        src={item.imageUrl}
        alt={item.title}
        className="w-full h-64 object-cover"
        loading="lazy"
      />
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-4">
          <button
            onClick={() => navigate(`/artists/${item.artist.id}`)}
            className="bg-white text-gray-800 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Style Badge */}
      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
        {item.style}
      </div>
    </div>
    
    <div className="p-6">
      {/* Title - Full Name Below Image */}
      <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">
        {item.title}
      </h3>
      
      {/* Location/Studio */}
      <div className="flex items-center space-x-2 text-gray-600 mb-3">
        <MapPin className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm truncate">{item.artist.studioName}</span>
      </div>

      {/* Price/Size Details */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {item.size ? `${item.size} inches minimum: ` : 'Price range: '}
          <span className="font-semibold text-gray-900">{item.price}</span>
        </p>
      </div>

      {/* Artist Info and Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate">
            <Link
              to={`/artists/${item.artist.id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
              title={`View ${item.artist.user.firstName} ${item.artist.user.lastName}'s profile`}
              onClick={(e) => e.stopPropagation()}
            >
              {item.artist.user.firstName} {item.artist.user.lastName}
            </Link>
          </p>
          <p className="text-sm text-gray-500">Ready to ink</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Link
          to={`/artists/${item.artist.id}`}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold text-sm"
        >
          Book Artist
        </Link>
        <FavoriteButton 
          artistId={item.artist.id} 
          className="bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0" 
          size="w-4 h-4" 
        />
      </div>
    </div>
  </div>
)