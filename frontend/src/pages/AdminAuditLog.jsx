import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Activity, UserCheck, Users, UserX, Star, TrendingUp, Clock } from 'lucide-react';

const AdminAuditLog = () => {
  const { user } = useAuth();
  const { error } = useToast();
  
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Fetch admin actions
  const fetchActions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/actions?page=${pagination.page}&limit=${pagination.limit}`);
      console.log('Actions response:', response.data);
      setActions(response.data.data.actions);
      setPagination(response.data.data.pagination);
    } catch (error) {
      error('Error fetching admin actions');
      console.error('Error fetching admin actions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  useEffect(() => {
    fetchActions();
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

  const getActionIcon = (action) => {
    switch (action.action) {
      case 'VERIFY_ARTIST':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'UPDATE_USER':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'DELETE_USER':
        return <UserX className="h-4 w-4 text-red-600" />;
      case 'MODERATE_REVIEW':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'FEATURE_ARTIST':
        return <TrendingUp className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action.action) {
      case 'VERIFY_ARTIST':
        return 'bg-green-50 border-green-200';
      case 'UPDATE_USER':
        return 'bg-blue-50 border-blue-200';
      case 'DELETE_USER':
        return 'bg-red-50 border-red-200';
      case 'MODERATE_REVIEW':
        return 'bg-yellow-50 border-yellow-200';
      case 'FEATURE_ARTIST':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatActionType = (actionType) => {
    return actionType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="mt-2 text-gray-600">View admin action history and system activity</p>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Actions</p>
              <p className="text-2xl font-semibold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>

        {/* Actions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Admin Actions</h2>
          </div>
          
          {actions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No actions found</h3>
              <p className="text-gray-600">No admin actions have been recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {actions.map((action) => (
                <div key={action.id} className={`px-6 py-4 ${getActionColor(action)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getActionIcon(action)}
                      <div className="ml-3">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900">
                            {action.admin.firstName} {action.admin.lastName}
                          </p>
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {formatActionType(action.action)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{action.details}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{new Date(action.createdAt).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(action.createdAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Target: {action.targetType}
                      </p>
                      {action.targetId && (
                        <p className="text-xs text-gray-500">
                          ID: {action.targetId}
                        </p>
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
                  Showing <span className="font-medium">{(((pagination?.page || 1) - 1) * (pagination?.limit || 50)) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min((pagination?.page || 1) * (pagination?.limit || 50), pagination?.total || 0)}
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
      </div>
    </div>
  );
};

export default AdminAuditLog; 