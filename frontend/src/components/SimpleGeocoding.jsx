// FORCE DEPLOYMENT - Batch Geocoding System v2.0
// This component implements automated batch geocoding using Google Maps API
// Features: Clean interface, progress tracking, rate limiting, error handling
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const SimpleGeocoding = () => {
  const [pendingStudios, setPendingStudios] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [batchSize, setBatchSize] = useState(5);

  // Load studios that need geocoding
  const loadPendingStudios = async () => {
    try {
      const response = await fetch('/api/geocoding/pending?limit=1000');
      const data = await response.json();
      
      if (data.success) {
        setPendingStudios(data.data);
        console.log(`📋 Loaded ${data.data.length} studios needing geocoding`);
      }
    } catch (error) {
      console.error('Failed to load pending studios:', error);
      toast.error('Failed to load studios');
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await fetch('/api/geocoding/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Load Google Maps API
  const loadGoogleMapsAPI = () => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        setGoogleMapsLoaded(true);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=geocoding&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setGoogleMapsLoaded(true);
        console.log('✅ Google Maps API loaded for geocoding');
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);
    });
  };

  // Geocode a single address
  const geocodeAddress = async (address) => {
    return new Promise((resolve, reject) => {
      if (!window.google || !window.google.maps) {
        reject(new Error('Google Maps API not loaded'));
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            latitude: location.lat(),
            longitude: location.lng(),
            formattedAddress: results[0].formatted_address
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

  // Process next studio
  const processNextStudio = async (index) => {
    if (index >= pendingStudios.length) {
      // All done!
      setIsGeocoding(false);
      setCurrentIndex(0);
      setProgress(0);
      toast.success(`Geocoding completed! Processed ${pendingStudios.length} studios`);
      
      loadPendingStudios(); // Refresh list
      loadStats(); // Update stats
      return;
    }

    const studio = pendingStudios[index];
    console.log(`🌍 [${index + 1}/${pendingStudios.length}] Processing: ${studio.title}`);

    try {
      // Geocode the address
      const result = await geocodeAddress(studio.fullAddress);
      
      // Save to backend
      const saveResponse = await fetch('/api/geocoding/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studioId: studio.id,
          latitude: result.latitude,
          longitude: result.longitude,
          address: studio.fullAddress
        }),
      });

      if (saveResponse.ok) {
        console.log(`✅ Successfully geocoded: ${studio.title} → ${result.latitude}, ${result.longitude}`);
        toast.success(`Geocoded: ${studio.title}`, { duration: 2000 });
      } else {
        throw new Error('Failed to save coordinates');
      }
      
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
  const startGeocoding = async () => {
    if (pendingStudios.length === 0) {
      toast.error('No studios to geocode');
      return;
    }
    
    if (!googleMapsLoaded) {
      try {
        toast.info('Loading Google Maps API...');
        await loadGoogleMapsAPI();
        toast.success('Google Maps API loaded!');
      } catch (error) {
        toast.error('Failed to load Google Maps API');
        return;
      }
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

  // Load data on component mount
  useEffect(() => {
    loadPendingStudios();
    loadStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🗺️ Batch Studio Geocoding Tool
        </h1>
        
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Total Studios</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalStudios}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">With Coordinates</h3>
              <p className="text-2xl font-bold text-green-600">{stats.studiosWithCoords}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="font-semibold text-red-900">Need Geocoding</h3>
              <p className="text-2xl font-bold text-red-600">{stats.studiosNeedingGeocoding}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Progress</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.progress}%</p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {stats && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-4">
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

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄 Refresh Data
          </button>
          
          {!isGeocoding ? (
            <button
              onClick={startGeocoding}
              disabled={pendingStudios.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              🚀 Start Batch Geocoding ({pendingStudios.length} studios)
            </button>
          ) : (
            <button
              onClick={stopGeocoding}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ⏹️ Stop Geocoding
            </button>
          )}
        </div>

        {/* Progress Bar for Current Batch */}
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

        {/* Current Status */}
        {isGeocoding && currentIndex < pendingStudios.length && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Currently Processing:</h3>
            <p className="text-blue-700">
              {pendingStudios[currentIndex]?.title} - {pendingStudios[currentIndex]?.fullAddress}
            </p>
          </div>
        )}

        {/* Studios List - Limited Display */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">
            Studios Needing Geocoding ({pendingStudios.length})
          </h3>
          
          {pendingStudios.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-green-500 text-6xl mb-4">🎉</div>
              <p className="text-gray-600">All studios have coordinates!</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {/* Show only first 10 studios to keep interface manageable */}
              {pendingStudios.slice(0, 10).map((studio, index) => (
                <div key={studio.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{studio.title}</h4>
                    <p className="text-sm text-gray-600">{studio.fullAddress}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {index < 10 ? (
                      <span className="text-blue-600">Next in batch</span>
                    ) : (
                      <span className="text-gray-400">Queued</span>
                    )}
                  </div>
                </div>
              ))}
              
              {pendingStudios.length > 10 && (
                <div className="text-center py-4 text-gray-500">
                  ... and {pendingStudios.length - 10} more studios
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">📋 How to Use:</h3>
          <ol className="list-decimal list-inside text-yellow-800 space-y-1">
            <li>Click "Start Batch Geocoding" to begin processing studios</li>
            <li>The tool will automatically geocode each studio address using Google Maps API</li>
            <li>Coordinates are saved directly to your database</li>
            <li>Processes studios in batches with 2-second delays to respect API limits</li>
            <li>You can stop the process at any time</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SimpleGeocoding;
