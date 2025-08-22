import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const StudioSelect = ({ 
  selectedStudio, 
  onStudioSelect, 
  onStudioClear,
  placeholder = "Search for a studio...",
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [studios, setStudios] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Search studios when search term changes
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setStudios([]);
      return;
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearching(true);
        setError(null);
        
        const response = await api.get(`/studios?search=${encodeURIComponent(searchTerm.trim())}&limit=10`);
        
        if (response.data.success) {
          setStudios(response.data.data.studios);
        } else {
          setError('Failed to search studios');
        }
      } catch (error) {
        console.error('Error searching studios:', error);
        setError('Error searching studios');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStudioSelect = (studio) => {
    onStudioSelect(studio);
    setSearchTerm(studio.title);
    setIsOpen(false);
  };

  const handleClear = () => {
    onStudioClear();
    setSearchTerm('');
    setStudios([]);
    setIsOpen(false);
  };

  const getStudioStatus = (studio) => {
    if (studio.claimedBy) {
      return { icon: Users, text: 'Claimed', color: 'text-blue-600' };
    }
    if (studio.isVerified) {
      return { icon: CheckCircle, text: 'Verified', color: 'text-green-600' };
    }
    return { icon: AlertCircle, text: 'Unverified', color: 'text-yellow-600' };
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {/* Clear button for selected studio */}
        {selectedStudio && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title="Clear selection"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (searchTerm.trim().length >= 2 || studios.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isSearching ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Searching studios...
            </div>
          ) : error ? (
            <div className="px-4 py-3 text-center text-red-500">
              {error}
            </div>
          ) : studios.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-500">
              No studios found
            </div>
          ) : (
            <div className="py-1">
              {studios.map((studio) => {
                const status = getStudioStatus(studio);
                const StatusIcon = status.icon;
                
                return (
                  <button
                    key={studio.id}
                    onClick={() => handleStudioSelect(studio)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {studio.title}
                          </h4>
                          <StatusIcon className={`h-4 w-4 ${status.color}`} />
                        </div>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-500 truncate">
                            {[studio.address, studio.city, studio.state].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        
                        {studio._count?.studioArtists > 0 && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Users className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {studio._count.studioArtists} artist{studio._count.studioArtists !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-3 flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          studio.claimedBy 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {studio.claimedBy ? 'Join' : 'Claim'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Selected Studio Display */}
      {selectedStudio && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900">
                {selectedStudio.title}
              </h4>
              <p className="text-xs text-blue-700 mt-1">
                {[selectedStudio.address, selectedStudio.city, selectedStudio.state].filter(Boolean).join(', ')}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  selectedStudio.claimedBy 
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {selectedStudio.claimedBy ? 'Join Existing Studio' : 'Claim New Studio'}
                </span>
                {selectedStudio.isVerified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
              </div>
            </div>
            
            <button
              onClick={handleClear}
              className="ml-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioSelect;
