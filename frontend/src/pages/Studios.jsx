import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Users, ExternalLink, Phone, Mail, Facebook, Instagram, Twitter, Linkedin, Youtube, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const Studios = () => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchStudios(1); // Reset to page 1 when filters change
  }, [filterVerified, filterFeatured]);

  const fetchStudios = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterVerified) params.append('verified', 'true');
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
                checked={filterVerified}
                onChange={(e) => setFilterVerified(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Verified Only</span>
            </label>
            
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
        {studios.map((studio) => (
          <div key={studio.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {studio.title}
              </h3>
              
              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {studio.phoneNumber && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <a href={`tel:${studio.phoneNumber}`} className="hover:text-blue-600">
                      {studio.phoneNumber}
                    </a>
                  </div>
                )}
                {studio.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <a href={`mailto:${studio.email}`} className="hover:text-blue-600">
                      {studio.email}
                    </a>
                  </div>
                )}
              </div>

              {/* Social Media */}
              <div className="flex space-x-3 mb-4">
                {studio.website && (
                  <a
                    href={studio.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                    title="Visit website"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {getSocialIcon('facebook', studio.facebookUrl)}
                {getSocialIcon('instagram', studio.instagramUrl)}
                {getSocialIcon('twitter', studio.twitterUrl)}
                {getSocialIcon('linkedin', studio.linkedinUrl)}
                {getSocialIcon('youtube', studio.youtubeUrl)}
              </div>

              {/* Status & Artists */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {studio._count?.artists || 0} artists
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  {studio.isVerified && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      Verified
                    </span>
                  )}
                  {studio.isFeatured && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Featured
                    </span>
                  )}
                  {studio.claimedBy && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Claimed
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Link
                  to={`/studios/${studio.id}`}
                  className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
                
                {user?.role === 'ARTIST' && !studio.claimedBy && (
                  <button
                    onClick={() => handleClaimStudio(studio.id)}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Claim
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination />

      {studios.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No studios found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Studios; 