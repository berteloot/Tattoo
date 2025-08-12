// FORCE DEPLOYMENT - Admin Geocoding Page v2.0
import React from 'react';
import SimpleGeocoding from '../components/SimpleGeocoding';

const AdminGeocoding = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Studio Batch Geocoding</h1>
          <p className="text-gray-600 mt-2">
            Automated batch geocoding system using Google Maps API. Processes multiple studios automatically 
            with rate limiting to respect API quotas. Shows only essential information to keep the interface clean.
          </p>
        </div>
        <SimpleGeocoding />
      </div>
    </div>
  );
};

export default AdminGeocoding; 