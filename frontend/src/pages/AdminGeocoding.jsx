import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import SimpleGeocoding from '../components/SimpleGeocoding';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminGeocoding = () => {
  const { isAdmin } = useAuth();

  // Check if current user is admin
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/admin"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Studio Geocoding</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">🗺️ About Studio Geocoding</h2>
            <p className="text-blue-700 mb-3">
              This tool helps you geocode studio addresses to display them correctly on maps. 
              It uses Google Maps API from the frontend to work with your restricted API key.
            </p>
            <div className="text-sm text-blue-600">
              <p><strong>How it works:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Fetches studios that need geocoding from your database</li>
                <li>Uses Google Maps Geocoding API from the browser (works with referer restrictions)</li>
                <li>Automatically saves coordinates back to your database</li>
                <li>Includes rate limiting to respect API quotas</li>
                <li>Caches results to avoid duplicate API calls</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Geocoding Component */}
        <SimpleGeocoding />

        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">📋 Prerequisites</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Google Maps API key with Geocoding API enabled</li>
              <li>• API key set as <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code></li>
              <li>• Studios with address information in the database</li>
              <li>• GeocodeCache table created in the database</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-3">🔧 Troubleshooting</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• If geocoding fails, check your API key restrictions</li>
              <li>• Ensure the Geocoding API is enabled in Google Cloud Console</li>
              <li>• Check browser console for detailed error messages</li>
              <li>• Verify studio addresses are complete and accurate</li>
            </ul>
          </div>
        </div>

        {/* Related Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">🔗 Related Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/studios"
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                  <span className="text-teal-600 text-sm font-semibold">🏢</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Studio Management</p>
                <p className="text-xs text-gray-500">View and manage all studios</p>
              </div>
            </Link>

            <Link
              to="/admin/studios/upload"
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-sm font-semibold">📤</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Upload Studios</p>
                <p className="text-xs text-gray-500">Upload studios from CSV file</p>
              </div>
            </Link>

            <Link
              to="/map"
              className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-semibold">🗺️</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">View Map</p>
                <p className="text-xs text-gray-500">See studios on the map</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGeocoding; 