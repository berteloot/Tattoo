import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Users, ExternalLink, Phone, Mail, Facebook, Instagram, Twitter, Linkedin, Youtube, ChevronLeft, ChevronRight, Star, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ProtectedEmail from '../components/ProtectedEmail';
import SignupPromptModal from '../components/SignupPromptModal';

const Studios = () => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [signupPromptType, setSignupPromptType] = useState('social');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const { user, isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchStudios(1); // Reset to page 1 when filters change
  }, [filterFeatured]);

  const fetchStudios = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterFeatured) params.append('featured', 'true');
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      
      const response = await api.get(`/studios?${params.toString()}`);
      if (response.data && response.data.success) {
        setStudios(response.data.data.studios || []);
        setPagination({
          page: response.data.data.pagination.page,
          limit: response.data.data.pagination.limit,
          total: response.data.data.pagination.total,
          pages: response.data.data.pagination.pages
        });
      } else {
        setStudios([]);
        showError('Failed to load studios', 'Unable to load studios at this time');
      }
    } catch (error) {
      console.error('Failed to fetch studios:', error);
      setStudios([]);
      showError('Failed to load studios', 'Unable to load studios at this time');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimStudio = async (studioId) => {
    try {
      await api.post(`/studios/${studioId}/claim`);
      success('Studio claim request submitted successfully!', 'Your claim request has been submitted and will be reviewed.');
      fetchStudios(pagination.page); // Refresh the current page
    } catch (error) {
      console.error('Failed to claim studio:', error);
      showError('Failed to claim studio', error.response?.data?.error || 'Unable to submit claim request at this time');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudios(1); // Reset to page 1 when searching
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchStudios(newPage);
    }
  };

  const getSocialIcon = (platform, url) => {
    if (!url) return null;
    
    const icons = {
      facebook: <Facebook className="w-4 h-4" />,
      instagram: <Instagram className="w-4 h-4" />,
      twitter: <Twitter className="w-4 h-4" />,
      linkedin: <Linkedin className="w-4 h-4" />,
      youtube: <Youtube className="w-4 h-4" />
    };
    
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-blue-600 transition-colors"
        title={`Visit ${platform}`}
      >
        {icons[platform.toLowerCase()]}
      </a>
    );
  };

  // Pagination component
  const Pagination = () => {
    if (pagination.pages <= 1) return null;

    const startPage = Math.max(1, pagination.page - 2);
    const endPage = Math.min(pagination.pages, pagination.page + 2);
    const pages = [];

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        {/* Page numbers */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              1
            </button>
            {startPage > 2 && (
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
            )}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              page === pagination.page
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < pagination.pages && (
          <>
            {endPage < pagination.pages - 1 && (
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
            )}
            <button
              onClick={() => handlePageChange(pagination.pages)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {pagination.pages}
            </button>
          </>
        )}

        {/* Next button */}
        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.pages}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tattoo Studios</h1>
        <p className="text-gray-600 mb-6">
          Discover and connect with tattoo studios in your area
        </p>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search studios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
          
          <div className="flex gap-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Featured Only</span>
            </label>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {studios.length} of {pagination.total} studios
            {pagination.pages > 1 && ` (Page ${pagination.page} of ${pagination.pages})`}
          </p>
        </div>
      </div>

      {/* Studios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studios.map((studio) => {
          // Debug: Log first studio to see structure
          if (studio.id === studios[0]?.id) {
            console.log('🔍 First studio data:', {
              id: studio.id,
              title: studio.title,
              latitude: studio.latitude,
              longitude: studio.longitude,
              hasCoordinates: studio.hasCoordinates,
              typeLat: typeof studio.latitude,
              typeLng: typeof studio.longitude
            });
          }
          return (
          <div key={studio.id} className="bg-white border-2 border-black overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
            {/* Studio Image */}
            <div className="relative aspect-video overflow-hidden">
              <img
                src={studio.imageUrl || '/default-studio.jpg'}
                alt={studio.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Featured Badge */}
              {studio.isFeatured && (
                <div className="absolute top-3 left-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-semibold">
                  Featured
                </div>
              )}
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                <span className="text-xs font-medium text-gray-700">
                  {studio.status === 'ACTIVE' ? 'Active' : studio.status}
                </span>
              </div>
            </div>

            {/* Studio Info */}
            <div className="p-6 flex-1 flex flex-col">
              {/* Name and Location */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  <Link to={`/studios/${studio.id}`} className="hover:underline">
                    {studio.name}
                  </Link>
                </h3>
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{studio.city}, {studio.country}</span>
                </div>
                {studio.address && (
                  <p className="text-sm text-gray-700">{studio.address}</p>
                )}
              </div>

              {/* Description */}
              {studio.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {studio.description}
                </p>
              )}

              {/* Specialties */}
              {studio.specialties && studio.specialties.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {studio.specialties.slice(0, 3).map((specialty) => (
                      <span
                        key={specialty.id}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
                      >
                        {specialty.name}
                      </span>
                    ))}
                    {studio.specialties.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{studio.specialties.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Rating and Reviews */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (studio.averageRating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {studio.averageRating ? studio.averageRating.toFixed(1) : 'No'} ({studio.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-auto">
                <Link
                  to={`/studios/${studio.id}`}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold text-sm"
                >
                  View Studio
                </Link>
                <button
                  onClick={() => handleFavorite(studio.id)}
                  className={`py-3 px-4 rounded-lg transition-colors flex-shrink-0 ${
                    studio.isFavorited
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${studio.isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {/* Pagination */}
      <Pagination />
      
      {/* Signup Prompt Modal */}
      <SignupPromptModal
        isOpen={showSignupPrompt}
        onClose={() => setShowSignupPrompt(false)}
        featureType={signupPromptType}
      />
    </div>
  );
};

export default Studios; 