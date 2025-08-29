const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
require('dotenv').config();

// Import database client
const { prisma, testConnection } = require('./utils/prisma');
const logger = require('./utils/logger');

// Import security configuration
const { applySecurityMiddleware } = require('./config/security.js');

// Import port management
const { startServerSafely } = require('./utils/portManager');

// Import routes
const authRoutes = require('./routes/auth');
const artistRoutes = require('./routes/artists');
const flashRoutes = require('./routes/flash');
const reviewRoutes = require('./routes/reviews');
const specialtyRoutes = require('./routes/specialties');
const serviceRoutes = require('./routes/services');
const artistServiceRoutes = require('./routes/artistServices');
const adminRoutes = require('./routes/admin');
const emergencyRoutes = require('./routes/emergency');
const favoriteRoutes = require('./routes/favorites');
const studioRoutes = require('./routes/studios');
const geocodingRoutes = require('./routes/geocoding-simple');
const galleryRoutes = require('./routes/gallery');
const messagesRoutes = require('./routes/messages');
const healthRoutes = require('./routes/health');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const { addSecurityHeaders } = require('./middleware/antiScraping');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Apply centralized security middleware
applySecurityMiddleware(app);

logger.info('✅ Security middleware applied successfully');

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

// Cookie parsing middleware for refresh tokens
app.use(cookieParser());

// Health check endpoint - moved to /api/health only to avoid conflicts with root path
// The root path should serve the React app, not the health check

// Test endpoint to verify frontend build accessibility
app.get('/test-frontend', (req, res) => {
  try {
    const freshBuildInfo = getFreshFrontendBuildInfo();
    
    // Test all possible paths
    const pathTests = possiblePaths.map(testPath => {
      const exists = fs.existsSync(testPath);
      const indexPath = path.join(testPath, 'index.html');
      const assetsPath = path.join(testPath, 'assets');
      const indexExists = fs.existsSync(indexPath);
      const assetsExist = fs.existsSync(assetsPath);
      
      return {
        path: testPath,
        exists,
        indexExists,
        assetsExist,
        valid: exists && indexExists && assetsExist
      };
    });
    
    if (freshBuildInfo.exists && freshBuildInfo.indexExists) {
      const htmlContent = fs.readFileSync(freshBuildInfo.indexPath, 'utf8');
      res.json({
        success: true,
        message: 'Frontend build is accessible',
        buildPath: freshBuildInfo.path,
        indexPath: freshBuildInfo.indexPath,
        fileSize: fs.statSync(freshBuildInfo.indexPath).size,
        htmlPreview: htmlContent.substring(0, 200) + '...',
        pathTests,
        currentWorkingDirectory: process.cwd(),
        dirname: __dirname,
        environment: process.env.NODE_ENV
      });
    } else {
      res.json({
        success: false,
        message: 'Frontend build not found',
        buildPath: freshBuildInfo.path,
        indexPath: freshBuildInfo.indexPath,
        exists: freshBuildInfo.exists,
        indexExists: freshBuildInfo.indexExists,
        pathTests,
        currentWorkingDirectory: process.cwd(),
        dirname: __dirname,
        environment: process.env.NODE_ENV
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to test frontend build',
      message: error.message,
      freshBuildInfo: getFreshFrontendBuildInfo(),
      currentWorkingDirectory: process.cwd(),
      dirname: __dirname,
      environment: process.env.NODE_ENV
    });
  }
});

// Favicon route to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  // Return a simple 1x1 transparent PNG as favicon
  const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
  res.send(transparentPixel);
});

// Debug endpoint to check file system in production
app.get('/debug-paths', (req, res) => {
  try {
    const currentDir = __dirname;
    const backendDir = path.join(__dirname, '..');
    const rootDir = path.join(__dirname, '../..');
    
    const debugInfo = {
      frontendDir: FRONTEND_DIR,
      indexHtml: INDEX_HTML,
      currentDir,
      backendDir,
      rootDir,
      paths: {
        currentDirExists: fs.existsSync(currentDir),
        frontendExists,
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
    
    if (frontendExists) {
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

// Additional debug endpoint for root path testing (development only)
app.get('/test-root', (req, res) => {
  // Block this endpoint in production for security
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });
  }
  
  res.json({
    message: 'Root path test endpoint working',
    timestamp: new Date().toISOString(),
    frontendDir: FRONTEND_DIR,
    indexHtml: INDEX_HTML,
    frontendExists,
    indexHtmlExists: fs.existsSync(indexHtmlPath),
    currentDir: __dirname,
    workingDir: process.cwd()
  });
});

// Test HTML content endpoint (development only)
app.get('/test-html', (req, res) => {
  // Block this endpoint in production for security
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found'
    });
  }

  try {
    if (!frontendExists || !fs.existsSync(indexHtmlPath)) {
      return res.status(404).json({
        error: 'HTML file not found',
        frontendDir: FRONTEND_DIR,
        indexHtml: INDEX_HTML,
        frontendExists,
        indexHtmlExists: fs.existsSync(indexHtmlPath)
      });
    }
    
    // Read the HTML file content
    const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Extract script and link tags to see what assets are referenced
    const scriptMatches = htmlContent.match(/src="([^"]+)"/g) || [];
    const linkMatches = htmlContent.match(/href="([^"]+)"/g) || [];
    
    res.json({
      success: true,
      frontendDir: FRONTEND_DIR,
      indexHtml: INDEX_HTML,
      htmlFileSize: htmlContent.length,
      scriptTags: scriptMatches,
      linkTags: linkMatches,
      htmlPreview: htmlContent.substring(0,500) + '...'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to read HTML file',
      message: error.message,
      frontendDir: FRONTEND_DIR,
      indexHtml: INDEX_HTML
    });
  }
});

// API routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/flash', flashRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/artist-services', artistServiceRoutes);
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

// Root endpoint - serve React app
app.get('/', (req, res) => {
  console.log('🔍 Root path accessed:', req.path);
  console.log('🔍 Frontend build exists:', frontendExists);
  console.log('🔍 Index HTML path:', indexHtmlPath);
  console.log('🔍 Current working directory:', process.cwd());
  console.log('🔍 __dirname:', __dirname);
  
  if (frontendExists && fs.existsSync(indexHtmlPath)) {
    console.log('✅ Serving React app from root path');
    console.log('✅ File size:', fs.statSync(indexHtmlPath).size, 'bytes');
    
    // Set proper headers for HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.sendFile(indexHtmlPath, (err) => {
      if (err) {
        console.error('❌ Error serving index.html:', err.message);
        res.status(500).json({ error: 'Error serving React app', details: err.message });
      }
    });
  } else {
    console.log('❌ Frontend not available - this should not happen in production');
    console.log('❌ Frontend build path:', frontendBuildPath);
    console.log('❌ Index HTML path:', indexHtmlPath);
    
    // In production, this should never happen due to fail-fast logic
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 CRITICAL: Frontend build missing in production');
      process.exit(1);
    }
    
    res.status(500).json({
      error: 'Frontend build not available',
      message: 'This should not happen in production',
      frontendDir: FRONTEND_DIR,
      indexHtml: INDEX_HTML
    });
  }
});
            


// Removed specific favicon and vite.svg handlers - let static file serving handle them
// This prevents conflicts with the React app routing

// 404 handler for API routes only - this should come after all API routes
app.use('/api/*', notFound);

// Serve static files from the standardized backend/public directory
// This is guaranteed to exist after the build process copies frontend/dist/* to backend/public
const FRONTEND_DIR = path.resolve(__dirname, "../frontend/dist");
const INDEX_HTML = path.join(FRONTEND_DIR, "index.html");

// Fail-fast in production if the build is missing
if (process.env.NODE_ENV === "production") {
  if (!fs.existsSync(FRONTEND_DIR)) {
    console.error("❌ Frontend directory not found at:", FRONTEND_DIR);
    process.exit(1);
  }
  if (!fs.existsSync(INDEX_HTML)) {
    console.error("❌ index.html not found at:", INDEX_HTML);
    process.exit(1);
  }
  console.log("✅ Frontend build found at:", FRONTEND_DIR);
  console.log("✅ index.html found at:", INDEX_HTML);
}

// Enhanced check for frontend build with better logging
const frontendExists = fs.existsSync(FRONTEND_DIR);
const frontendBuildPath = FRONTEND_DIR;
const indexHtmlPath = INDEX_HTML;

// Function to get fresh frontend build info (no caching)
function getFreshFrontendBuildInfo() {
  return {
    path: FRONTEND_DIR,
    indexPath: INDEX_HTML,
    exists: fs.existsSync(FRONTEND_DIR),
    indexExists: fs.existsSync(INDEX_HTML),
    timestamp: new Date().toISOString()
  };
}

// Log frontend build status
console.log('🔍 Frontend build status:');
console.log('  - __dirname:', __dirname);
console.log('  - frontendBuildPath:', frontendBuildPath);
console.log('  - frontendExists:', frontendExists);
console.log('  - indexHtmlPath:', indexHtmlPath);
console.log('  - indexHtmlExists:', fs.existsSync(indexHtmlPath));

if (frontendExists) {
  try {
    const buildContents = fs.readdirSync(frontendBuildPath);
    console.log('  - Contents:', buildContents);
    
    // Check for critical files
    const hasIndexHtml = fs.existsSync(indexHtmlPath);
    const hasAssetsDir = fs.existsSync(path.join(frontendBuildPath, 'assets'));
    console.log('  - Has index.html:', hasIndexHtml);
    console.log('  - Has assets directory:', hasAssetsDir);
    
    if (!hasIndexHtml || !hasAssetsDir) {
      console.warn('⚠️ Frontend build appears incomplete');
      console.warn('  - Missing index.html:', !hasIndexHtml);
      console.warn('  - Missing assets directory:', !hasAssetsDir);
    }
  } catch (error) {
    console.error('❌ Error reading frontend build directory:', error.message);
  }
}

if (!frontendExists) {
  console.error('❌ Frontend build not found at:', frontendBuildPath);
  console.error('❌ This should not happen in production - build process failed');
  process.exit(1);
} else {
  console.log('✅ Frontend build found at:', frontendBuildPath);
  
  // Serve static files (CSS, JS, images, etc.)
  app.use(express.static(FRONTEND_DIR, {
    index: "index.html",
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
    lastModified: true
  }));



  // Comprehensive asset debugging endpoint (development only)
  app.get('/debug-build', (req, res) => {
    // Block this endpoint in production for security
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }

    try {
      // Get fresh build info
      const freshBuildInfo = getFreshFrontendBuildInfo();
      
      const buildInfo = {
        freshBuildInfo,
        originalFrontendBuildPath: frontendBuildPath,
        currentDir: __dirname,
        buildExists: freshBuildInfo.exists,
        timestamp: new Date().toISOString()
      };
      
      if (buildInfo.buildExists) {
        const buildContents = fs.readdirSync(freshBuildInfo.path);
        buildInfo.buildContents = buildContents;
        
        const assetsDir = path.join(freshBuildPath, 'assets');
        buildInfo.assetsDir = assetsDir;
        buildInfo.assetsExists = fs.existsSync(assetsDir);
        
        if (buildInfo.assetsExists) {
          const assets = fs.readdirSync(assetsDir);
          buildInfo.assets = assets;
          buildInfo.totalAssets = assets.length;
          
          // Check for specific file types
          buildInfo.cssFiles = assets.filter(f => f.endsWith('.css'));
          buildInfo.jsFiles = assets.filter(f => f.endsWith('.js'));
          buildInfo.imageFiles = assets.filter(f => /\.(png|jpg|jpeg|gif|svg|ico)$/i.test(f));
          buildInfo.fontFiles = assets.filter(f => /\.(woff|woff2|ttf|eot)$/i.test(f));
          
          // Get file sizes and paths
          buildInfo.assetDetails = assets.map(asset => {
            const fullPath = path.join(assetsDir, asset);
            const stats = fs.statSync(fullPath);
            return {
              name: asset,
              size: stats.size,
              sizeKB: (stats.size / 1024).toFixed(2),
              path: fullPath,
              relativePath: `/assets/${asset}`,
              exists: true
            };
          });
        }
        
        // Check index.html
        const indexHtmlPath = path.join(frontendBuildPath, 'index.html');
        if (buildInfo.buildExists) {
          const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
          buildInfo.indexHtml = {
            exists: true,
            size: indexHtml.length,
            cssReferences: indexHtml.match(/href="[^"]*\.css[^"]*"/g) || [],
            jsReferences: indexHtml.match(/src="[^"]*\.js[^"]*"/g) || []
          };
        } else {
          buildInfo.indexHtml = { exists: false };
        }
      }
      
      res.json(buildInfo);
    } catch (error) {
      res.json({
        success: false,
        error: error.message,
        stack: error.stack,
        frontendBuildPath,
        currentDir: __dirname
      });
    }
  });

  // Test CSS serving endpoint (development only)
  app.get('/test-css', (req, res) => {
    // Block this endpoint in production for security
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({
        success: false,
        error: 'Endpoint not found'
      });
    }

    res.setHeader('Content-Type', 'text/css; charset=utf-8');
    res.send(`
      /* Test CSS */
      body { 
        background-color: #f0f0f0; 
        font-family: Arial, sans-serif; 
      }
      .test { 
        color: #333; 
        padding: 20px; 
      }
    `);
  });

  // Explicit asset route handling to ensure proper MIME types
  app.get('/assets/*', (req, res, next) => {
    // Extract the asset filename from the path
    const assetPath = req.path.replace('/assets/', '');
    const fullPath = path.join(frontendBuildPath, 'assets', assetPath);
    
    console.log(`🔍 Asset request: ${req.path} -> ${fullPath}`);
    
    // Check if asset exists
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ Asset not found: ${req.path} -> ${fullPath}`);
      return res.status(404).json({ error: 'Asset not found', path: req.path });
    }
    
    // Determine MIME type based on file extension
    const ext = path.extname(assetPath).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.js':
        contentType = 'application/javascript; charset=utf-8';
        break;
      case '.css':
        contentType = 'text/css; charset=utf-8';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
      case '.ico':
        contentType = 'image/x-icon';
        break;
      case '.woff':
        contentType = 'font/woff';
        break;
      case '.woff2':
        contentType = 'font/woff2';
        break;
      case '.ttf':
        contentType = 'font/ttf';
        break;
      case '.eot':
        contentType = 'application/vnd.ms-fontobject';
        break;
    }
    
    console.log(`✅ Serving asset: ${req.path} -> ${fullPath} (${contentType})`);
    
    // Set proper headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    
    // Use sendFile instead of streaming to avoid potential issues
    res.sendFile(fullPath, (err) => {
      if (err) {
        console.error(`❌ Error serving asset ${req.path}:`, err.message);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error serving asset', path: req.path });
        }
      }
    });
  });

  // Error handling middleware - MUST come before React catch-all to avoid masking 404s
  app.use(errorHandler);

  // Asset error handling middleware
  app.use('/assets/*', (err, req, res, next) => {
    console.error(`❌ Asset error for ${req.path}:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Asset serving error', 
        path: req.path,
        message: err.message 
      });
    }
  });

  // SPA fallback (only if not /api)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(INDEX_HTML);
  });
}

// Test database connection and start server
async function startServer() {
  try {
    console.log('🔄 Starting server initialization...');
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`📁 Frontend build path: ${frontendBuildPath}`);
    
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
    
    // Check frontend build status in production
    if (process.env.NODE_ENV === 'production') {
      console.log('🔍 Checking frontend build status...');
      try {
        if (fs.existsSync(frontendBuildPath)) {
          const buildContents = fs.readdirSync(frontendBuildPath);
          console.log('  📁 Build contents:', buildContents);
          
          const assetsPath = path.join(frontendBuildPath, 'assets');
          if (fs.existsSync(assetsPath)) {
            const assets = fs.readdirSync(assetsPath);
            const cssFiles = assets.filter(f => f.endsWith('.css'));
            const jsFiles = assets.filter(f => f.endsWith('.js'));
            
            console.log(`  🎨 CSS files: ${cssFiles.length}`);
            console.log(`  ⚡ JS files: ${jsFiles.length}`);
            
            if (cssFiles.length === 0) {
              console.warn('⚠️  No CSS files found in build!');
            }
            if (jsFiles.length === 0) {
              console.warn('⚠️  No JS files found in build!');
            }
          } else {
            console.warn('⚠️  Assets directory not found in build!');
          }
        } else {
          console.warn('⚠️  Frontend build directory not found!');
        }
      } catch (error) {
        console.error('❌ Error checking frontend build:', error.message);
      }
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
    
    // Start server safely with port management
    const { server, port } = await startServerSafely(app, PORT);
    
    console.log(`🚀 Full-stack server running on port ${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${port}/api/health`);
    console.log(`🌐 API base: http://localhost:${port}/api`);
    console.log(`🎨 Frontend: http://localhost:${port}`);
    console.log(`🛡️ Security: Helmet, CORS, Rate Limiting enabled`);
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🔄 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('🔄 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
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

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err, promise) => {
  console.error('🚨 Unhandled Promise Rejection:', {
    error: err.message,
    stack: err.stack,
    promise: promise,
    timestamp: new Date().toISOString()
  });
  
  // Log additional context for debugging
  if (err.code) {
    console.error('Error code:', err.code);
  }
  if (err.syscall) {
    console.error('System call:', err.syscall);
  }
  
  // Don't crash the process for transient errors
  // Let the process manager handle truly fatal issues
  console.error('⚠️ Process will continue running. Monitor logs for issues.');
  
  // Optional: Send metrics/alerting here
  // Example: sendToMonitoringService('unhandledRejection', err);
});

module.exports = app; // Force rebuild - Sat Aug  9 21:04:14 CEST 2025

// FORCE DEPLOYMENT - CSP blob URL fix v4.2
// Updated helmet configuration to properly handle blob URLs
// Fixed: imgSrc now uses correct blob: syntax without invalid URLs
// Status: Ready for production deployment
