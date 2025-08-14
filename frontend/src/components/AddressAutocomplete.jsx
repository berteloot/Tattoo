import { useState, useEffect, useRef } from 'react'
import { LoadScript, StandaloneSearchBox } from '@react-google-maps/api'
import { MapPin } from 'lucide-react'

// Static libraries array to prevent LoadScript reloading
const GOOGLE_MAPS_LIBRARIES = ['places']

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onPlaceSelect, 
  placeholder = "Enter your address...",
  className = "",
  disabled = false 
}) => {
  const [inputValue, setInputValue] = useState(value || '')
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const inputRef = useRef(null)

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
  }

  // Handle script load error
  const onScriptLoadError = (error) => {
    console.error('Google Maps script load error:', error)
    setApiError('Failed to load Google Maps. Please check your API key configuration.')
  }

  const [searchBox, setSearchBox] = useState(null)

  // Handle search box load
  const onSearchBoxLoad = (ref) => {
    setSearchBox(ref)
    setApiError(null) // Clear any previous errors
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

    // Parse address components with comprehensive international support
    addressComponents.forEach(component => {
      const types = component.types
      if (types.includes('street_number')) {
        streetNumber = component.long_name
      } else if (types.includes('route')) {
        route = component.long_name
      } else if (types.includes('locality') || types.includes('sublocality')) {
        city = component.long_name
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name
      } else if (types.includes('country')) {
        country = component.long_name
      }
    })

    // Enhanced fallback for international addresses
    if (!city && addressComponents.length > 0) {
      // Try multiple fallback strategies for city
      const cityComponent = addressComponents.find(comp => 
        comp.types.includes('sublocality') || 
        comp.types.includes('administrative_area_level_2') ||
        comp.types.includes('locality') ||
        comp.types.includes('administrative_area_level_3')
      )
      if (cityComponent) {
        city = cityComponent.long_name
      }
    }

    // For non-USA addresses, if state is still empty, try to find it
    if (!state && addressComponents.length > 0) {
      const stateComponent = addressComponents.find(comp => 
        comp.types.includes('administrative_area_level_1') ||
        comp.types.includes('administrative_area_level_2')
      )
      if (stateComponent) {
        state = stateComponent.short_name || stateComponent.long_name
      }
    }

    // Log the parsed components for debugging
    console.log('📍 Address components parsed:', {
      streetNumber, route, city, state, zipCode, country,
      addressComponents: addressComponents.map(comp => ({
        types: comp.types,
        long: comp.long_name,
        short: comp.short_name
      }))
    });

    // Construct street address only (without city/state/zip)
    const streetAddress = `${streetNumber} ${route}`.trim()
    
    // Update input value to show only street address
    setInputValue(streetAddress)

    // Call the onPlaceSelect callback with parsed data
    if (onPlaceSelect) {
      onPlaceSelect({
        address: streetAddress, // Only street address
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
            disabled={disabled}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={placeholder}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Google Maps API key not configured. Address autocomplete disabled.
        </p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <LoadScript
        googleMapsApiKey={googleMapsApiKey}
        libraries={GOOGLE_MAPS_LIBRARIES}
        onError={onScriptLoadError}
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

        {/* Error message */}
        {apiError && (
          <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-600">
              ⚠️ {apiError}
            </p>
            <p className="text-xs text-red-500 mt-1">
              Address autocomplete is disabled. You can still type manually.
            </p>
          </div>
        )}
      </LoadScript>
    </div>
  )
}

export default AddressAutocomplete 