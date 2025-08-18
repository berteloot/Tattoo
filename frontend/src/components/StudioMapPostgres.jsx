import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { toast } from 'react-hot-toast';

const StudioMapPostgres = ({ 
  center = { lat: 40.7128, lng: -74.0060 }, // Default to NYC
  zoom = 10,
  height = '500px',
  showInfoWindows = true,
  onStudioClick = null
}) => {
  const [studios, setStudios] = useState([]);
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const mapRef = useRef(null);

  // Fetch studios with geocoding from PostgreSQL
  const fetchStudios = async (bounds = null) => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/geocoding/studios';
      const params = new URLSearchParams();

      // Add bounding box parameters if available
      if (bounds) {
        params.append('lat_min', bounds.getSouthWest().lat());
        params.append('lat_max', bounds.getNorthEast().lat());
        params.append('lng_min', bounds.getSouthWest().lng());
        params.append('lng_max', bounds.getNorthEast().lng());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        // Handle both old and new data structures
        let studiosData = data.data;
        
        // If data.data.features exists (GeoJSON format), use that
        if (data.data.features) {
          studiosData = data.data.features;
        }
        
        // Add default values for missing fields to prevent errors
        const processedStudios = studiosData.map(studio => {
          // Handle both GeoJSON and direct studio formats
          const studioData = studio.properties || studio;
          return {
            ...studioData,
            phoneNumber: studioData.phoneNumber || null,
            email: studioData.email || null,
            website: studioData.website || null,
            isVerified: studioData.isVerified || false,
            isFeatured: studioData.isFeatured || false,
            _count: {
              artists: studioData._count?.studioArtists || 0
            }
          };
        });
        
        setStudios(processedStudios);
        console.log(`🗺️ Loaded ${processedStudios.length} studios from PostgreSQL geocoding`);
      } else {
        throw new Error(data.error || 'Failed to fetch studios');
      }
    } catch (err) {
      console.error('Error fetching studios:', err);
      setError(err.message);
      toast.error('Failed to load studios on map');
    } finally {
      setLoading(false);
    }
  };

  // Handle map bounds change
  const handleBoundsChanged = () => {
    if (mapRef.current) {
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        setMapBounds(bounds);
        // Optionally fetch studios for new bounds
        // fetchStudios(bounds);
      }
    }
  };

  // Handle map load
  const handleMapLoad = (map) => {
    mapRef.current = map;
    // Initial fetch of all studios
    fetchStudios();
  };

  // Handle marker click
  const handleMarkerClick = (studio) => {
    setSelectedStudio(studio);
    if (onStudioClick) {
      onStudioClick(studio);
    }
  };

  // Handle info window close
  const handleInfoWindowClose = () => {
    setSelectedStudio(null);
  };

  // Initial load
  useEffect(() => {
    fetchStudios();
  }, []);

  // Get Google Maps API key
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <div style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        border: '1px solid #ddd',
        borderRadius: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3>🗺️ Studio Map</h3>
          <p>Google Maps API key not configured</p>
          <p>Studios loaded: {studios.length}</p>
          {studios.length > 0 && (
            <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '20px' }}>
              <h4>Available Studios:</h4>
              {studios.map((studio) => (
                <div key={studio.properties.id} style={{ 
                  padding: '10px', 
                  margin: '5px 0', 
                  backgroundColor: 'white', 
                  borderRadius: '4px',
                  border: '1px solid #eee'
                }}>
                  <strong>{studio.properties.name}</strong>
                  <br />
                  <small>{studio.properties.full_address}</small>
                  {studio.properties.is_verified && (
                    <span style={{ color: 'green', marginLeft: '10px' }}>✓ Verified</span>
                  )}
                  {studio.properties.is_featured && (
                    <span style={{ color: 'blue', marginLeft: '10px' }}>⭐ Featured</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>🗺️</div>
            <div>Loading studios...</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Using PostgreSQL geocoding
            </div>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          zIndex: 1000,
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          padding: '10px',
          color: '#c33'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <LoadScript googleMapsApiKey={googleMapsApiKey}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={zoom}
          onLoad={handleMapLoad}
          onBoundsChanged={handleBoundsChanged}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          }}
        >
          {/* Render studio markers */}
          {studios.map((studio) => {
            // Handle both GeoJSON and direct studio formats
            let coordinates, position, studioId, studioName, studioAddress, isVerified, isFeatured;
            
            if (studio.geometry && studio.geometry.coordinates) {
              // GeoJSON format
              coordinates = studio.geometry.coordinates;
              studioId = studio.properties.id;
              studioName = studio.properties.name;
              studioAddress = studio.properties.full_address;
              isVerified = studio.properties.is_verified;
              isFeatured = studio.properties.is_featured;
            } else {
              // Direct studio object format
              coordinates = [studio.longitude, studio.latitude];
              studioId = studio.id;
              studioName = studio.title;
              studioAddress = studio.fullAddress || `${studio.address}, ${studio.city}, ${studio.state}`;
              isVerified = studio.isVerified;
              isFeatured = studio.isFeatured;
            }
            
            position = {
              lng: coordinates[0],
              lat: coordinates[1]
            };

            return (
              <Marker
                key={studioId}
                position={position}
                onClick={() => handleMarkerClick(studio)}
                icon={{
                  url: isFeatured 
                    ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                    : isVerified
                    ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                    : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: window.google?.maps ? new window.google.maps.Size(32, 32) : undefined
                }}
              />
            );
          })}

          {/* Info window for selected studio */}
          {showInfoWindows && selectedStudio && (
            <InfoWindow
              position={{
                lng: selectedStudio.longitude || selectedStudio.geometry?.coordinates?.[0],
                lat: selectedStudio.latitude || selectedStudio.geometry?.coordinates?.[1]
              }}
              onCloseClick={handleInfoWindowClose}
            >
              <div style={{ padding: '5px', maxWidth: '250px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                  {selectedStudio.title || selectedStudio.properties?.name}
                </h3>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                  {selectedStudio.fullAddress || selectedStudio.properties?.full_address}
                </p>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {(selectedStudio.isVerified || selectedStudio.properties?.is_verified) && (
                    <span style={{ color: 'green', marginRight: '10px' }}>✓ Verified</span>
                  )}
                  {(selectedStudio.isFeatured || selectedStudio.properties?.is_featured) && (
                    <span style={{ color: 'blue' }}>⭐ Featured</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    // Navigate to studio detail page
                    const studioId = selectedStudio.id || selectedStudio.properties?.id;
                    window.location.href = `/studios/${studioId}`;
                  }}
                  style={{
                    marginTop: '10px',
                    padding: '5px 10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  View Details
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Studio count indicator */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        📍 {studios.length} studios loaded
        <br />
        <small style={{ color: '#666' }}>PostgreSQL geocoding</small>
      </div>
    </div>
  );
};

export default StudioMapPostgres; 