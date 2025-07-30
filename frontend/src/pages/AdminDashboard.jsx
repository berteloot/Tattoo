import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Star, 
  Image, 
  Activity, 
  Shield, 
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [stats, setStats] = useState(null);
  const [recentActions, setRecentActions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, actionsResponse] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/actions?limit=5')
      ]);
      
      console.log('Dashboard stats response:', statsResponse.data);
      console.log('Actions response:', actionsResponse.data);
      
      setStats(statsResponse.data?.data?.statistics || statsResponse.data?.statistics || {});
      setRecentActions(actionsResponse.data?.data?.actions || actionsResponse.data?.actions || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Error fetching dashboard data', 'error');
      // Set default values on error
      setStats({});
      setRecentActions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage all users, roles, and account status',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      title: 'Artist Verification',
      description: 'Review and approve pending artist applications',
      icon: UserCheck,
      href: '/admin/artists/pending',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      title: 'Review Moderation',
      description: 'Moderate reviews and ratings',
      icon: Star,
      href: '/admin/reviews',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600'
    },
    {
      title: 'Content Management',
      description: 'Manage flash items and content',
      icon: Image,
      href: '/admin/content',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences and specialties',
      icon: Settings,
      href: '/admin/settings',
      color: 'bg-gray-500',
      hoverColor: 'hover:bg-gray-600'
    },
    {
      title: 'Audit Log',
      description: 'View admin action history',
      icon: Activity,
      href: '/admin/actions',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600'
    }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user.firstName}! Here's what's happening with your tattoo artist locator.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Artists</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalArtists || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.pendingVerifications || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Reviews</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalReviews || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.href}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${action.color} ${action.hoverColor} transition-colors duration-200`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">{action.title}</h3>
                </div>
                <p className="text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Admin Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Admin Actions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {(recentActions || []).length > 0 ? (
              (recentActions || []).map((action) => (
                <div key={action.id} className={`px-6 py-4 ${getActionColor(action)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getActionIcon(action)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {action.admin.firstName} {action.admin.lastName}
                        </p>
                        <p className="text-sm text-gray-600">{action.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(action.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(action.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent admin actions</p>
              </div>
            )}
          </div>
          {(recentActions || []).length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Link
                to="/admin/actions"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View all actions →
              </Link>
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-700">Database connection: Active</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-700">API endpoints: Operational</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-700">Authentication: Secure</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm text-gray-700">File uploads: Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 