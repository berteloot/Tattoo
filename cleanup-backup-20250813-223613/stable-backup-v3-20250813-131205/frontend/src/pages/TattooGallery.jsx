import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Filter, Search, Grid, List, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api, galleryAPI } from '../services/api';

const TattooGallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    style: '',
    location: '',
    featured: false,
    beforeAfter: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false
  });

  const { user } = useAuth();
  const { error, warning } = useToast();
  const navigate = useNavigate();

  // Tattoo styles and locations for filtering
  const tattooStyles = [
    'Traditional American',
    'Japanese (Irezumi)',
    'Black & Grey',
    'Realistic',
    'Neo-Traditional',
    'Watercolor',
    'Geometric',
    'Minimalist',
    'Tribal',
    'New School'
  ];

  const bodyLocations = [
    'Arm',
    'Leg',
    'Back',
    'Chest',
    'Shoulder',
    'Forearm',
    'Thigh',
    'Calf',
    'Ribcage',
    'Full Sleeve',
    'Half Sleeve',
    'Hand',
    'Foot',
    'Neck',
    'Face'
  ];

  const fetchGalleryItems = async (reset = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.limit,
        offset: reset ? 0 : pagination.offset,
        ...filters
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await galleryAPI.getAll(params);
      
      if (response.data.success) {
        if (reset) {
          setGalleryItems(response.data.data.items);
          setPagination(prev => ({
            ...prev,
            offset: 0,
            total: response.data.data.pagination.total,
            hasMore: response.data.data.pagination.hasMore
          }));
        } else {
          setGalleryItems(prev => [...prev, ...response.data.data.items]);
          setPagination(prev => ({
            ...prev,
            offset: prev.offset + prev.limit,
            total: response.data.data.pagination.total,
            hasMore: response.data.data.pagination.hasMore
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching gallery items:', err);
      error('Error', 'Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems(true);
  }, [filters, searchTerm]);

  const handleLike = async (itemId) => {
    if (!user) {
      warning('Login Required', 'Please login to like gallery items');
      return;
    }

    try {
      const response = await galleryAPI.like(itemId);
      if (response.data.success) {
        setGalleryItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { 
                  ...item, 
                  _count: { 
                    ...item._count, 
                    likes: response.data.liked 
                      ? item._count.likes + 1 
                      : item._count.likes - 1 
                  },
                  userLiked: response.data.liked
                }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      error('Error', 'Failed to update like');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      style: '',
      location: '',
      featured: false,
      beforeAfter: false
    });
    setSearchTerm('');
  };

  const GalleryCard = ({ item }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative group">
        <img
          src={item.thumbnailUrl || item.imageUrl}
          alt={item.title}
          className="w-full h-64 object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-4">
            <button
              onClick={() => navigate(`/gallery/${item.id}`)}
              className="bg-white text-gray-800 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
        {item.isFeatured && (
          <div className="absolute top-2 right-2">
            <Star className="w-6 h-6 text-yellow-400 fill-current" />
          </div>
        )}
        {item.isBeforeAfter && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
            Before/After
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {item.title}
        </h3>
        
        {item.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mb-3">
          {item.tattooStyle && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
              {item.tattooStyle}
            </span>
          )}
          {item.bodyLocation && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {item.bodyLocation}
            </span>
          )}
          {item.colorType && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              {item.colorType}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleLike(item.id)}
              className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                item.userLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`w-4 h-4 ${item.userLiked ? 'fill-current' : ''}`} />
              <span>{item._count.likes}</span>
            </button>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{item._count.comments}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{item._count.views}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-semibold text-gray-800">
              {item.artist?.user?.firstName} {item.artist?.user?.lastName}
            </div>
            {item.hoursSpent && (
              <div className="text-xs">
                {item.hoursSpent}h work
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const GalleryList = ({ item }) => (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex space-x-4">
        <img
          src={item.thumbnailUrl || item.imageUrl}
          alt={item.title}
          className="w-32 h-32 object-cover rounded-lg"
          loading="lazy"
        />
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {item.isFeatured && <Star className="w-5 h-5 text-yellow-400 fill-current" />}
              {item.isBeforeAfter && (
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  Before/After
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {item.tattooStyle && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                {item.tattooStyle}
              </span>
            )}
            {item.bodyLocation && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                {item.bodyLocation}
              </span>
            )}
            {item.colorType && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                {item.colorType}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <button
                onClick={() => handleLike(item.id)}
                className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                  item.userLiked ? 'text-red-500' : ''
                }`}
              >
                <Heart className={`w-4 h-4 ${item.userLiked ? 'fill-current' : ''}`} />
                <span>{item._count.likes}</span>
              </button>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{item._count.comments}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{item._count.views}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold text-gray-800">
                {item.artist?.user?.firstName} {item.artist?.user?.lastName}
              </div>
              {item.hoursSpent && (
                <div className="text-xs text-gray-500">
                  {item.hoursSpent}h work
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tattoo Gallery</h1>
          <p className="text-gray-600">
            Discover amazing tattoo artwork from talented artists
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search gallery items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* View Mode and Filter Toggle */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tattoo Style
                  </label>
                  <select
                    value={filters.style}
                    onChange={(e) => handleFilterChange('style', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Styles</option>
                    {tattooStyles.map(style => (
                      <option key={style} value={style}>{style}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Location
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">All Locations</option>
                    {bodyLocations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) => handleFilterChange('featured', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured Only</span>
                  </label>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.beforeAfter}
                      onChange={(e) => handleFilterChange('beforeAfter', e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Before/After</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gallery Grid/List */}
        {loading && galleryItems.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎨</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gallery items found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {galleryItems.map(item => (
                <div key={item.id} onClick={() => navigate(`/gallery/${item.id}`)}>
                  {viewMode === 'grid' ? <GalleryCard item={item} /> : <GalleryList item={item} />}
                </div>
              ))}
            </div>

            {/* Load More */}
            {pagination.hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => fetchGalleryItems(false)}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TattooGallery; 