import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { 
  Star, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Award,
  TrendingUp
} from 'lucide-react';

const AdminArtistManagement = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [featureReason, setFeatureReason] = useState('');
  const [isFeaturing, setIsFeaturing] = useState(false);
  
  // Filtering and pagination
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    verificationStatus: '',
    isFeatured: '',
    isVerified: ''
  });

  // Debounced filters for API calls
  const [debouncedFilters, setDebouncedFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    verificationStatus: '',
    isFeatured: '',
    isVerified: ''
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch artists
  const fetchArtists = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(debouncedFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/admin/artists?${params}`);
      console.log('Artists API response:', response.data);
      setArtists(response.data.data.artists);
      setPagination(response.data.data.pagination);
    } catch (error) {
      error('Error fetching artists');
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle feature/unfeature artist
  const handleFeatureArtist = async () => {
    if (!selectedArtist) return;
    
    try {
      setIsFeaturing(true);
      const response = await api.put(`/admin/artists/${selectedArtist.id}/feature`, {
        isFeatured: !selectedArtist.isFeatured,
        reason: featureReason
      });
      
      success(`Artist ${selectedArtist.isFeatured ? 'unfeatured' : 'featured'} successfully`);
      setShowFeatureModal(false);
      setSelectedArtist(null);
      setFeatureReason('');
      fetchArtists(); // Refresh the list
    } catch (error) {
      error(error.response?.data?.error || 'Error updating artist feature status');
      console.error('Error featuring artist:', error);
    } finally {
      setIsFeaturing(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Open feature modal
  const openFeatureModal = (artist) => {
    setSelectedArtist(artist);
    setShowFeatureModal(true);
  };

  // Debounce effect for search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters]);

  // Fetch artists when debounced filters change
  useEffect(() => {
    fetchArtists();
  }, [debouncedFilters]);

  // Check if current user is admin
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'SUSPENDED':
        return <UserX className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Artist Management</h1>
          <p className="mt-2 text-gray-600">Manage all artists, verification status, and featuring</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Artists</p>
                <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Featured Artists</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {artists.filter(a => a.isFeatured).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Verified Artists</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {artists.filter(a => a.isVerified).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Verification</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {artists.filter(a => a.verificationStatus === 'PENDING').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              {filters.search && (
                <div className="flex items-center text-sm text-gray-600">
                  <Search className="w-4 h-4 mr-2" />
                  Searching for: "{filters.search}"
                  {filters.search !== debouncedFilters.search && (
                    <div className="ml-2 animate-pulse text-blue-600">(typing...)</div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {filters.search !== debouncedFilters.search && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
                <select
                  value={filters.verificationStatus}
                  onChange={(e) => handleFilterChange('verificationStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured Status</label>
                <select
                  value={filters.isFeatured}
                  onChange={(e) => handleFilterChange('isFeatured', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Artists</option>
                  <option value="true">Featured</option>
                  <option value="false">Not Featured</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verified</label>
                <select
                  value={filters.isVerified}
                  onChange={(e) => handleFilterChange('isVerified', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Artists</option>
                  <option value="true">Verified</option>
                  <option value="false">Not Verified</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Artists List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Artists</h2>
          </div>
          
          {artists.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No artists found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artist
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Studio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Featured
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {artists.map((artist) => (
                      <tr key={artist.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {artist.user.firstName?.[0]}{artist.user.lastName?.[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {artist.user.firstName} {artist.user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{artist.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {artist.studioName || 'No Studio Name'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {artist.city}, {artist.state}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(artist.verificationStatus)}
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(artist.verificationStatus)}`}>
                              {artist.verificationStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {artist.isFeatured ? (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-red-500 fill-current mr-1" />
                              <span className="text-sm text-yellow-800 font-medium">Featured</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Not Featured</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(artist.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openFeatureModal(artist)}
                              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                                artist.isFeatured 
                                  ? 'text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100' 
                                  : 'text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100'
                              }`}
                              title={artist.isFeatured ? 'Unfeature Artist' : 'Feature Artist'}
                            >
                              <Star className={`h-4 w-4 mr-1 ${artist.isFeatured ? 'fill-current' : ''}`} />
                              {artist.isFeatured ? 'Unfeature' : 'Feature'}
                            </button>
                            <button
                              onClick={() => window.open(`/artists/${artist.id}`, '_blank')}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Artist Profile"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {(pagination?.pages || 0) > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => handlePageChange((pagination?.page || 1) - 1)}
                      disabled={(pagination?.page || 1) === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange((pagination?.page || 1) + 1)}
                      disabled={(pagination?.page || 1) === (pagination?.pages || 1)}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(((pagination?.page || 1) - 1) * (pagination?.limit || 20)) + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min((pagination?.page || 1) * (pagination?.limit || 20), pagination?.total || 0)}
                        </span>{' '}
                        of <span className="font-medium">{pagination?.total || 0}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        {Array.from({ length: pagination?.pages || 0 }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === (pagination?.page || 1)
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Feature/Unfeature Modal */}
        {showFeatureModal && selectedArtist && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center mb-4">
                  <Star className={`h-6 w-6 mr-2 ${selectedArtist.isFeatured ? 'text-red-500' : 'text-red-500'}`} />
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedArtist.isFeatured ? 'Unfeature' : 'Feature'} Artist
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to {selectedArtist.isFeatured ? 'unfeature' : 'feature'} <strong>{selectedArtist.user.firstName} {selectedArtist.user.lastName}</strong>?
                  {selectedArtist.isFeatured ? ' This will remove them from the featured artists section.' : ' This will promote them to the featured artists section.'}
                </p>
                <textarea
                  placeholder="Reason for featuring/unfeaturing (optional)"
                  value={featureReason}
                  onChange={(e) => setFeatureReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  rows="3"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowFeatureModal(false);
                      setSelectedArtist(null);
                      setFeatureReason('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFeatureArtist}
                    disabled={isFeaturing}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                      selectedArtist.isFeatured 
                        ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400' 
                        : 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400'
                    }`}
                  >
                    {isFeaturing ? 'Processing...' : (selectedArtist.isFeatured ? 'Unfeature' : 'Feature')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminArtistManagement; 