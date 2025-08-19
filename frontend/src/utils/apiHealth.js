import { api } from '../services/api'

// Global API health state
let apiHealthStatus = {
  isHealthy: true,
  lastCheck: null,
  errorCount: 0
}

// API Health Check Utility
export const checkApiHealth = async () => {
  try {
    const response = await fetch('/api/health')
    return response.ok
  } catch (error) {
    console.error('API health check failed:', error)
    return false
  }
}

// Retry mechanism with exponential backoff
export const retryWithBackoff = async (apiCall, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      // Don't retry on rate limiting (429) or authentication errors (401, 403)
      if (error.response?.status === 429 || 
          error.response?.status === 401 || 
          error.response?.status === 403) {
        throw error
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`API call failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// Rate limit aware API call wrapper
export const rateLimitAwareCall = async (apiCall, fallbackValue = null) => {
  try {
    return await apiCall()
  } catch (error) {
    if (error.response?.status === 429) {
      console.log('Rate limit exceeded, using fallback value')
      return fallbackValue
    }
    throw error
  }
}

// Get current API health status
export const getApiHealthStatus = () => apiHealthStatus

// Check if we should use fallback data
export const shouldUseFallback = () => {
  // If API is healthy, use real data
  if (apiHealthStatus.isHealthy) return false
  
  // If we've had multiple errors recently, use fallback
  if (apiHealthStatus.errorCount > 2) return true
  
  // If last check was more than 30 seconds ago, try API again
  if (apiHealthStatus.lastCheck && Date.now() - apiHealthStatus.lastCheck > 30000) {
    return false // Try API again
  }
  
  return true
}

// Enhanced API call with fallback
export const apiCallWithFallback = async (apiCall, fallbackData) => {
  try {
    // Check if we should try the API
    if (shouldUseFallback()) {
      console.log('Using fallback data due to API issues')
      return { success: true, data: fallbackData, isFallback: true }
    }
    
    const response = await apiCall()
    
    // If successful, mark API as healthy
    if (response?.data?.success) {
      apiHealthStatus.isHealthy = true
      apiHealthStatus.errorCount = 0
    }
    
    return { success: true, data: response.data, isFallback: false }
  } catch (error) {
    console.error('API call failed:', error.message)
    
    // Mark API as unhealthy
    apiHealthStatus.isHealthy = false
    apiHealthStatus.errorCount += 1
    
    // Return fallback data
    return { success: true, data: fallbackData, isFallback: true }
  }
} 

/**
 * Safely check if Google Maps API is ready and available
 * @returns {boolean} True if Google Maps is ready, false otherwise
 */
export const isGoogleMapsReady = () => {
  try {
    return !!(window.google && window.google.maps && window.google.maps.Map);
  } catch (error) {
    console.warn('Error checking Google Maps readiness:', error);
    return false;
  }
}

/**
 * Safely access Google Maps objects with fallback
 * @param {Function} accessor - Function that accesses Google Maps API
 * @param {any} fallback - Fallback value if Google Maps is not ready
 * @returns {any} Result of accessor function or fallback
 */
export const safeGoogleMapsAccess = (accessor, fallback = undefined) => {
  try {
    if (isGoogleMapsReady()) {
      return accessor();
    }
    return fallback;
  } catch (error) {
    console.warn('Error accessing Google Maps API:', error);
    return fallback;
  }
} 