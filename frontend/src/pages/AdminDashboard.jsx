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
  Building
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { error: showErrorToast } = useToast();
  const [manualStats, setManualStats] = useState(null);
  const [manualActions, setManualActions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
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
      console.error('❌ Manual API test failed:', error);
      showErrorToast('API Test Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Debug logging
  console.log('🔍 AdminDashboard Debug:', {
    user,
    stats,
    statsLoading,
    statsError,
    recentActions,
    actionsLoading,
    actionsError,
    manualStats,
    manualActions
  });

  // Handle errors gracefully
  if (statsError) {
    console.error('Error fetching admin stats:', statsError);
    showErrorToast('Dashboard Error', 'Failed to load dashboard statistics');
  }
  
  if (actionsError) {
    console.error('Error fetching admin actions:', actionsError);
    showErrorToast('Dashboard Error', 'Failed to load recent actions');
  }

  // Use manual data if React Query fails
  const displayStats = manualStats || stats;
  const displayActions = manualActions.length > 0 ? manualActions : recentActions;

  // Loading state
  if ((statsLoading || actionsLoading) && !manualStats) {
    console.log('🔄 AdminDashboard Loading State');
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ AdminDashboard Rendered with data:', { displayStats, displayActions });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>

        {/* Manual API Test Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">Manual API Test</h3>
          <div className="space-y-2">
            <p className="text-sm text-yellow-700">
              If the dashboard is missing data, click the button below to test the API manually.
            </p>
            <button
              onClick={testAPI}
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 text-sm"
            >
              {isLoading ? 'Testing...' : 'Test API Manually'}
            </button>
            {manualStats && (
              <p className="text-sm text-green-700">
                ✅ Manual API test successful! Stats loaded: {Object.keys(manualStats).length} items
              </p>
            )}
          </div>
        </div>

        {/* System Status Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full mr-3 ${displayStats.totalUsers > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">User System</p>
                <p className="text-xs text-gray-500">{displayStats.totalUsers || 0} users</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full mr-3 ${displayStats.totalStudios > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Studio System</p>
                <p className="text-xs text-gray-500">{displayStats.totalStudios || 0} studios</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full mr-3 ${displayStats.geocodedStudios > 0 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Geocoding</p>
                <p className="text-xs text-gray-500">{displayStats.geocodedStudios || 0} geocoded</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full mr-3 ${displayStats.totalReviews > 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">Review System</p>
                <p className="text-xs text-gray-500">{displayStats.totalReviews || 0} reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayStats.totalUsers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Artists</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayStats.totalArtists || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Featured Artists</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayStats.featuredArtists || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayStats.totalReviews || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <MapPin className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Studios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayStats.totalStudios || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Geocoded Studios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayStats.geocodedStudios || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Geocoding</p>
                <p className="text-2xl font-bold text-gray-900">
                  {displayStats.pendingGeocoding || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Actions</h2>
              <Link 
                to="/admin/actions" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {displayActions && displayActions.length > 0 ? (
              <div className="space-y-3">
                {displayActions.map((action) => (
                  <div key={action.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {action.actionType === 'VERIFY_ARTIST' && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {action.actionType === 'UPDATE_USER' && (
                        <Activity className="h-5 w-5 text-blue-600" />
                      )}
                      {action.actionType === 'DELETE_USER' && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      {action.actionType === 'MODERATE_REVIEW' && (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {action.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {action.adminUser?.firstName} {action.adminUser?.lastName}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500 ml-1">
                        {new Date(action.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent actions</p>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link 
                to="/admin/users" 
                className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Users className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-blue-800 font-medium">Manage Users</span>
              </Link>
              
              <Link 
                to="/admin/artists/pending" 
                className="flex items-center p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <UserCheck className="h-5 w-5 text-yellow-600 mr-3" />
                <span className="text-yellow-800 font-medium">Artist Verifications</span>
              </Link>
              
              <Link 
                to="/admin/reviews" 
                className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Star className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-green-800 font-medium">Review Moderation</span>
              </Link>
              
              <Link 
                to="/admin/actions" 
                className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <Activity className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-purple-800 font-medium">Audit Log</span>
              </Link>

              {/* Geolocalization and Studio Management */}
              <Link 
                to="/admin/geocoding" 
                className="flex items-center p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <MapPin className="h-5 w-5 text-indigo-600 mr-3" />
                <span className="text-indigo-800 font-medium">Studio Geocoding</span>
              </Link>
              
              <Link 
                to="/admin/studios/upload" 
                className="flex items-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <Upload className="h-5 w-5 text-orange-600 mr-3" />
                <span className="text-orange-800 font-medium">CSV Studio Import</span>
              </Link>
              
              <Link 
                to="/admin/studios" 
                className="flex items-center p-3 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
              >
                <Building className="h-5 w-5 text-teal-600 mr-3" />
                <span className="text-teal-800 font-medium">Manage Studios</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        {displayStats.pendingVerifications > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-medium">
                {displayStats.pendingVerifications} artist verification(s) pending review
              </span>
              <Link 
                to="/admin/artists/pending" 
                className="ml-auto text-yellow-800 hover:text-yellow-900 underline text-sm"
              >
                Review Now
              </Link>
            </div>
          </div>
        )}

        {/* Pending Geocoding Alert */}
        {displayStats.pendingGeocoding > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-orange-800 font-medium">
                {displayStats.pendingGeocoding} studio(s) need geocoding
              </span>
              <Link 
                to="/admin/geocoding" 
                className="ml-auto text-orange-800 hover:text-orange-900 underline text-sm"
              >
                Process Geocoding
              </Link>
            </div>
          </div>
        )}

        {/* Debug Info - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Debug Info</h3>
            <pre className="text-xs text-gray-700 overflow-auto">
              {JSON.stringify({ displayStats, displayActions, user, manualStats, manualActions }, null, 2)}
            </pre>
          </div>
        )}

        {/* API Test Section - Always show for debugging */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">API Connection Test</h3>
          <div className="space-y-2">
            <p className="text-sm text-blue-700">
              Current API URL: {import.meta.env.VITE_API_URL || 'Using relative path'}
            </p>
            <p className="text-sm text-blue-700">
              Environment: {import.meta.env.MODE}
            </p>
            <button
              onClick={async () => {
                try {
                  console.log('🧪 Testing API connection...');
                  const response = await fetch('/api/admin/dashboard');
                  const data = await response.json();
                  console.log('✅ API test successful:', data);
                  alert(`API Test: ${response.status} - ${response.statusText}\nData: ${JSON.stringify(data, null, 2)}`);
                } catch (error) {
                  console.error('❌ API test failed:', error);
                  alert(`API Test Failed: ${error.message}`);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Test API Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 