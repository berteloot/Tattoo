import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const SimpleGeocoding = () => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });

  // Load studios and stats on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsResponse = await fetch('/api/geocoding/stats');
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Load studios
      const studiosResponse = await fetch('/api/geocoding/studios');
      const studiosData = await studiosResponse.json();
      if (studiosData.success) {
        setStudios(studiosData.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStudioSelect = (studio) => {
    setSelectedStudio(studio);
    setCoordinates({ lat: '', lng: '' });
  };

  const handleCoordinateChange = (field, value) => {
    setCoordinates(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveCoordinates = async () => {
    if (!selectedStudio || !coordinates.lat || !coordinates.lng) {
      toast.error('Please select a studio and enter coordinates');
      return;
    }

    try {
      const response = await fetch('/api/geocoding/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studioId: selectedStudio.id,
          latitude: parseFloat(coordinates.lat),
          longitude: parseFloat(coordinates.lng),
          address: selectedStudio.fullAddress
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Coordinates saved for ${selectedStudio.title}`);
        
        // Update local state
        setStudios(prev => prev.map(studio => 
          studio.id === selectedStudio.id 
            ? { ...studio, latitude: parseFloat(coordinates.lat), longitude: parseFloat(coordinates.lng), hasCoordinates: true }
            : studio
        ));
        
        // Reset form
        setSelectedStudio(null);
        setCoordinates({ lat: '', lng: '' });
        
        // Reload stats
        loadData();
      } else {
        toast.error(data.error || 'Failed to save coordinates');
      }
    } catch (error) {
      console.error('Error saving coordinates:', error);
      toast.error('Failed to save coordinates');
    }
  };

  const openGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading geocoding data...</p>
        </div>
      </div>
    );
  }

  const studiosNeedingGeocoding = studios.filter(studio => !studio.hasCoordinates);
  const studiosWithCoordinates = studios.filter(studio => studio.hasCoordinates);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Simple Geocoding System</h1>
        <p className="text-gray-600">
          Manually add coordinates for studios that need geocoding. Use Google Maps to find coordinates.
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">{stats.totalStudios}</div>
            <div className="text-gray-600">Total Studios</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">{stats.studiosWithCoords}</div>
            <div className="text-gray-600">With Coordinates</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-red-600">{stats.studiosNeedingGeocoding}</div>
            <div className="text-gray-600">Need Geocoding</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="text-2xl font-bold text-purple-600">{stats.progress}%</div>
            <div className="text-gray-600">Complete</div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {stats && (
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-4">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${stats.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {stats.studiosWithCoords} of {stats.totalStudios} studios have coordinates
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Studios Needing Geocoding */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Studios Needing Geocoding ({studiosNeedingGeocoding.length})
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Select a studio and add coordinates manually
            </p>
          </div>
          
          <div className="p-6">
            {studiosNeedingGeocoding.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-green-500 text-6xl mb-4">🎉</div>
                <p className="text-gray-600">All studios have coordinates!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {studiosNeedingGeocoding.map((studio) => (
                  <div 
                    key={studio.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedStudio?.id === studio.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleStudioSelect(studio)}
                  >
                    <div className="font-medium text-gray-900">{studio.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{studio.fullAddress}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openGoogleMaps(studio.fullAddress);
                      }}
                      className="text-blue-600 text-sm hover:underline mt-2"
                    >
                      🔍 Open in Google Maps
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coordinate Entry */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Add Coordinates</h2>
            <p className="text-gray-600 text-sm mt-1">
              Enter latitude and longitude for the selected studio
            </p>
          </div>
          
          <div className="p-6">
            {!selectedStudio ? (
              <div className="text-center py-8 text-gray-500">
                Select a studio from the left to add coordinates
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Studio
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">{selectedStudio.title}</div>
                    <div className="text-sm text-gray-600">{selectedStudio.fullAddress}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={coordinates.lat}
                      onChange={(e) => handleCoordinateChange('lat', e.target.value)}
                      placeholder="e.g., 51.5074"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={coordinates.lng}
                      onChange={(e) => handleCoordinateChange('lng', e.target.value)}
                      placeholder="e.g., -0.1278"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={saveCoordinates}
                    disabled={!coordinates.lat || !coordinates.lng}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Save Coordinates
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedStudio(null);
                      setCoordinates({ lat: '', lng: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <div className="text-xs text-gray-500">
                  💡 <strong>Tip:</strong> Use Google Maps to find coordinates. Right-click on a location and select "What's here?" to see coordinates.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Studios with Coordinates */}
      {studiosWithCoordinates.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Studios with Coordinates ({studiosWithCoordinates.length})
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studiosWithCoordinates.map((studio) => (
                <div key={studio.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900">{studio.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{studio.fullAddress}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    📍 {studio.latitude}, {studio.longitude}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleGeocoding;
