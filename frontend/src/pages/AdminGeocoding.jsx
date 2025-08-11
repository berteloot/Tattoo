import React from 'react';
import SimpleGeocoding from '../components/SimpleGeocoding';

const AdminGeocoding = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Studio Geocoding Management</h1>
          <p className="text-gray-600 mt-2">
            Simple manual coordinate entry system. Select studios that need geocoding and manually enter their coordinates.
            Use Google Maps to find coordinates, then save them directly to the database.
          </p>
        </div>
        <SimpleGeocoding />
      </div>
    </div>
  );
};

export default AdminGeocoding; 