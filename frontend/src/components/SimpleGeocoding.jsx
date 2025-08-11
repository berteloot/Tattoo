import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const SimpleGeocoding = () => {
  const [pendingStudios, setPendingStudios] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [geocodedResults, setGeocodedResults] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    withCoordinates: 0,
    withoutCoordinates: 0,
    geocoded: 0
  });

  // Load studios that need geocoding
  const loadPendingStudios = async () => {
    try {
      const response = await fetch('/api/geocoding/pending?limit=500');
      const data = await response.json();
      
      if (data.success) {
        setPendingStudios(data.data);
        console.log(`📋 Loaded ${data.data.length} studios needing geocoding`);
        
        // Log address quality for debugging
        const addressQuality = data.data.reduce((acc, studio) => {
          const hasAddress = studio.address && studio.address.trim().length > 0;
          const hasCity = studio.city && studio.city.trim().length > 0;
          const hasState = studio.state && studio.state.trim().length > 0;
          
          if (hasAddress && hasCity && hasState) acc.complete++;
          else if (hasAddress || hasCity) acc.partial++;
          else acc.incomplete++;
          
          return acc;
        }, { complete: 0, partial: 0, incomplete: 0 });
        
        console.log('📊 Address quality:', addressQuality);
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

  // NEW APPROACH: Store results locally and bulk upload
  const saveCoordinatesLocally = (studioId, latitude, longitude, formattedAddress) => {
    setGeocodedResults(prev => [
      ...prev,
      {
        studioId,
        latitude,
        longitude,
        formattedAddress,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  // NEW APPROACH: Bulk upload all results at once
  const bulkUploadResults = async () => {
    if (geocodedResults.length === 0) {
      toast.error('No results to upload');
      return;
    }

    try {
      toast.info(`Uploading ${geocodedResults.length} results...`);
      
      // Create a simple SQL script for direct database update
      const sqlScript = geocodedResults.map(result => 
        `UPDATE studios SET latitude = ${result.latitude}, longitude = ${result.longitude} WHERE id = '${result.studioId}';`
      ).join('\n');

      // Download the SQL script
      const blob = new Blob([sqlScript], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `geocoding-results-${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`SQL script downloaded with ${geocodedResults.length} updates`);
      
      // Also create a JSON backup
      const jsonBlob = new Blob([JSON.stringify(geocodedResults, null, 2)], { type: 'application/json' });
      const jsonUrl = URL.createObjectURL(jsonBlob);
      const jsonA = document.createElement('a');
      jsonA.href = jsonUrl;
      jsonA.download = `geocoding-results-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(jsonA);
      jsonA.click();
      document.body.removeChild(jsonA);
      URL.revokeObjectURL(jsonUrl);

      // Clear results after successful download
      setGeocodedResults([]);
      
    } catch (error) {
      console.error('Failed to bulk upload:', error);
      toast.error('Failed to create upload files');
    }
  };

  // Process next studio with NEW approach
  const processNextStudio = async (index) => {
    if (index >= pendingStudios.length) {
      // All done!
      setIsGeocoding(false);
      setCurrentIndex(0);
      setProgress(0);
      toast.success(`Geocoding completed! Processed ${geocodedResults.length} studios`);
      
      if (geocodedResults.length > 0) {
        toast.success(`Download the SQL script to apply ${geocodedResults.length} updates to your database`);
      }
      
      loadPendingStudios(); // Refresh list
      loadStats(); // Update stats
      return;
    }

    const studio = pendingStudios[index];
    console.log(`🌍 [${index + 1}/${pendingStudios.length}] Processing: ${studio.title}`);

    try {
      // Geocode the address
      const result = await geocodeAddress(studio.full_address);
      
      // Store result locally instead of trying to save to backend
      saveCoordinatesLocally(studio.id, result.latitude, result.longitude, result.formattedAddress);
      
      console.log(`✅ Successfully geocoded: ${studio.title} → ${result.latitude}, ${result.longitude}`);
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
    setGeocodedResults([]); // Clear previous results
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
          🗺️ Studio Geocoding Tool
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Total Studios</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">With Coordinates</h3>
            <p className="text-2xl font-bold text-green-600">{stats.withCoordinates}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-900">Need Geocoding</h3>
            <p className="text-2xl font-bold text-red-600">{stats.withoutCoordinates}</p>
          </div>
        </div>

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
              🚀 Start Geocoding ({pendingStudios.length} studios)
            </button>
          ) : (
            <button
              onClick={stopGeocoding}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ⏹️ Stop Geocoding
            </button>
          )}

          {geocodedResults.length > 0 && (
            <button
              onClick={bulkUploadResults}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              📥 Download SQL Script ({geocodedResults.length} results)
            </button>
          )}
        </div>

        {/* Progress Bar */}
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
              {pendingStudios[currentIndex]?.title} - {pendingStudios[currentIndex]?.full_address}
            </p>
          </div>
        )}

        {/* Results Summary */}
        {geocodedResults.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-green-900 mb-2">Geocoding Results:</h3>
            <p className="text-green-700">
              Successfully processed {geocodedResults.length} studios. 
              Download the SQL script to apply these updates to your database.
            </p>
          </div>
        )}

        {/* Studios List */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">
            Studios Needing Geocoding ({pendingStudios.length})
          </h3>
          <div className="max-h-96 overflow-y-auto">
            {pendingStudios.map((studio, index) => (
              <div key={studio.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{studio.title}</h4>
                  <p className="text-sm text-gray-600">{studio.full_address}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {studio.latitude && studio.longitude ? (
                    <span className="text-green-600">✅ Has coordinates</span>
                  ) : (
                    <span className="text-red-600">❌ Needs geocoding</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">📋 How to Use:</h3>
          <ol className="list-decimal list-inside text-yellow-800 space-y-1">
            <li>Click "Start Geocoding" to begin processing studios</li>
            <li>The tool will geocode each studio address using Google Maps API</li>
            <li>Results are stored locally (no backend API calls)</li>
            <li>When complete, download the SQL script</li>
            <li>Run the SQL script directly on your database to update coordinates</li>
            <li>This bypasses any API issues and gives you direct control</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SimpleGeocoding;
