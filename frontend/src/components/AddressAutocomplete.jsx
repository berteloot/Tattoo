import React, { useState, useRef, useEffect, useCallback } from 'react'
import { StandaloneSearchBox } from '@react-google-maps/api'
import { Search, MapPin, X } from 'lucide-react'
import { useGoogleMaps } from '../contexts/GoogleMapsContext'

export const AddressAutocomplete = ({ 
  onAddressSelect, 
  placeholder = "Enter address...", 
  className = "",
  initialValue = "",
  disabled = false,
  required = false,
  showClearButton = true
}) => {
  const [searchQuery, setSearchQuery] = useState(initialValue)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const searchBoxRef = useRef(null)
  const inputRef = useRef(null)
  const sessionTokenRef = useRef(null)
  const debounceTimeoutRef = useRef(null)
  
  const { isLoaded: isGoogleMapsLoaded, hasApiKey } = useGoogleMaps()

  // Initialize Places session token when Google Maps loads
  useEffect(() => {
    if (window.google?.maps?.places && !sessionTokenRef.current) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
    }
  }, [isGoogleMapsLoaded])

  // Debounced search function
  const debouncedSearch = useCallback((query) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300) // 300ms debounce
  }, [])

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setError(null)
    
    if (value.trim().length >= 2) {
      debouncedSearch(value)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  // Perform Places API search
  const performSearch = async (query) => {
    if (!window.google?.maps?.places || !searchBoxRef.current) {
      setError('Google Maps not available')
      return
    }

    try {
      setIsLoading(true)
      
      const places = await searchBoxRef.current.getPlaces({
        fields: ['place_id', 'formatted_address', 'geometry'],
        sessionToken: sessionTokenRef.current,
      })

      if (places && places.length > 0) {
        const validPlaces = places.filter(place => 
          place.formatted_address && 
          place.geometry?.location
        )
        
        setSuggestions(validPlaces)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Error searching places:', error)
      setError('Failed to search addresses')
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle address selection
  const handleAddressSelect = (place) => {
    if (place.geometry?.location) {
      const addressData = {
        address: place.formatted_address,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        placeId: place.place_id
      }
      
      setSearchQuery(place.formatted_address)
      setSuggestions([])
      setShowSuggestions(false)
      setError(null)
      
      onAddressSelect(addressData)
    }
  }

  // Handle manual search (Enter key)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchQuery.trim().length >= 2) {
        performSearch(searchQuery.trim())
      }
    }
  }

  // Clear input and suggestions
  const handleClear = () => {
    setSearchQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    setError(null)
    onAddressSelect(null)
    
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Cleanup debounce timeout
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // If no API key, show fallback input
  if (!hasApiKey) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {showClearButton && searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }

  // If Google Maps not loaded, show loading state
  if (!isGoogleMapsLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Loading Google Maps..."
            disabled={true}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
          />
        </div>
        <p className="mt-1 text-sm text-gray-500">Loading Google Maps...</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <StandaloneSearchBox
        ref={searchBoxRef}
        onLoad={(ref) => {
          searchBoxRef.current = ref
        }}
        onPlacesChanged={() => {
          // This will be handled by our manual search
        }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {showClearButton && searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isLoading && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            </div>
          )}
        </div>
      </StandaloneSearchBox>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((place, index) => (
            <button
              key={place.place_id || index}
              onClick={() => handleAddressSelect(place)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {place.formatted_address}
                  </p>
                  {place.geometry?.location && (
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {place.geometry.location.lat().toFixed(6)}, {place.geometry.location.lng().toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Help Text */}
      {!error && searchQuery && suggestions.length === 0 && !isLoading && (
        <p className="mt-1 text-sm text-gray-500">
          No addresses found. Try a different search term.
        </p>
      )}
    </div>
  )
} 