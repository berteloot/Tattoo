import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Star, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';

const AdminReviewModeration = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [moderationReason, setModerationReason] = useState('');
  const [action, setAction] = useState(''); // 'approve' or 'hide'
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/reviews?page=${pagination.page}&limit=${pagination.limit}`);
      console.log('Reviews response:', response.data);
      setReviews(response.data.data.reviews);
      setPagination(response.data.data.pagination);
    } catch (error) {
      error('Error fetching reviews');
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle moderation
  const handleModeration = async () => {
    try {
      const isApproved = action === 'approve';
      await api.put(`/admin/reviews/${selectedReview.id}/moderate`, {
        isApproved,
        reason: moderationReason
      });
      
      success(`Review ${action === 'approve' ? 'approved' : 'hidden'} successfully`);
      setShowModal(false);
      setSelectedReview(null);
      setModerationReason('');
      setAction('');
      fetchReviews();
    } catch (error) {
      error(error.response?.data?.error || `Error ${action}ing review`);
      console.error('Error moderating review:', error);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  useEffect(() => {
    fetchReviews();
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
          <h1 className="text-3xl font-bold text-gray-900">Review Moderation</h1>
          <p className="mt-2 text-gray-600">Moderate reviews and ratings</p>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reviews</p>
              <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Reviews</h2>
          </div>
          
          {reviews.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600">There are no reviews to moderate.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <div key={review.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">{review.rating}/5</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          review.isApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {review.isApproved ? 'Approved' : 'Hidden'}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">{review.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                      <div className="text-xs text-gray-500">
                        <span>By: {review.author.firstName} {review.author.lastName}</span>
                        <span className="mx-2">•</span>
                        <span>For: {review.recipient.firstName} {review.recipient.lastName}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      {!review.isApproved ? (
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setAction('approve');
                            setShowModal(true);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setAction('hide');
                            setShowModal(true);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <EyeOff className="h-4 w-4 mr-1" />
                          Hide
                        </button>
                      )}
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

        {/* Moderation Modal */}
        {showModal && selectedReview && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {action === 'approve' ? 'Approve' : 'Hide'} Review
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to {action} this review by <strong>{selectedReview.author.firstName} {selectedReview.author.lastName}</strong>?
                </p>
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < selectedReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">{selectedReview.rating}/5</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{selectedReview.title}</h4>
                  <p className="text-sm text-gray-600">{selectedReview.comment}</p>
                </div>
                <textarea
                  placeholder={`Reason for ${action} (optional)`}
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  rows="3"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedReview(null);
                      setModerationReason('');
                      setAction('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleModeration}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                      action === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {action === 'approve' ? 'Approve' : 'Hide'}
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

export default AdminReviewModeration; 