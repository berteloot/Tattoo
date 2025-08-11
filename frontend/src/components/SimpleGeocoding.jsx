import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const SimpleGeocoding = () => {
  const [pendingStudios, setPendingStudios] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, withCoordinates: 0, withoutCoordinates: 0 });

  // Load pending studios
  const loadPendingStudios = async () => {
    try {
      const response = await fetch('/api/geocoding/pending?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setPendingStudios(data.data);
        console.log(`📋 Loaded ${data.data.length} studios needing geocoding`);
      } else {
        throw new Error(data.error || 'Failed to load studios');
      }
    } catch (error) {
      console.error('Error loading pending studios:', error);
      toast.error('Failed to load studios');
    }
  };

  // Load geocoding stats
  const loadStats = async () => {
    try {
      const response = await fetch('/api/geocoding/status');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPendingStudios();
    loadStats();
  }, []);

  // Geocode a single address using Google Maps API
  const geocodeAddress = async (address) => {
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
      throw new Error('Google Maps API not loaded');
    }

    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            success: true,
            latitude: location.lat(),
            longitude: location.lng()
          });
        } else if (status === 'ZERO_RESULTS') {
          reject(new Error('Address not found'));
        } else if (status === 'OVER_QUERY_LIMIT') {
          reject(new Error('API quota exceeded'));
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  };

  // Save coordinates to backend
  const saveCoordinates = async (studioId, latitude, longitude) => {
    const response = await fetch('/api/geocoding/save-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studioId, latitude, longitude })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to save coordinates');
    }
    
    return data;
  };

  // Process next studio
  const processNextStudio = async (index) => {
    if (index >= pendingStudios.length) {
      // All done!
      setIsGeocoding(false);
      setCurrentIndex(0);
      setProgress(0);
      toast.success('Geocoding completed!');
      loadPendingStudios(); // Refresh list
      loadStats(); // Update stats
      return;
    }

    const studio = pendingStudios[index];
    console.log(`🌍 [${index + 1}/${pendingStudios.length}] Processing: ${studio.title}`);

    try {
      // Geocode the address
      const result = await geocodeAddress(studio.full_address);
      
      // Save coordinates
      await saveCoordinates(studio.id, result.latitude, result.longitude);
      
      console.log(`✅ Successfully geocoded: ${studio.title}`);
      toast.success(`Geocoded: ${studio.title}`, { duration: 2000 });
      
    } catch (error) {
      console.error(`❌ Failed to geocode ${studio.title}:`, error.message);
      
      if (error.message.includes('API quota exceeded')) {
        toast.error('API quota exceeded - stopping', { duration: 5000 });
        setIsGeocoding(false);
        return;
      } else if (error.message.includes('Address not found')) {
        toast.error(`Address not found: ${studio.title}`, { duration: 2000 });
      } else {
        toast.error(`Failed: ${studio.title}`, { duration: 2000 });
      }
    }

    // Move to next studio
    const nextIndex = index + 1;
    setCurrentIndex(nextIndex);
    setProgress((nextIndex / pendingStudios.length) * 100);

    // Add delay to respect rate limits
    setTimeout(() => {
      processNextStudio(nextIndex);
    }, 2000); // 2 second delay
  };

  // Start geocoding process
  const startGeocoding = () => {
    if (pendingStudios.length === 0) {
      toast.error('No studios to geocode');
      return;
    }
    
    setIsGeocoding(true);
    setCurrentIndex(0);
    setProgress(0);
    processNextStudio(0);
  };

  // Stop geocoding
  const stopGeocoding = () => {
    setIsGeocoding(false);
    toast.info('Geocoding stopped');
  };

  // Refresh data
  const refreshData = () => {
    loadPendingStudios();
    loadStats();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Studio Geocoding</h2>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh
          </button>
          {!isGeocoding ? (
            <button
              onClick={startGeocoding}
              disabled={pendingStudios.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Start Geocoding
            </button>
          ) : (
            <button
              onClick={stopGeocoding}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Stop Geocoding
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-800">Total Studios</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.withCoordinates}</div>
          <div className="text-sm text-green-800">With Coordinates</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">{stats.withoutCoordinates}</div>
          <div className="text-sm text-yellow-800">Need Geocoding</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.percentage}%</div>
          <div className="text-sm text-purple-800">Complete</div>
        </div>
      </div>

      {/* Progress */}
      {isGeocoding && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {currentIndex} / {pendingStudios.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Studios List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Studios Needing Geocoding ({pendingStudios.length})
        </h3>
        
        {pendingStudios.length === 0 ? (
          <p className="text-gray-500 text-center py-8">All studios have coordinates! 🎉</p>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2">
            {pendingStudios.slice(0, 20).map((studio, index) => (
              <div 
                key={studio.id}
                className={`p-3 rounded-lg border ${
                  index === currentIndex && isGeocoding 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="font-medium text-gray-900">{studio.title}</div>
                <div className="text-sm text-gray-600">{studio.full_address}</div>
                {index === currentIndex && isGeocoding && (
                  <div className="text-xs text-blue-600 mt-1">Processing...</div>
                )}
              </div>
            ))}
            {pendingStudios.length > 20 && (
              <div className="text-center text-gray-500 py-2">
                ... and {pendingStudios.length - 20} more
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleGeocoding;
