import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { UserCheck, UserX, Clock, CheckCircle, XCircle } from 'lucide-react';

const AdminArtistVerification = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [verificationReason, setVerificationReason] = useState('');
  const [action, setAction] = useState(''); // 'approve' or 'reject'
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch pending artists
  const fetchPendingArtists = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/artists/pending?page=${pagination.page}&limit=${pagination.limit}`);
      console.log('Pending artists response:', response.data);
      setArtists(response.data.data.artists);
      setPagination(response.data.data.pagination);
    } catch (error) {
      error('Error fetching pending artists');
      console.error('Error fetching pending artists:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle verification
  const handleVerification = async () => {
    try {
      const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
      await api.put(`/admin/artists/${selectedArtist.id}/verify`, {
        status,
        reason: verificationReason
      });
      
      success(`Artist ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowModal(false);
      setSelectedArtist(null);
      setVerificationReason('');
      setAction('');
      fetchPendingArtists();
    } catch (error) {
      error(error.response?.data?.error || `Error ${action}ing artist`);
      console.error('Error verifying artist:', error);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  useEffect(() => {
    fetchPendingArtists();
  }, [pagination.page]);

  // Check if current user is admin
  if (user?.role !== 'ADMIN') {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Artist Verification</h1>
          <p className="mt-2 text-gray-600">Review and approve pending artist applications</p>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
              <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>

        {/* Artists List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Pending Artists</h2>
          </div>
          
          {artists.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending verifications</h3>
              <p className="text-gray-600">All artist applications have been processed.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {artists.map((artist) => (
                <div key={artist.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
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
                        <div className="text-sm text-gray-500">
                          Studio: {artist.studioName || 'No studio name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Applied: {new Date(artist.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedArtist(artist);
                          setAction('approve');
                          setShowModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedArtist(artist);
                          setAction('reject');
                          setShowModal(true);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {(pagination?.pages || 0) > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
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

        {/* Verification Modal */}
        {showModal && selectedArtist && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {action === 'approve' ? 'Approve' : 'Reject'} Artist
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to {action} <strong>{selectedArtist.user.firstName} {selectedArtist.user.lastName}</strong>?
                </p>
                <textarea
                  placeholder={`Reason for ${action} (optional)`}
                  value={verificationReason}
                  onChange={(e) => setVerificationReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  rows="3"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedArtist(null);
                      setVerificationReason('');
                      setAction('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerification}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                      action === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {action === 'approve' ? 'Approve' : 'Reject'}
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

export default AdminArtistVerification; 