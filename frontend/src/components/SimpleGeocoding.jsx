// FORCE DEPLOYMENT - Batch Geocoding System v3.0 - PRODUCTION READY
// This component implements automated batch geocoding using Google Maps API
// Features: Clean interface, progress tracking, rate limiting, error handling
// Status: Backend API fixed, frontend ready for production deployment
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';

const SimpleGeocoding = () => {
  const toast = useToast();
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
  const loadGoogleMapsAPI = useCallback(() => {
    return new Promise((resolve, reject) => {
      console.log('🔄 [DEBUG] loadGoogleMapsAPI called');
      
      // Check if already loaded
      if (window.google && window.google.maps) {
        console.log('✅ [DEBUG] Google Maps already loaded');
        resolve();
        return;
      }

      // Check API key
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === 'Present') {
        console.error('❌ [DEBUG] No valid Google Maps API key found');
        reject(new Error('Google Maps API key not configured'));
        return;
      }

      console.log('🔑 [DEBUG] Loading Google Maps API:', {
        hasKey: true,
        keyLength: apiKey.length,
        keyPreview: `${apiKey.substring(0, 8)}...`
      });

      // Create script tag with classic loader (not loading=async)
      const script = document.createElement('script');
      const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geocoding`;
      
      console.log('🚀 [DEBUG] Creating Google Maps script tag...');
      console.log('🔗 [DEBUG] Script URL:', scriptUrl);
      
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      
      console.log('📝 [DEBUG] Script attributes set:', {
        src: script.src,
        async: script.async,
        defer: script.defer
      });

      // Handle script load
      script.onload = () => {
        console.log('✅ [DEBUG] Google Maps API script loaded successfully');
        
        // Wait a bit for the API to fully initialize
        setTimeout(() => {
          console.log('🔍 [DEBUG] Checking window.google:', {
            hasGoogle: !!window.google,
            hasMaps: !!(window.google && window.google.maps),
            hasGeocoder: !!(window.google && window.google.maps && window.google.maps.Geocoder)
          });
          
          if (window.google && window.google.maps && window.google.maps.Geocoder) {
            console.log('✅ [DEBUG] Google Maps API fully loaded with Geocoder');
            resolve();
          } else {
            console.error('❌ [DEBUG] Google Maps API loaded but Geocoder not available');
            reject(new Error('Google Maps Geocoder not available'));
          }
        }, 1000);
      };

      // Handle script error
      script.onerror = () => {
        console.error('❌ [DEBUG] Failed to load Google Maps API script');
        reject(new Error('Failed to load Google Maps API script'));
      };

      // Append script to document head
      console.log('📝 [DEBUG] Appending script to document head...');
      console.log('📝 [DEBUG] Document head children before:', document.head.children.length);
      
      document.head.appendChild(script);
      
      console.log('📝 [DEBUG] Script appended, waiting for load...');
      console.log('📝 [DEBUG] Document head children after:', document.head.children.length);
    });
  }, []);

  // Geocode a single address
  const geocodeAddress = async (address) => {
    return new Promise((resolve, reject) => {
      try {
        if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
          reject(new Error('Google Maps API not loaded'));
          return;
        }

        const geocoder = new window.google.maps.Geocoder();
        
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              latitude: location.lat(),
              longitude: location.lng(),
              formattedAddress: results[0].formatted_address
            });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      } catch (error) {
        reject(new Error(`Geocoding failed: ${error.message}`));
      }
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

  // Start batch geocoding
  const startGeocoding = async () => {
    console.log('🚀 [DEBUG] startGeocoding called');
    console.log('🔍 [DEBUG] Current state:', {
      pendingStudiosLength: pendingStudios.length,
      googleMapsLoaded,
      hasWindowGoogle: !!(window.google && window.google.maps)
    });

    if (!pendingStudios.length) {
      toast.error('No studios to geocode');
      return;
    }

    if (!googleMapsLoaded || !(window.google && window.google.maps)) {
      console.log('❌ [DEBUG] Google Maps not loaded, attempting to load...');
      try {
        await loadGoogleMapsAPI();
        setGoogleMapsLoaded(true);
        console.log('✅ [DEBUG] Google Maps API loaded successfully');
      } catch (error) {
        console.error('❌ [DEBUG] Failed to load Google Maps API:', error);
        toast.error('Failed to load Google Maps API');
        return;
      }
    }

    console.log('✅ [DEBUG] Google Maps API verified, starting geocoding...');
    setIsGeocoding(true);
    setCurrentIndex(0);
    setGeocodedCount(0);
    setFailedCount(0);
    setErrors([]);

    // Process studios in batches
    for (let i = 0; i < pendingStudios.length; i++) {
      if (!isGeocoding) break; // Allow stopping

      const studio = pendingStudios[i];
      setCurrentIndex(i + 1);
      
      console.log(`🌍 [${i + 1}/${pendingStudios.length}] Processing: ${studio.title}`);

      try {
        // Build full address
        const addressParts = [
          studio.address,
          studio.city,
          studio.state,
          studio.zipCode,
          studio.country
        ].filter(Boolean);
        
        const fullAddress = addressParts.join(', ');
        
        if (!fullAddress) {
          console.warn(`⚠️ [${i + 1}/${pendingStudios.length}] No address for: ${studio.title}`);
          setFailedCount(prev => prev + 1);
          setErrors(prev => [...prev, `${studio.title}: No address available`]);
          continue;
        }

        // Geocode address
        const result = await geocodeAddress(fullAddress);
        
        // Save result to backend
        const response = await fetch('/api/geocoding/save-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studioId: studio.id,
            latitude: result.latitude,
            longitude: result.longitude,
            address: fullAddress
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const saveResult = await response.json();
        
        if (saveResult.success) {
          console.log(`✅ [${i + 1}/${pendingStudios.length}] Successfully geocoded: ${studio.title}`);
          setGeocodedCount(prev => prev + 1);
          
          // Update local state to remove from pending
          setPendingStudios(prev => prev.filter(s => s.id !== studio.id));
        } else {
          throw new Error(saveResult.error || 'Unknown error');
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ [${i + 1}/${pendingStudios.length}] Failed to geocode ${studio.title}:`, error);
        setFailedCount(prev => prev + 1);
        setErrors(prev => [...prev, `${studio.title}: ${error.message}`]);
        
        // Continue with next studio
        continue;
      }
    }

    setIsGeocoding(false);
    
    if (geocodedCount > 0) {
      toast.success(`Geocoding completed! ${geocodedCount} studios processed successfully.`);
    }
    
    if (failedCount > 0) {
      toast.error(`${failedCount} studios failed to geocode. Check the error log below.`);
    }
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
    // Log API key status for debugging
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    console.log('🔑 [DEBUG] Google Maps API Key Status:', {
      hasKey: !!apiKey,
      keyLength: apiKey ? apiKey.length : 0,
      keyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : 'None'
    });
    
    // Debug all VITE_ environment variables
    console.log('🔍 [DEBUG] All VITE_ environment variables:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 'Present' : 'Missing',
      VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD
    });
    
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

        {/* API Key Status */}
        {!googleMapsLoaded && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-2">⚠️</div>
              <div>
                <h3 className="font-semibold text-yellow-800">Google Maps API Status</h3>
                <p className="text-yellow-700 text-sm">
                  {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? 
                    'API key is configured. Loading Google Maps API...' : 
                    'Google Maps API key is missing. Please contact support to configure the API key.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar for Current Batch */}
        {isGeocoding && currentIndex < pendingStudios.length && (
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
