import React from 'react';
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
  XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { error: showErrorToast } = useToast();
  
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

  // Handle errors gracefully
  if (statsError) {
    console.error('Error fetching admin stats:', statsError);
    showErrorToast('Dashboard Error', 'Failed to load dashboard statistics');
  }
  
  if (actionsError) {
    console.error('Error fetching admin actions:', actionsError);
    showErrorToast('Dashboard Error', 'Failed to load recent actions');
  }

  // Loading state
  if (statsLoading || actionsLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
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
                  {stats.totalUsers || 0}
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
                  {stats.totalArtists || 0}
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
                  {stats.featuredArtists || 0}
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
                  {stats.totalReviews || 0}
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
            
            {recentActions.length > 0 ? (
              <div className="space-y-3">
                {recentActions.map((action) => (
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
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        {stats.pendingVerifications > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-medium">
                {stats.pendingVerifications} artist verification(s) pending review
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
      </div>
    </div>
  );
};

export default AdminDashboard; 