import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAdminStats, useAdminActions } from '../hooks/useDashboardQueries';
import { 
  Users, 
  UserCheck, 
  Star, 
  TrendingUp, 
  Activity, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
  Upload,
  Building,
  Image,
  Settings,
  BarChart3,
  Calendar,
  DollarSign,
  Eye,
  Plus
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { error: showErrorToast } = useToast();
  const [manualStats, setManualStats] = useState(null);
  const [manualActions, setManualActions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user is properly loaded
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading User...</h1>
          <p className="text-gray-600">Please wait while we load your profile.</p>
        </div>
      </div>
    );
  }

  // Check if user has admin role (ADMIN or ARTIST_ADMIN)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Current role: {user.role}</p>
        </div>
      </div>
    );
  }

  // Use React Query hooks for data fetching
  const { 
    data: stats = {}, 
    isLoading: statsLoading, 
    error: statsError 
  } = useAdminStats();
  
  const { 
    data: recentActions = [], 
    isLoading: actionsLoading, 
    error: actionsError 
  } = useAdminActions(5);

  // Manual API test function
  const testAPI = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Manual API test starting...');
      
      // Test dashboard endpoint
      const dashboardResponse = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'no-token'}`
        }
      });
      console.log('Dashboard response status:', dashboardResponse.status);
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        console.log('Dashboard data:', dashboardData);
        setManualStats(dashboardData.data?.statistics || dashboardData.statistics || {});
      } else {
        console.error('Dashboard failed:', dashboardResponse.statusText);
      }
      
      // Test actions endpoint
      const actionsResponse = await fetch('/api/admin/actions?limit=5', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || 'no-token'}`
        }
      });
      console.log('Actions response status:', actionsResponse.status);
      
      if (actionsResponse.ok) {
        const actionsData = await actionsResponse.json();
        console.log('Actions data:', actionsData);
        setManualActions(actionsData.data?.actions || actionsData.actions || []);
      } else {
        console.error('Actions failed:', actionsResponse.statusText);
      }
    } catch (error) {
      console.error('Manual API test error:', error);
      showErrorToast('Manual API test failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Use manual stats if available, otherwise use React Query data
  const currentStats = manualStats || stats;
  const currentActions = manualActions.length > 0 ? manualActions : recentActions;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Welcome back, {user.firstName || user.name}. Manage your platform from here.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={testAPI}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  ) : (
                    <BarChart3 className="w-4 h-4 mr-2" />
                  )}
                  Test API
                </button>
                <Link
                  to="/admin/users"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? '...' : (currentStats.totalUsers || 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCheck className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Verified Artists</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? '...' : (currentStats.verifiedArtists || 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Reviews</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? '...' : (currentStats.totalReviews || 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Sessions</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {statsLoading ? '...' : (currentStats.activeSessions || 0).toLocaleString()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/users"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                  <Users className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  User Management
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Manage user accounts, roles, and permissions
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                aria-hidden="true"
              >
                <Plus className="h-6 w-6" />
              </span>
            </Link>

            <Link
              to="/admin/artists/pending"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                  <UserCheck className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Artist Verification
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Review and approve pending artist applications
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                aria-hidden="true"
              >
                <Plus className="h-6 w-6" />
              </span>
            </Link>

            <Link
              to="/admin/reviews"
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div>
                <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                  <Star className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-medium">
                  <span className="absolute inset-0" aria-hidden="true" />
                  Review Moderation
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Moderate reviews and maintain content quality
                </p>
              </div>
              <span
                className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                aria-hidden="true"
              >
                <Plus className="h-6 w-6" />
              </span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Admin Actions</h3>
            {actionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : currentActions.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {currentActions.map((action, actionIdx) => (
                    <li key={action.id}>
                      <div className="relative pb-8">
                        {actionIdx !== currentActions.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <Activity className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                {action.actionType} by{' '}
                                <span className="font-medium text-gray-900">
                                  {action.adminUser?.firstName || 'Admin'}
                                </span>
                              </p>
                              {action.description && (
                                <p className="text-sm text-gray-700 mt-1">{action.description}</p>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={action.createdAt}>
                                {new Date(action.createdAt).toLocaleDateString()}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-6">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent actions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by managing users or verifying artists.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">Database</p>
                  <p className="text-xs text-green-600">Connected</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">API</p>
                  <p className="text-xs text-green-600">Operational</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-green-800">Authentication</p>
                  <p className="text-xs text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 