import React, { createContext, useContext } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_LIBRARIES = ['places'];

const GoogleMapsContext = createContext();

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);
  if (!context) {
    throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
  }
  return context;
};

export const GoogleMapsProvider = ({ children }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
    id: 'gmaps-loader', // stable id prevents duplicates
  });

  const value = {
    isLoaded,
    loadError,
    hasApiKey: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  };

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
};
