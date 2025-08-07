import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const FrontendGeocoding = ({ onGeocodingComplete }) => {
  const [pendingStudios, setPendingStudios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Get Google Maps API key from environment
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps) {
        setGoogleMapsLoaded(true);
        return;
      }

      if (!googleMapsApiKey) {
        console.error('Google Maps API key not configured');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=geocoding`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Maps API loaded for geocoding');
        setGoogleMapsLoaded(true);
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Google Maps API');
        toast.error('Failed to load Google Maps API');
      };

      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();
  }, [googleMapsApiKey]);

  useEffect(() => {
    fetchPendingStudios();
    fetchGeocodingStats();
  }, []);

  const fetchPendingStudios = async () => {
    try {
      const response = await fetch('/api/geocoding/pending?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setPendingStudios(data.data);
        console.log(`📋 Found ${data.data.length} studios needing geocoding`);
      } else {
        toast.error('Failed to fetch pending studios');
      }
    } catch (error) {
      console.error('Error fetching pending studios:', error);
      toast.error('Failed to fetch pending studios');
    }
  };

  const fetchGeocodingStats = async () => {
    try {
      const response = await fetch('/api/geocoding/status');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching geocoding stats:', error);
    }
  };

  const geocodeAddress = async (address) => {
    if (!googleMapsApiKey) {
      throw new Error('Google Maps API key not configured');
    }

    // Wait for Google Maps API to be loaded
    if (!googleMapsLoaded) {
      throw new Error('Google Maps API not loaded yet. Please wait...');
    }

    // Ensure Google Maps API is loaded
    if (!window.google || !window.google.maps) {
      throw new Error('Google Maps API not loaded. Please ensure the API is properly loaded.');
    }

    // Use Google Maps Geocoding API
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location;
          resolve({
            success: true,
            latitude: location.lat(),
            longitude: location.lng(),
            formatted_address: results[0].formatted_address
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  };

  const saveGeocodingResult = async (studioId, latitude, longitude, address) => {
    try {
      const response = await fetch('/api/geocoding/save-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studioId,
          latitude,
          longitude,
          address
        })
      });

      if (response.status === 429) {
        // Rate limited - wait longer and retry
        console.log('⚠️ Rate limited, waiting 10 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        return await saveGeocodingResult(studioId, latitude, longitude, address);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Saved coordinates for studio ${studioId}`);
        return true;
      } else {
        throw new Error(data.error || 'Failed to save coordinates');
      }
    } catch (error) {
      console.error('Error saving geocoding result:', error);
      throw error;
    }
  };

  const processNextStudio = async (index = currentIndex) => {
    if (index >= pendingStudios.length) {
      setIsGeocoding(false);
      toast.success('Geocoding completed!');
      fetchPendingStudios(); // Refresh the list
      fetchGeocodingStats(); // Update stats
      if (onGeocodingComplete) {
        onGeocodingComplete();
      }
      return;
    }

    const studio = pendingStudios[index];
    console.log(`🌍 [${index + 1}/${pendingStudios.length}] Processing: ${studio.title}`);

    try {
      // Geocode the address
      const geocodeResult = await geocodeAddress(studio.full_address);
      
      if (geocodeResult.success) {
        // Save the result
        await saveGeocodingResult(
          studio.id,
          geocodeResult.latitude,
          geocodeResult.longitude,
          studio.full_address
        );
        
        console.log(`✅ Successfully geocoded: ${studio.title} → ${geocodeResult.latitude}, ${geocodeResult.longitude}`);
        toast.success(`Geocoded: ${studio.title}`);
      }
    } catch (error) {
      console.error(`❌ Failed to geocode ${studio.title}:`, error.message);
      toast.error(`Failed: ${studio.title}`);
    }

    // Move to next studio
    const nextIndex = index + 1;
    setCurrentIndex(nextIndex);
    setProgress((nextIndex / pendingStudios.length) * 100);

    // Add delay to respect rate limits (increased to avoid 429 errors)
    setTimeout(() => {
      processNextStudio(nextIndex);
    }, 3000); // 3 second delay to avoid rate limiting
  };

  const startGeocoding = () => {
    if (pendingStudios.length === 0) {
      toast.error('No studios need geocoding');
      return;
    }

    if (!googleMapsLoaded) {
      toast.error('Google Maps API not loaded yet. Please wait a moment and try again.');
      return;
    }

    setIsGeocoding(true);
    setCurrentIndex(0);
    setProgress(0);
    processNextStudio();
  };

  const stopGeocoding = () => {
    setIsGeocoding(false);
    toast.info('Geocoding stopped');
  };

  const clearCache = async () => {
    try {
      const response = await fetch('/api/geocoding/cache', {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Cache cleared: ${data.data.deleted_count} entries removed`);
        fetchGeocodingStats();
      } else {
        toast.error('Failed to clear cache');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  if (!googleMapsApiKey) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Google Maps API Key Required</h3>
        <p className="text-yellow-700 mb-4">
          Frontend geocoding requires a Google Maps API key. Please set VITE_GOOGLE_MAPS_API_KEY in your environment.
        </p>
        <div className="text-sm text-yellow-600">
          <p>• The API key should have Geocoding API enabled</p>
          <p>• Referer restrictions are allowed for frontend usage</p>
          <p>• Create a new key at: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">🗺️ Frontend Geocoding</h2>
      
      {/* Google Maps API Status */}
      <div className={`mb-4 p-3 rounded-lg ${googleMapsLoaded ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center">
          <span className={`mr-2 ${googleMapsLoaded ? 'text-green-600' : 'text-yellow-600'}`}>
            {googleMapsLoaded ? '✅' : '⏳'}
          </span>
          <span className={`font-medium ${googleMapsLoaded ? 'text-green-800' : 'text-yellow-800'}`}>
            {googleMapsLoaded ? 'Google Maps API Ready' : 'Loading Google Maps API...'}
          </span>
        </div>
        {!googleMapsLoaded && (
          <p className="text-sm text-yellow-700 mt-1">
            Please wait for the API to load before starting geocoding.
          </p>
        )}
      </div>
      
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total_studios}</div>
            <div className="text-sm text-blue-700">Total Studios</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.geocoded_studios}</div>
            <div className="text-sm text-green-700">Geocoded</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.missing_coordinates}</div>
            <div className="text-sm text-red-700">Missing</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.percentage_complete}%</div>
            <div className="text-sm text-purple-700">Complete</div>
          </div>
        </div>
      )}

      {/* Pending Studios */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">
          Studios Needing Geocoding ({pendingStudios.length})
        </h3>
        
        {pendingStudios.length > 0 ? (
          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {pendingStudios.slice(0, 10).map((studio, index) => (
              <div key={studio.id} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                <div className="font-medium">{studio.title}</div>
                <div className="text-sm text-gray-600">{studio.full_address}</div>
              </div>
            ))}
            {pendingStudios.length > 10 && (
              <div className="p-3 text-sm text-gray-500 text-center">
                ... and {pendingStudios.length - 10} more
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            🎉 All studios have been geocoded!
          </div>
        )}
      </div>

      {/* Progress */}
      {isGeocoding && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {currentIndex + 1} / {pendingStudios.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {currentIndex < pendingStudios.length && (
            <div className="mt-2 text-sm text-gray-600">
              Currently processing: {pendingStudios[currentIndex]?.title}
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {!isGeocoding ? (
          <button
            onClick={startGeocoding}
            disabled={pendingStudios.length === 0 || !googleMapsLoaded}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {googleMapsLoaded ? '🚀 Start Geocoding' : '⏳ Loading API...'}
          </button>
        ) : (
          <button
            onClick={stopGeocoding}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            ⏹️ Stop Geocoding
          </button>
        )}
        
        <button
          onClick={fetchPendingStudios}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          🔄 Refresh
        </button>
        
        <button
          onClick={clearCache}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
        >
          🗑️ Clear Cache
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">How it works:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Uses Google Maps Geocoding API from the frontend (works with referer restrictions)</li>
          <li>• Automatically saves results to the database</li>
          <li>• Includes rate limiting (3 second delay between requests to avoid server limits)</li>
          <li>• Automatically retries if rate limited (10 second wait)</li>
          <li>• Caches results to avoid duplicate API calls</li>
          <li>• Shows real-time progress and statistics</li>
        </ul>
      </div>
    </div>
  );
};

export default FrontendGeocoding; 