const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { execSync } = require('child_process');
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
const emergencyRoutes = require('./routes/emergency');
const favoriteRoutes = require('./routes/favorites');
const studioRoutes = require('./routes/studios');
const geocodingRoutes = require('./routes/geocoding');
const galleryRoutes = require('./routes/gallery');
const messagesRoutes = require('./routes/messages');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const { addSecurityHeaders } = require('./middleware/antiScraping');

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

// Force server restart to pick up new Prisma client with profile picture fields
console.log('🔄 Server restarting to load updated Prisma client...');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "blob:", "blob:https:", "blob:https://tattooed-world-backend.onrender.com", "blob:*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com", "https://maps.gstatic.com"],
      scriptSrcElem: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com", "https://maps.gstatic.com"],
      connectSrc: ["'self'", "https://maps.googleapis.com", "wss:", "ws:"],
    },
  },
}));

// CORS configuration - simplified since everything is on same domain
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Add security headers
app.use(addSecurityHeaders);

// Rate limiting with proper proxy handling for Render.com
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // limit each IP to 500 requests per windowMs (increased for geocoding)
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

// Debug endpoint to check file system in production
app.get('/debug-paths', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const currentDir = __dirname;
    const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
    const backendDir = path.join(__dirname, '..');
    const rootDir = path.join(__dirname, '../..');
    
    const debugInfo = {
      currentDir,
      frontendBuildPath,
      paths: {
        currentDirExists: fs.existsSync(currentDir),
        frontendBuildExists: fs.existsSync(frontendBuildPath),
        backendDirExists: fs.existsSync(backendDir),
        rootDirExists: fs.existsSync(rootDir),
      },
      listings: {}
    };
    
    // List contents of various directories
    if (fs.existsSync(rootDir)) {
      debugInfo.listings.root = fs.readdirSync(rootDir);
    }
    
    if (fs.existsSync(backendDir)) {
      debugInfo.listings.backend = fs.readdirSync(backendDir);
    }
    
    const frontendDir = path.join(__dirname, '../../frontend');
    if (fs.existsSync(frontendDir)) {
      debugInfo.listings.frontend = fs.readdirSync(frontendDir);
    }
    
    if (fs.existsSync(frontendBuildPath)) {
      debugInfo.listings.frontendBuild = fs.readdirSync(frontendBuildPath);
    }
    
    res.json(debugInfo);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get debug info',
      message: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/flash', flashRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/geocoding', geocodingRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/messages', messagesRoutes);

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
      services: '/api/services',
      studios: '/api/studios'
    }
  });
});

// Serve static files from the React app build directory
const frontendBuildPath = path.join(__dirname, '../../frontend/dist');

// Check if frontend build exists
const frontendExists = require('fs').existsSync(frontendBuildPath);
const indexHtmlPath = path.join(frontendBuildPath, 'index.html');

if (!frontendExists) {
  console.warn('⚠️ Frontend build not found at:', frontendBuildPath);
  console.warn('⚠️ This might be a development environment or build issue');
  
  // Serve a simple fallback page for non-API routes
  app.get('*', (req, res) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tattooed World - Backend Only</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
            .api-link { display: inline-block; margin: 10px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎨 Tattooed World</h1>
            <p>Backend API is running successfully!</p>
            <p>Frontend build files are not available. This might be a deployment issue.</p>
            <br>
            <a href="/health" class="api-link">Health Check</a>
            <a href="/api" class="api-link">API Info</a>
            <a href="/api/artists" class="api-link">Artists API</a>
            <br><br>
            <p><small>If you're seeing this, the frontend build process may have failed during deployment.</small></p>
          </div>
        </body>
      </html>
    `);
  });
} else {
  console.log('✅ Frontend build found at:', frontendBuildPath);
  
  // Serve static files from the React build directory
  app.use(express.static(frontendBuildPath, {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
    lastModified: true
  }));

  // Handle React routing, return all requests to React app (except API routes)
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Check if index.html exists
    if (!require('fs').existsSync(indexHtmlPath)) {
      console.error('❌ index.html not found at:', indexHtmlPath);
      return res.status(500).json({ error: 'Frontend build incomplete' });
    }
    
    // Serve React app for all non-API routes (SPA routing)
    res.sendFile(indexHtmlPath);
  });
}

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
    console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'true'}`);
    
    // Test database connection
    console.log('🔄 Testing database connection...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database');
      process.exit(1);
    }
    console.log('✅ Database connection successful');
    
    // Sanity check: verify Studio table schema
    try {
      await prisma.$queryRaw`SELECT latitude, longitude FROM "studios" LIMIT 1`;
      console.log('✅ Studio table schema verified');
    } catch (schemaError) {
      console.error('❌ Studio table schema check failed:', schemaError.message);
      if (schemaError.message.includes('column') || schemaError.message.includes('new')) {
        console.error('🚨 Schema mismatch detected - failing fast to trigger redeploy');
      }
      process.exit(1);
    }
    
    // Run production migrations if needed
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Running production migrations...');
      try {
        const { execSync } = require('child_process');
        execSync('npx prisma migrate deploy', { 
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
        console.log('✅ Production migrations completed');
      } catch (migrationError) {
        console.log('⚠️ Production migration error (might be already up to date):', migrationError.message);
      }
    }
    
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

module.exports = app; // Force rebuild - Sat Aug  9 21:04:14 CEST 2025
