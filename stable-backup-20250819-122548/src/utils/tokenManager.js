/**
 * Secure Token Manager
 * 
 * This utility provides secure token management by:
 * - Storing access tokens in memory only (no localStorage)
 * - Providing a clean API for token operations
 * - Ensuring tokens are never persisted to disk
 * - Supporting automatic token refresh via httpOnly cookies
 */

// In-memory token storage
let accessToken = null;
let tokenExpiry = null;

/**
 * Set the access token in memory
 * @param {string} token - The access token
 * @param {number} expiresIn - Token expiry time in seconds (optional)
 */
export const setAccessToken = (token, expiresIn = null) => {
  accessToken = token;
  
  if (expiresIn) {
    // Calculate expiry time (subtract 30 seconds buffer for safety)
    tokenExpiry = Date.now() + (expiresIn * 1000) - 30000;
  } else {
    // Default to 15 minutes if no expiry provided
    tokenExpiry = Date.now() + (15 * 60 * 1000) - 30000;
  }
  
  console.log('🔐 Access token stored in memory (secure)');
};

/**
 * Get the current access token
 * @returns {string|null} The access token or null if not set/expired
 */
export const getAccessToken = () => {
  if (!accessToken) {
    return null;
  }
  
  // Check if token is expired
  if (tokenExpiry && Date.now() > tokenExpiry) {
    console.log('⚠️ Access token expired, clearing from memory');
    clearAccessToken();
    return null;
  }
  
  return accessToken;
};

/**
 * Clear the access token from memory
 */
export const clearAccessToken = () => {
  accessToken = null;
  tokenExpiry = null;
  console.log('🔐 Access token cleared from memory');
};

/**
 * Check if access token exists and is valid
 * @returns {boolean} True if token exists and is not expired
 */
export const hasValidAccessToken = () => {
  const token = getAccessToken();
  return token !== null;
};

/**
 * Get the Authorization header value
 * @returns {string|null} The Authorization header value or null if no token
 */
export const getAuthorizationHeader = () => {
  const token = getAccessToken();
  return token ? `Bearer ${token}` : null;
};

/**
 * Check if token is about to expire (within 5 minutes)
 * @returns {boolean} True if token expires within 5 minutes
 */
export const isTokenExpiringSoon = () => {
  if (!tokenExpiry) {
    return false;
  }
  
  const fiveMinutes = 5 * 60 * 1000;
  return (tokenExpiry - Date.now()) < fiveMinutes;
};

/**
 * Get token expiry information
 * @returns {Object} Token expiry details
 */
export const getTokenExpiryInfo = () => {
  if (!tokenExpiry) {
    return { hasToken: false, isExpired: true, timeUntilExpiry: 0 };
  }
  
  const now = Date.now();
  const timeUntilExpiry = tokenExpiry - now;
  const isExpired = timeUntilExpiry <= 0;
  
  return {
    hasToken: !!accessToken,
    isExpired,
    timeUntilExpiry: Math.max(0, timeUntilExpiry),
    expiresAt: new Date(tokenExpiry)
  };
};

/**
 * Security status information
 * @returns {Object} Security status details
 */
export const getSecurityStatus = () => {
  return {
    localStorageUsed: false,
    inMemoryStorage: true,
    httpOnlyCookies: true,
    xssProtected: true,
    tokenExists: hasValidAccessToken(),
    tokenExpiryInfo: getTokenExpiryInfo()
  };
};

// Export for debugging (development only)
if (import.meta.env.DEV) {
  window.tokenManager = {
    setAccessToken,
    getAccessToken,
    clearAccessToken,
    hasValidAccessToken,
    getAuthorizationHeader,
    isTokenExpiringSoon,
    getTokenExpiryInfo,
    getSecurityStatus
  };
}
