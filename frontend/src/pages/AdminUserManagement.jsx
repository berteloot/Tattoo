import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

const AdminUserManagement = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  // Add debugging to check if toast functions exist
  console.log('Toast functions available:', {
    success: typeof toast.success,
    error: typeof toast.error,
    warning: typeof toast.warning,
    info: typeof toast.info
  });
  
  const { success, error } = toast;
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToRestore, setUserToRestore] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [restoreReason, setRestoreReason] = useState('');
  
  // Filtering and pagination
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    role: '',
    search: '',
    isActive: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await api.get(`/admin/users?${params}`);
      console.log('Users API response:', response.data);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      error('Error fetching users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      console.log('User details response:', response.data);
      setSelectedUser(response.data.data.user);
      setShowUserModal(true);
    } catch (error) {
      error('Error fetching user details');
      console.error('Error fetching user details:', error);
    }
  };

  // Update user
  const updateUser = async (userId, updateData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, updateData);
      success('User updated successfully');
      fetchUsers();
      setShowUserModal(false);
      setSelectedUser(null);
    } catch (error) {
      error(error.response?.data?.error || 'Error updating user');
      console.error('Error updating user:', error);
    }
  };

  // Delete user (soft delete)
  const deleteUser = async () => {
    try {
      await api.delete(`/admin/users/${userToDelete.id}`, {
        data: { reason: deleteReason }
      });
      success('User deactivated successfully');
      setShowDeleteModal(false);
      setUserToDelete(null);
      setDeleteReason('');
      fetchUsers();
    } catch (error) {
      error(error.response?.data?.error || 'Error deactivating user');
      console.error('Error deleting user:', error);
    }
  };

  // Restore user
  const restoreUser = async () => {
    try {
      await api.post(`/admin/users/${userToRestore.id}/restore`);
      success('User restored successfully');
      setShowRestoreModal(false);
      setUserToRestore(null);
      setRestoreReason('');
      fetchUsers();
    } catch (error) {
      error(error.response?.data?.error || 'Error restoring user');
      console.error('Error restoring user:', error);
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

  // Handle pagination
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Initialize
  useEffect(() => {
    fetchUsers();
  }, [filters]);

  // Check if current user is admin
  if (user?.role !== 'ADMIN' && user?.role !== 'ARTIST_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage all users, their roles, and account status</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="CLIENT">Client</option>
                <option value="ARTIST">Artist</option>
                <option value="ADMIN">Admin</option>
                <option value="ARTIST_ADMIN">Artist & Admin</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ page: 1, limit: 20, role: '', search: '', isActive: '' })}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Artist Profile
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
                    {(users || []).map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                            user.role === 'ARTIST' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.artistProfile ? (
                            <div>
                              <div className="font-medium">{user.artistProfile.studioName || 'No Studio Name'}</div>
                              <div className="text-gray-500">
                                {user.artistProfile.verificationStatus === 'APPROVED' ? '✅ Verified' :
                                 user.artistProfile.verificationStatus === 'PENDING' ? '⏳ Pending' :
                                 user.artistProfile.verificationStatus === 'REJECTED' ? '❌ Rejected' :
                                 user.artistProfile.verificationStatus === 'SUSPENDED' ? '🚫 Suspended' : 'Unknown'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No Profile</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => fetchUserDetails(user.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            {user.role !== 'ADMIN' && (
                              <button
                                onClick={() => {
                                  // Quick promote to admin
                                  const updateData = {
                                    role: 'ADMIN',
                                    reason: 'Promoted to admin by administrator'
                                  };
                                  updateUser(user.id, updateData);
                                }}
                                className="text-purple-600 hover:text-purple-900"
                                title="Promote to Admin"
                              >
                                Promote to Admin
                              </button>
                            )}
                            {user.isActive ? (
                              <button
                                onClick={() => {
                                  setUserToDelete(user);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setUserToRestore(user);
                                  setShowRestoreModal(true);
                                }}
                                className="text-green-600 hover:text-green-900"
                              >
                                Restore
                              </button>
                            )}
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

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setSelectedUser(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <UserDetailsForm user={selectedUser} onUpdate={updateUser} onCancel={() => setShowUserModal(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Deactivate User</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to deactivate <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>?
                  This will prevent them from accessing the system.
                </p>
                <textarea
                  placeholder="Reason for deactivation (optional)"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                  rows="3"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setUserToDelete(null);
                      setDeleteReason('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteUser}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restore Confirmation Modal */}
        {showRestoreModal && userToRestore && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Restore User</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to restore <strong>{userToRestore.firstName} {userToRestore.lastName}</strong>?
                  This will allow them to access the system again.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowRestoreModal(false);
                      setUserToRestore(null);
                      setRestoreReason('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={restoreUser}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Restore
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

// User Details Form Component
const UserDetailsForm = ({ user, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'CLIENT',
    isActive: user.isActive,
    isVerified: user.isVerified
  });
  const [reason, setReason] = useState('');
  const [showRoleWarning, setShowRoleWarning] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updateData = { ...formData, reason };
    onUpdate(user.id, updateData);
  };

  const handleRoleChange = (newRole) => {
    setFormData(prev => ({ ...prev, role: newRole }));
    
    // Show warning when promoting to admin roles
    if ((newRole === 'ADMIN' || newRole === 'ARTIST_ADMIN') && user.role !== 'ADMIN' && user.role !== 'ARTIST_ADMIN') {
      setShowRoleWarning(true);
    } else {
      setShowRoleWarning(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
            {(user.role === 'ADMIN' || user.role === 'ARTIST_ADMIN') && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                Current Admin
              </span>
            )}
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleRoleChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              (formData.role === 'ADMIN' || formData.role === 'ARTIST_ADMIN') ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="CLIENT">Client</option>
            <option value="ARTIST">Artist</option>
            <option value="ADMIN">Admin</option>
            <option value="ARTIST_ADMIN">Artist & Admin</option>
          </select>
          {(formData.role === 'ADMIN' || formData.role === 'ARTIST_ADMIN') && (
            <p className="mt-1 text-sm text-red-600">
              ⚠️ Admin users have full system access
            </p>
          )}
          {formData.role === 'ARTIST_ADMIN' && (
            <p className="mt-1 text-sm text-blue-600">
              🎨 This user can both create artist profiles and manage the system
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="mr-2"
              />
              Active
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isVerified}
                onChange={(e) => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
                className="mr-2"
              />
              Verified
            </label>
          </div>
        </div>
      </div>

      {/* Role Change Warning */}
      {showRoleWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Promoting to Admin Role
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You are about to promote <strong>{user.firstName} {user.lastName}</strong> to Admin role. 
                  This will give them full access to:
                </p>
                <ul className="list-disc list-inside mt-1 ml-4">
                  <li>User management and role changes</li>
                  <li>Artist verification</li>
                  <li>Review moderation</li>
                  <li>System settings and audit logs</li>
                  <li>All administrative functions</li>
                </ul>
                <p className="mt-2 font-medium">
                  Please ensure this user is trusted and qualified for admin privileges.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Changes (Optional)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Explain why you're making these changes..."
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-4 py-2 text-white rounded-md hover:opacity-90 ${
            (formData.role === 'ADMIN' || formData.role === 'ARTIST_ADMIN') && user.role !== 'ADMIN' && user.role !== 'ARTIST_ADMIN'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {formData.role === 'ADMIN' || formData.role === 'ARTIST_ADMIN' ? 'Promote to Admin' : 'Update User'}
        </button>
      </div>
    </form>
  );
};

export default AdminUserManagement; 