/**
 * Content Security Policy (CSP) Configuration
 * Minimal and verified CSP directives for production use
 * Only includes endpoints that are actually used by the application
 */

/**
 * Get minimal CSP configuration for production
 * Only includes verified endpoints for Cloudinary and Google Maps
 */
const getCSPConfig = () => {
  // Base CSP configuration
  const baseCSP = {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
    connectSrc: ["'self'", "wss:", "ws:"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: []
  };

  // Add Cloudinary support only if configured
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    baseCSP.imgSrc = [
      "'self'",
      "data:",
      "blob:",
      `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}`,
      `https://*.cloudinary.com`
    ];
  } else {
    // Fallback for when Cloudinary is not configured
    baseCSP.imgSrc = ["'self'", "data:", "blob:"];
  }

  // Add Google Maps support only if API key is configured
  if (process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY) {
    // Only include the specific Google Maps endpoints actually used
    baseCSP.scriptSrc = [
      "'self'",
      "'unsafe-inline'", // Required for React development
      "https://maps.googleapis.com" // Only the main Maps API
    ];
    
    baseCSP.scriptSrcElem = [
      "'self'",
      "'unsafe-inline'",
      "https://maps.googleapis.com"
    ];

    // Add only the specific Google domains actually used
    baseCSP.imgSrc = [
      ...baseCSP.imgSrc,
      "https://maps.googleapis.com", // Maps API
      "https://maps.gstatic.com",   // Maps static resources
      "https://*.googleapis.com",   // Google APIs (minimal)
      "https://*.gstatic.com"       // Google static resources (minimal)
    ];

    // Add only the specific connect sources needed
    baseCSP.connectSrc = [
      ...baseCSP.connectSrc,
      "https://maps.googleapis.com",
      "https://maps.gstatic.com"
    ];
  }

  return baseCSP;
};

/**
 * Get CSP configuration for development (more permissive)
 */
const getDevCSPConfig = () => {
  const devCSP = getCSPConfig();
  
  // Add development-specific sources
  devCSP.scriptSrc = [
    ...devCSP.scriptSrc,
    "'unsafe-eval'" // Required for React development mode
  ];
  
  devCSP.scriptSrcElem = [
    ...devCSP.scriptSrcElem,
    "'unsafe-eval'"
  ];

  return devCSP;
};

/**
 * Get appropriate CSP configuration based on environment
 */
const getCSPForEnvironment = () => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    return getDevCSPConfig();
  }
  
  return getCSPConfig();
};

/**
 * Validate CSP configuration
 */
const validateCSP = (cspConfig) => {
  const requiredDirectives = ['defaultSrc', 'styleSrc', 'imgSrc', 'scriptSrc'];
  const missingDirectives = requiredDirectives.filter(dir => !cspConfig[dir]);
  
  if (missingDirectives.length > 0) {
    throw new Error(`Missing required CSP directives: ${missingDirectives.join(', ')}`);
  }
  
  return true;
};

/**
 * Log CSP configuration for debugging
 */
const logCSPConfig = (cspConfig) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    console.log('🔒 CSP Configuration:', JSON.stringify(cspConfig, null, 2));
  }
};

module.exports = {
  getCSPConfig,
  getDevCSPConfig,
  getCSPForEnvironment,
  validateCSP,
  logCSPConfig
};
