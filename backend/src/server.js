const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import database client
const { prisma, testConnection } = require('./utils/prisma');

// Import routes
const authRoutes = require('./routes/auth');
const artistRoutes = require('./routes/artists');
const flashRoutes = require('./routes/flash');
const reviewRoutes = require('./routes/reviews');
const specialtyRoutes = require('./routes/specialties');
const serviceRoutes = require('./routes/services');
const adminRoutes = require('./routes/admin');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting behind load balancers (Render, Heroku, etc.)
// This is crucial for proper IP detection behind proxies
app.set('trust proxy', true);

// Check required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  console.error('Please check your .env file or environment configuration.');
  process.exit(1);
}

console.log('✅ All required environment variables are configured');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", "https://maps.googleapis.com", "wss:", "ws:"],
    },
  },
}));

// CORS configuration - simplified since everything is on same domain
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}));

// Rate limiting with proper proxy handling for Render.com
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  // Handle proxy headers properly for Render.com
  standardHeaders: true,
  legacyHeaders: false,
  // Trust proxy and use X-Forwarded-For header
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  // Key generator that works with proxy
  keyGenerator: (req) => {
    try {
      // Use X-Forwarded-For if available, otherwise use remote address
      const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress;
      // Clean the IP address (remove any whitespace or invalid characters)
      const cleanIP = clientIP?.trim() || 'unknown';
      console.log(`Rate limit key generated for IP: ${cleanIP}`);
      return cleanIP;
    } catch (error) {
      console.error('Error generating rate limit key:', error);
      return 'unknown';
    }
  },
  // Add handler for rate limit errors
  handler: (req, res) => {
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.connection.remoteAddress;
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP, please try again later.'
    });
  }
});
app.use('/api/', limiter);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Enhanced logging for production
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400, // Only log errors in production
    stream: {
      write: (message) => {
        console.log(message.trim());
      }
    }
  }));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Tattooed World API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/flash', flashRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Tattooed World API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      artists: '/api/artists',
      flash: '/api/flash',
      reviews: '/api/reviews',
      specialties: '/api/specialties',
      services: '/api/services'
    }
  });
});

// Serve static files from the React app build directory
const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendBuildPath));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  // Don't serve React app for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve React app for all other routes (SPA routing)
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Test database connection and start server
async function startServer() {
  try {
    console.log('🔄 Starting server initialization...');
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Trust Proxy: ${app.get('trust proxy')}`);
    console.log(`📁 Frontend build path: ${frontendBuildPath}`);
    
    // Test database connection
    console.log('🔄 Testing database connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }
    console.log('✅ Database connection successful');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Full-stack server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 API base: http://localhost:${PORT}/api`);
      console.log(`🎨 Frontend: http://localhost:${PORT}`);
      console.log(`🛡️ Rate limiting: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${process.env.RATE_LIMIT_WINDOW_MS || 900000}ms`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if this file is run directly (not imported for testing)
if (require.main === module) {
  startServer();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

module.exports = app; 