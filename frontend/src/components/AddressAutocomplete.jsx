import { useState, useEffect, useRef } from 'react'
import { LoadScript, StandaloneSearchBox } from '@react-google-maps/api'
import { MapPin, Search } from 'lucide-react'

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onPlaceSelect, 
  placeholder = "Enter your address...",
  className = "",
  disabled = false 
}) => {
  const [searchBox, setSearchBox] = useState(null)
  const [inputValue, setInputValue] = useState(value || '')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(e) // Call the original onChange handler
    
    // Show suggestions if there's text
    if (newValue.length > 2) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }

  // Handle search box load
  const onSearchBoxLoad = (ref) => {
    setSearchBox(ref)
  }

  // Handle place selection from search box
  const onPlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces()
      if (places && places.length > 0) {
        const place = places[0]
        handlePlaceSelect(place)
      }
    }
  }

  // Handle place selection from suggestions
  const handlePlaceSelect = (place) => {
    if (!place) return

    // Extract address components
    const addressComponents = place.address_components || []
    let streetNumber = ''
    let route = ''
    let city = ''
    let state = ''
    let zipCode = ''
    let country = ''

    // Parse address components
    addressComponents.forEach(component => {
      const types = component.types
      if (types.includes('street_number')) {
        streetNumber = component.long_name
      } else if (types.includes('route')) {
        route = component.long_name
      } else if (types.includes('locality')) {
        city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name
      } else if (types.includes('country')) {
        country = component.long_name
      }
    })

    // Construct full address
    const fullAddress = place.formatted_address || `${streetNumber} ${route}`.trim()
    
    // Update input value
    setInputValue(fullAddress)
    setShowSuggestions(false)
    setSuggestions([])

    // Call the onPlaceSelect callback with parsed data
    if (onPlaceSelect) {
      onPlaceSelect({
        address: fullAddress,
        city,
        state,
        zipCode,
        country,
        latitude: place.geometry?.location?.lat(),
        longitude: place.geometry?.location?.lng(),
        placeId: place.place_id
      })
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    handlePlaceSelect(suggestion)
  }

  // Handle input focus
  const handleInputFocus = () => {
    if (inputValue.length > 2) {
      setShowSuggestions(true)
    }
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // If no API key, fall back to regular input
  if (!googleMapsApiKey) {
    return (
      <div className={`relative ${className}`}>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            disabled={disabled}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
          />
        </div>
        {!googleMapsApiKey && (
          <p className="text-xs text-gray-500 mt-1">
            Google Maps API key not configured. Address autocomplete disabled.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <LoadScript
        googleMapsApiKey={googleMapsApiKey}
        libraries={['places']}
      >
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <StandaloneSearchBox
            onLoad={onSearchBoxLoad}
            onPlacesChanged={onPlacesChanged}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              disabled={disabled}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={placeholder}
            />
          </StandaloneSearchBox>
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center">
                  <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.structured_formatting?.main_text || suggestion.description}
                    </div>
                    {suggestion.structured_formatting?.secondary_text && (
                      <div className="text-xs text-gray-500">
                        {suggestion.structured_formatting.secondary_text}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </LoadScript>
    </div>
  )
}

export default AddressAutocomplete 