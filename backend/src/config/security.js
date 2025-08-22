const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
import cors from "cors";

const allowedOrigins = [
  "https://tattooedworld.org",
  "https://www.tattooedworld.org",
  // keep these two during migration/testing; you can remove later
  "https://api.tattooedworld.org",
  "https://tattooed-world-backend.onrender.com"
];

export const corsMiddleware = cors({
  origin: (origin, cb) => {
    // Allow non-browser requests (no Origin) like curl/health checks
    if (!origin) return cb(null, true);

    // Strict match
    if (allowedOrigins.includes(origin)) return cb(null, true);

    // Optional: allow localhost for local dev
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return cb(null, true);

    // Log rejected origins for debugging
    console.log(`🚫 CORS blocked origin: ${origin}`);
    console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
    return cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With"
  ],
  credentials: true, // only if you use cookies or auth headers and need credentials
  maxAge: 86400
});

// Security configuration with best practices
const securityConfig = {
  // Helmet configuration (security headers)
  helmet: {
    contentSecurityPolicy: false, // CSP should be set by frontend, not API
    crossOriginEmbedderPolicy: false, // Disable for development
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    permittedCrossDomainPolicies: { permittedPolicies: "none" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased limit for development
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    handler: (req, res) => {
      console.log(`🚨 Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again later.'
      });
    }
  },

  // Dashboard-specific rate limiting
  dashboardRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // Higher limit for authenticated dashboard operations
    message: {
      error: 'Too many dashboard requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    handler: (req, res) => {
      console.log(`🚨 Dashboard rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        error: 'Too many dashboard requests, please try again later.'
      });
    }
  }
};

// Apply security middleware
const applySecurityMiddleware = (app) => {
  // Trust proxy for rate limiting
  app.set('trust proxy', 2);
  
  // Apply Helmet with our configuration
  app.use(helmet(securityConfig.helmet));
  
  // Apply CORS
  app.use(corsMiddleware);
  
  // Handle preflight explicitly (helps with some proxies)
  app.options("*", corsMiddleware);
  
  // Apply rate limiting
  const limiter = rateLimit(securityConfig.rateLimit);
  const dashboardLimiter = rateLimit(securityConfig.dashboardRateLimit);
  
  // Apply rate limiting to all /api/ routes
  app.use('/api/', (req, res, next) => {
    // Skip rate limiting for health checks
    if (req.path === '/health') {
      return next();
    }
    
    // Check if this is a dashboard-related request from an authenticated user
    const isDashboardRequest = req.path.includes('/admin/') || 
                             req.path.includes('/artists/') || 
                             req.path.includes('/flash') ||
                             req.path.includes('/reviews') ||
                             req.path.includes('/services') ||
                             req.path.includes('/specialties') ||
                             req.path.includes('/messages') ||
                             req.path.includes('/favorites');
    
    const hasValidAuth = req.headers.authorization && req.headers.authorization.startsWith('Bearer ');
    
    // Use dashboard limiter for authenticated dashboard requests
    if (isDashboardRequest && hasValidAuth) {
      return dashboardLimiter(req, res, next);
    }
    
    // Use main limiter for all other requests
    limiter(req, res, next);
  });
  
  console.log('✅ Security middleware applied successfully');
};

module.exports = {
  securityConfig,
  applySecurityMiddleware,
  corsMiddleware
};
