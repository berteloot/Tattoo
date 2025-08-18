import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Star, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Eye,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Calendar,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminStudioManagement = () => {
  const { user } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({});
  
  // Bulk selection states
  const [selectedStudios, setSelectedStudios] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllPages, setSelectAllPages] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [allStudioIds, setAllStudioIds] = useState(new Set());
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    verified: '',
    featured: '',
    status: ''
  });
  
  // Form states
  const [editForm, setEditForm] = useState({});
  const [verifyForm, setVerifyForm] = useState({
    isVerified: true,
    verificationNotes: ''
  });
  const [createForm, setCreateForm] = useState({
    title: '',
    website: '',
    phoneNumber: '',
    email: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    latitude: '',
    longitude: ''
  });

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

  const fetchStudios = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...filters
      });
      
      const response = await api.get(`/admin/studios?${params}`);
      setStudios(response.data.data.studios);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching studios:', error);
      showErrorToast('Error', 'Failed to fetch studios');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudioIds = async () => {
    try {
      const params = new URLSearchParams({
        page: 1,
        limit: 1000, // Get a large number to cover all studios
        ...filters
      });
      
      const response = await api.get(`/admin/studios?${params}`);
      const allIds = new Set(response.data.data.studios.map(studio => studio.id));
      setAllStudioIds(allIds);
      return allIds;
    } catch (error) {
      console.error('Error fetching all studio IDs:', error);
      return new Set();
    }
  };

  useEffect(() => {
    fetchStudios();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleVerifyStudio = async () => {
    try {
      const response = await api.put(`/admin/studios/${selectedStudio.id}/verify`, verifyForm);
      showSuccessToast('Success', response.data.message);
      setShowVerifyModal(false);
      setSelectedStudio(null);
      fetchStudios(pagination.page);
    } catch (error) {
      console.error('Error verifying studio:', error);
      showErrorToast('Error', 'Failed to verify studio');
    }
  };

  const handleFeatureStudio = async (studioId, isFeatured) => {
    try {
      const response = await api.put(`/admin/studios/${studioId}/feature`, { isFeatured });
      showSuccessToast('Success', response.data.message);
      fetchStudios(pagination.page);
    } catch (error) {
      console.error('Error featuring studio:', error);
      showErrorToast('Error', 'Failed to feature studio');
    }
  };

  const handleUpdateStudio = async () => {
    try {
      const response = await api.put(`/admin/studios/${selectedStudio.id}`, editForm);
      showSuccessToast('Success', response.data.message);
      setShowEditModal(false);
      setSelectedStudio(null);
      fetchStudios(pagination.page);
    } catch (error) {
      console.error('Error updating studio:', error);
      showErrorToast('Error', 'Failed to update studio');
    }
  };

  const handleDeactivateStudio = async (studioId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY DELETE this studio? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await api.delete(`/admin/studios/${studioId}`);
      showSuccessToast('Success', response.data.message);
      fetchStudios(pagination.page);
    } catch (error) {
      console.error('Error deleting studio:', error);
      showErrorToast('Error', 'Failed to delete studio');
    }
  };

  const handleCreateStudio = async () => {
    try {
      const response = await api.post('/admin/studios', createForm);
      showSuccessToast('Success', response.data.message);
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        website: '',
        phoneNumber: '',
        email: '',
        facebookUrl: '',
        instagramUrl: '',
        twitterUrl: '',
        linkedinUrl: '',
        youtubeUrl: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        latitude: '',
        longitude: ''
      });
      fetchStudios(pagination.page);
    } catch (error) {
      console.error('Error creating studio:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create studio';
      showErrorToast('Error', errorMessage);
    }
  };

  // Bulk selection functions
  const handleSelectAll = async () => {
    if (selectAllPages) {
      // Deselect all pages
      setSelectedStudios(new Set());
      setSelectAll(false);
      setSelectAllPages(false);
      setShowBulkActions(false);
    } else if (selectAll) {
      // Deselect current page only
      setSelectedStudios(new Set());
      setSelectAll(false);
      setShowBulkActions(false);
    } else {
      // Select current page only
      const currentPageStudioIds = studios.map(studio => studio.id);
      setSelectedStudios(new Set(currentPageStudioIds));
      setSelectAll(true);
      setSelectAllPages(false);
      setShowBulkActions(true);
    }
  };

  const handleSelectAllPages = async () => {
    if (selectAllPages) {
      // Deselect all pages
      setSelectedStudios(new Set());
      setSelectAll(false);
      setSelectAllPages(false);
      setShowBulkActions(false);
    } else {
      // Select all pages
      const allIds = await fetchAllStudioIds();
      setSelectedStudios(allIds);
      setSelectAll(false);
      setSelectAllPages(true);
      setShowBulkActions(true);
    }
  };

  const handleSelectStudio = (studioId) => {
    const newSelected = new Set(selectedStudios);
    if (newSelected.has(studioId)) {
      newSelected.delete(studioId);
    } else {
      newSelected.add(studioId);
    }
    setSelectedStudios(newSelected);
    
    // Update selection states
    if (selectAllPages) {
      // If we're selecting all pages, any individual selection should clear that state
      setSelectAllPages(false);
      setSelectAll(newSelected.size === studios.length);
    } else {
      setSelectAll(newSelected.size === studios.length);
    }
    
    setShowBulkActions(newSelected.size > 0);
  };

  const handleBulkApprove = async () => {
    if (!window.confirm(`Are you sure you want to approve ${selectedStudios.size} studios?`)) {
      return;
    }

    try {
      const response = await api.post('/admin/studios/bulk-verify', {
        studioIds: Array.from(selectedStudios),
        isVerified: true,
        verificationNotes: 'Bulk approved'
      });

      if (response.data.success) {
        showSuccessToast('Success', response.data.message);
      } else {
        showErrorToast('Error', response.data.error);
      }
      
      // Clear selection
      setSelectedStudios(new Set());
      setSelectAll(false);
      setShowBulkActions(false);
      
      // Refresh the list
      fetchStudios(pagination.page);
    } catch (error) {
      console.error('Error bulk approving studios:', error);
      const errorMessage = error.response?.data?.error || 'Failed to approve studios';
      showErrorToast('Error', errorMessage);
    }
  };

  const handleBulkFeature = async () => {
    if (!window.confirm(`Are you sure you want to feature ${selectedStudios.size} studios?`)) {
      return;
    }

    try {
      const response = await api.post('/admin/studios/bulk-feature', {
        studioIds: Array.from(selectedStudios),
        isFeatured: true
      });

      if (response.data.success) {
        showSuccessToast('Success', response.data.message);
      } else {
        showErrorToast('Error', response.data.error);
      }
      
      // Clear selection
      setSelectedStudios(new Set());
      setSelectAll(false);
      setShowBulkActions(false);
      
      // Refresh the list
      fetchStudios(pagination.page);
    } catch (error) {
      console.error('Error bulk featuring studios:', error);
      const errorMessage = error.response?.data?.error || 'Failed to feature studios';
      showErrorToast('Error', errorMessage);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE ${selectedStudios.size} studios? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await api.post('/admin/studios/bulk-delete', {
        studioIds: Array.from(selectedStudios)
      });

      if (response.data.success) {
        showSuccessToast('Success', response.data.message);
      } else {
        showErrorToast('Error', response.data.error);
      }
      
      // Clear selection
      setSelectedStudios(new Set());
      setSelectAll(false);
      setShowBulkActions(false);
      
      // Refresh the list
      fetchStudios(pagination.page);
    } catch (error) {
      console.error('Error bulk deleting studios:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete studios';
      showErrorToast('Error', errorMessage);
    }
  };

  const openVerifyModal = (studio) => {
    setSelectedStudio(studio);
    setVerifyForm({
      isVerified: true,
      verificationNotes: ''
    });
    setShowVerifyModal(true);
  };

  const openEditModal = (studio) => {
    setSelectedStudio(studio);
    setEditForm({
      title: studio.title,
      website: studio.website || '',
      phoneNumber: studio.phoneNumber || '',
      email: studio.email || '',
      facebookUrl: studio.facebookUrl || '',
      instagramUrl: studio.instagramUrl || '',
      twitterUrl: studio.twitterUrl || '',
      linkedinUrl: studio.linkedinUrl || '',
      youtubeUrl: studio.youtubeUrl || '',
      address: studio.address || '',
      city: studio.city || '',
      state: studio.state || '',
      zipCode: studio.zipCode || '',
      country: studio.country || '',
      latitude: studio.latitude || '',
      longitude: studio.longitude || '',
      isActive: studio.isActive
    });
    setShowEditModal(true);
  };

  const getStatusBadge = (studio) => {
    if (!studio.isActive) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Inactive</span>;
    }
    if (studio.isVerified) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Verified</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/admin/dashboard" 
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Studio Management</h1>
              <p className="mt-2 text-gray-600">
                Manage all studios, verify claims, and control studio status
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Studio
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search studios..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
              <select
                value={filters.verified}
                onChange={(e) => handleFilterChange('verified', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
              <select
                value={filters.featured}
                onChange={(e) => handleFilterChange('featured', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="true">Featured</option>
                <option value="false">Not Featured</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedStudios.size} studio{selectedStudios.size !== 1 ? 's' : ''} selected
                  {selectAllPages && (
                    <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      All Pages
                    </span>
                  )}
                  {selectAll && !selectAllPages && (
                    <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      This Page
                    </span>
                  )}
                </span>
                <button
                  onClick={() => {
                    setSelectedStudios(new Set());
                    setSelectAll(false);
                    setShowBulkActions(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkApprove}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve All
                </button>
                <button
                  onClick={handleBulkFeature}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Feature All
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Studios List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Studios ({pagination.total || 0})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectAllPages}
                          onChange={handleSelectAllPages}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          title="Select all studios across all pages"
                        />
                        <span className="ml-2 text-xs text-gray-500">All Pages</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectAll && !selectAllPages}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          title="Select all studios on current page"
                        />
                        <span className="ml-2 text-xs text-gray-500">This Page</span>
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Studio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artists
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studios.map((studio) => (
                  <tr key={studio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedStudios.has(studio.id)}
                          onChange={() => handleSelectStudio(studio.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-8 w-8 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {studio.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {studio.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {studio.city}, {studio.state}
                      </div>
                      <div className="text-sm text-gray-500">
                        {studio.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {getStatusBadge(studio)}
                        {studio.isFeatured && (
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {studio._count?.studioArtists || 0} artists
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(studio.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setShowDetails(true) || setSelectedStudio(studio)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => openVerifyModal(studio)}
                          className="text-green-600 hover:text-green-900"
                          title="Verify Studio"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleFeatureStudio(studio.id, !studio.isFeatured)}
                          className={`${studio.isFeatured ? 'text-yellow-600 hover:text-yellow-900' : 'text-gray-600 hover:text-gray-900'}`}
                          title={studio.isFeatured ? 'Unfeature' : 'Feature'}
                        >
                          <Star className={`w-4 h-4 ${studio.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                        
                        <button
                          onClick={() => openEditModal(studio)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Studio"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeactivateStudio(studio.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Deactivate Studio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => fetchStudios(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchStudios(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Studio Details Modal */}
        {showDetails && selectedStudio && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Studio Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedStudio.title}</h4>
                  <p className="text-sm text-gray-600">{selectedStudio.address}</p>
                  <p className="text-sm text-gray-600">{selectedStudio.city}, {selectedStudio.state} {selectedStudio.zipCode}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedStudio.phoneNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedStudio.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <p className="text-sm text-gray-900">{selectedStudio.website || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="text-sm text-gray-900">{getStatusBadge(selectedStudio)}</p>
                  </div>
                </div>
                
                {selectedStudio.artists && selectedStudio.artists.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Artists</label>
                    <div className="space-y-1">
                      {selectedStudio.artists.map((member) => (
                        <div key={member.id} className="text-sm text-gray-900">
                          {member.artist.user.firstName} {member.artist.user.lastName} - {member.role}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Verify Studio Modal */}
        {showVerifyModal && selectedStudio && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Verify Studio</h3>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Studio</label>
                  <p className="text-sm text-gray-900">{selectedStudio.title}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
                  <select
                    value={verifyForm.isVerified}
                    onChange={(e) => setVerifyForm(prev => ({ ...prev, isVerified: e.target.value === 'true' }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Approve</option>
                    <option value="false">Reject</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={verifyForm.verificationNotes}
                    onChange={(e) => setVerifyForm(prev => ({ ...prev, verificationNotes: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional verification notes..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowVerifyModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyStudio}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    {verifyForm.isVerified ? 'Approve' : 'Reject'} Studio
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Studio Modal */}
        {showEditModal && selectedStudio && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Studio</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Studio Name</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={editForm.zipCode}
                      onChange={(e) => setEditForm(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.latitude}
                      onChange={(e) => setEditForm(prev => ({ ...prev, latitude: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.longitude}
                      onChange={(e) => setEditForm(prev => ({ ...prev, longitude: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStudio}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Update Studio
                </button>
                             </div>
             </div>
           </div>
         )}

        {/* Create Studio Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Studio</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Studio Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter studio name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={createForm.website}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://studio.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={createForm.phoneNumber}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="555-123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="studio@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.address}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Main St"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.city}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="New York"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={createForm.state}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="NY"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={createForm.zipCode}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, zipCode: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={createForm.country}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="USA"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={createForm.latitude}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, latitude: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="40.7128"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={createForm.longitude}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, longitude: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="-74.0060"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label>
                    <input
                      type="url"
                      value={createForm.facebookUrl}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, facebookUrl: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://facebook.com/studio"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
                    <input
                      type="url"
                      value={createForm.instagramUrl}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, instagramUrl: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://instagram.com/studio"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
                    <input
                      type="url"
                      value={createForm.twitterUrl}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, twitterUrl: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://twitter.com/studio"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                    <input
                      type="url"
                      value={createForm.linkedinUrl}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://linkedin.com/studio"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL</label>
                    <input
                      type="url"
                      value={createForm.youtubeUrl}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://youtube.com/studio"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStudio}
                  disabled={!createForm.title || !createForm.address || !createForm.city || !createForm.state}
                  className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md ${
                    !createForm.title || !createForm.address || !createForm.city || !createForm.state
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Create Studio
                </button>
              </div>
            </div>
          </div>
        )}
       </div>
     </div>
   );
 };

export default AdminStudioManagement; 