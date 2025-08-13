import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { MapPin, Play, Pause, Trash2, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const AdminGeocodingManagement = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const fetchStatus = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/geocoding/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data.data);
      } else {
        throw new Error('Failed to fetch status');
      }
    } catch (error) {
      console.error('Error fetching geocoding status:', error);
      showToast('Error fetching geocoding status', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const triggerGeocoding = async (studioId) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/geocoding/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ studioId })
      });
      
      if (response.ok) {
        const data = await response.json();
        showToast(data.message, 'success');
        fetchStatus();
      } else {
        throw new Error('Failed to trigger geocoding');
      }
    } catch (error) {
      console.error('Error triggering geocoding:', error);
      showToast('Error triggering geocoding', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearQueue = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/geocoding/clear-queue', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        showToast(data.message, 'success');
        fetchStatus();
      } else {
        throw new Error('Failed to clear queue');
      }
    } catch (error) {
      console.error('Error clearing queue:', error);
      showToast('Error clearing queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const processAll = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/geocoding/process-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        showToast(data.message, 'success');
        fetchStatus();
      } else {
        throw new Error('Failed to process all geocoding');
      }
    } catch (error) {
      console.error('Error processing all geocoding:', error);
      showToast('Error processing all geocoding', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Geocoding Management</h1>
              <p className="mt-2 text-gray-600">
                Monitor and control the automated geocoding system for studio addresses
              </p>
            </div>
            <button
              onClick={fetchStatus}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Processing Status */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {status?.isProcessing ? (
                    <Clock className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Processing Status
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {status?.isProcessing ? 'Processing' : 'Idle'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Studios */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <MapPin className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Studios
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {status?.pendingCount || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Queue Status */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Queue Status
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {status?.pendingCount > 0 ? 'Active' : 'Empty'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={processAll}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <Play className="h-4 w-4 mr-2" />
              Process All Studios
            </button>
            
            <button
              onClick={clearQueue}
              disabled={loading || !status?.pendingCount}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Queue
            </button>
            
            <button
              onClick={fetchStatus}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Status
            </button>
          </div>
        </div>

        {/* Pending Studios List */}
        {status?.pendingStudios && status.pendingStudios.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Pending Studios ({status.pendingStudios.length})
              </h3>
              <div className="space-y-3">
                {status.pendingStudios.map((studioId, index) => (
                  <div key={studioId} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600">
                        Studio ID: {studioId}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Queue position: {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="bg-white shadow rounded-lg mt-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">How it works</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• New studios are automatically queued for geocoding</li>
                  <li>• Processing happens in batches of 5 studios</li>
                  <li>• Rate limits are handled with exponential backoff</li>
                  <li>• Failed geocoding attempts are retried up to 3 times</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Status indicators</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <span className="text-green-600">Idle</span>: No processing happening</li>
                  <li>• <span className="text-yellow-600">Processing</span>: Currently geocoding studios</li>
                  <li>• <span className="text-blue-600">Pending</span>: Studios waiting to be processed</li>
                  <li>• <span className="text-red-600">Error</span>: Failed geocoding attempts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGeocodingManagement; 