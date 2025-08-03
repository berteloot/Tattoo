import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
        city: 'Montreal'
      },
      style: 'Traditional',
      createdAt: '2024-01-15T10:00:00Z',
      likes: 45,
      views: 234
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
        city: 'Montreal'
      },
      style: 'Black & Grey',
      createdAt: '2024-01-10T14:30:00Z',
      likes: 67,
      views: 456
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
        city: 'Montreal'
      },
      style: 'Minimalist',
      createdAt: '2024-01-12T09:15:00Z',
      likes: 89,
      views: 567
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
        user: { firstName: 'David', lastName: 'Kim' },
        studioName: 'Color Flow Tattoo',
        city: 'Montreal'
      },
      style: 'Watercolor',
      createdAt: '2024-01-08T16:45:00Z',
      likes: 123,
      views: 789
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
        id: '5',
        user: { firstName: 'Lisa', lastName: 'Tanaka' },
        studioName: 'Dragon\'s Den Tattoo',
        city: 'Montreal'
      },
      style: 'Japanese',
      createdAt: '2024-01-05T11:20:00Z',
      likes: 156,
      views: 892
    },
    {
      id: '6',
      title: 'Neo-Traditional Skull',
      description: 'Modern take on traditional skull with bold colors',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      price: 180,
      isAvailable: true,
      tags: ['neo-traditional', 'skull', 'bold', 'modern'],
      artist: {
        id: '1',
        user: { firstName: 'Sarah', lastName: 'Chen' },
        studioName: 'Ink & Soul Studio',
        city: 'Montreal'
      },
      style: 'Neo-Traditional',
      createdAt: '2024-01-03T13:10:00Z',
      likes: 78,
      views: 345
    },
    {
      id: '7',
      title: 'Geometric Wolf',
      description: 'Wolf head with geometric line work and dot shading',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
      price: 140,
      isAvailable: true,
      tags: ['geometric', 'wolf', 'minimalist', 'animal'],
      artist: {
        id: '3',
        user: { firstName: 'Emma', lastName: 'Thompson' },
        studioName: 'Simple Lines Studio',
        city: 'Montreal'
      },
      style: 'Minimalist',
      createdAt: '2024-01-01T15:30:00Z',
      likes: 92,
      views: 478
    },
    {
      id: '8',
      title: 'Floral Mandala',
      description: 'Intricate floral mandala with watercolor effects',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
      price: 200,
      isAvailable: true,
      tags: ['mandala', 'floral', 'watercolor', 'intricate'],
      artist: {
        id: '4',
        user: { firstName: 'David', lastName: 'Kim' },
        studioName: 'Color Flow Tattoo',
        city: 'Montreal'
      },
      style: 'Watercolor',
      createdAt: '2023-12-28T10:45:00Z',
      likes: 134,
      views: 623
    }
  ]

  const styles = [
    'Traditional', 'Japanese', 'Black & Grey', 'Minimalist', 'Watercolor', 'Neo-Traditional'
  ]

  console.log('Current flash items state:', flashItems)
  console.log('Search term:', searchTerm)
  console.log('Selected artist:', selectedArtist)
  console.log('Selected style:', selectedStyle)
  console.log('Price range:', priceRange)
  
  const filteredAndSortedItems = (flashItems || [])
    .filter(item => {
      if (!item) return false
      
      const matchesSearch = !searchTerm || 
                           item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesArtist = !selectedArtist || item.artist?.id === selectedArtist
      const matchesStyle = !selectedStyle || item.style === selectedStyle
      
      const matchesPrice = priceRange === 'all' || 
        (priceRange === 'under100' && item.price < 100) ||
        (priceRange === '100-200' && item.price >= 100 && item.price <= 200) ||
        (priceRange === 'over200' && item.price > 200)
      
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Flash Gallery</h1>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Discover unique flash designs from Montreal's top artists. Ready-to-ink artwork waiting for the perfect canvas.
            </p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">{flashItems.length}+</div>
                <div className="text-purple-200">Flash Designs</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">5</div>
                <div className="text-purple-200">Artists</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">6</div>
                <div className="text-purple-200">Styles</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters and Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search designs, tags, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                />
              </div>
            </div>

            {/* Artist Filter */}
            <div>
              <select
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              >
                <option value="">All Artists</option>
                {(artists || []).map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.user?.firstName} {artist.user?.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Style Filter */}
            <div>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              >
                <option value="">All Styles</option>
                {styles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              >
                <option value="all">All Prices</option>
                <option value="under100">Under $100</option>
                <option value="100-200">$100 - $200</option>
                <option value="over200">Over $200</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              >
                <option value="newest">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="popular">Most Popular</option>
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
                onClick={() => setViewMode('masonry')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'masonry' ? 'bg-white shadow-sm' : 'text-gray-600'
                }`}
              >
                Masonry
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 text-lg">
            Showing {filteredAndSortedItems.length} of {flashItems.length} flash designs
          </p>
        </div>

        {/* Flash Items Grid/Masonry */}
        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {filteredAndSortedItems.map((item) => (
              <FlashCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="columns-1 md:columns-2 xl:columns-3 2xl:columns-4 gap-8">
            {filteredAndSortedItems.map((item) => (
              <div key={item.id} className="break-inside-avoid mb-8">
                <FlashCard item={item} />
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
              className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const FlashCard = ({ item }) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
    {/* Image */}
    <div className="relative aspect-square overflow-hidden">
      <img
        src={item.imageUrl}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{item.views}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">{item.likes || 0} likes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Price Badge */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full font-semibold">
        ${item.price}
      </div>

      {/* Style Badge */}
      <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
        {item.style}
      </div>
    </div>

    <div className="p-6">
      {/* Title and Artist */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{item.artist.studioName}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {item.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
          >
            #{tag}
          </span>
        ))}
        {item.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            +{item.tags.length - 3} more
          </span>
        )}
      </div>

      {/* Artist Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {item.artist.user.firstName[0]}{item.artist.user.lastName[0]}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {item.artist.user.firstName} {item.artist.user.lastName}
            </p>
            <p className="text-sm text-gray-500">{item.artist.city}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">${item.price}</p>
          <p className="text-sm text-gray-500">Ready to ink</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Link
          to={`/artists/${item.artist.id}`}
          className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition-colors text-center font-semibold"
        >
          Book Artist
        </Link>
        <FavoriteButton artistId={item.artist.id} className="bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors" size="w-5 h-5" />
      </div>
    </div>
  </div>
) 