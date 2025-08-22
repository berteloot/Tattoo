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
const { applySecurityMiddleware } = require('./config/security');

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

// Favicon handler to prevent 500 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content response for favicon
});

// Vite.svg handler to prevent 500 errors (legacy asset reference)
app.get('/vite.svg', (req, res) => {
  res.status(204).end(); // No content response for vite.svg
});

// 404 handler for API routes only - this should come after all API routes
app.use('/api/*', notFound);

// Serve static files from the React app build directory
const frontendBuildPath = path.join(__dirname, '../../frontend/dist');

// Enhanced check for frontend build with better logging
const frontendExists = fs.existsSync(frontendBuildPath);
const indexHtmlPath = path.join(frontendBuildPath, 'index.html');

// Log detailed information about the frontend build
console.log('🔍 Frontend build check:');
console.log('  - Path:', frontendBuildPath);
console.log('  - Exists:', frontendExists);
console.log('  - Current directory:', __dirname);

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
  console.warn('⚠️ Frontend build not found at:', frontendBuildPath);
  console.warn('⚠️ This might be a development environment or build issue');
  
  // Serve a simple fallback page for non-API routes, but NOT for asset requests
  app.get('*', (req, res) => {
    // Don't serve HTML for asset requests - return 404 instead
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      return res.status(404).json({ 
        error: 'Asset not found', 
        message: 'Frontend build is not available',
        path: req.path 
      });
    }
    
    // Only serve HTML for actual page requests
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
  
  // Enhanced static file serving with proper MIME types and priority
  // This MUST come before the catch-all route to ensure assets are served correctly
  app.use(express.static(frontendBuildPath, {
    maxAge: '1y', // Cache static assets for 1 year
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Ensure proper MIME types for critical assets
      const ext = path.extname(filePath).toLowerCase();
      switch (ext) {
        case '.js':
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          break;
        case '.css':
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
          break;
        case '.html':
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          break;
        case '.json':
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          break;
        case '.png':
          res.setHeader('Content-Type', 'image/png');
          break;
        case '.jpg':
        case '.jpeg':
          res.setHeader('Content-Type', 'image/jpeg');
          break;
        case '.svg':
          res.setHeader('Content-Type', 'image/svg+xml');
          break;
        case '.ico':
          res.setHeader('Content-Type', 'image/x-icon');
          break;
        case '.woff':
          res.setHeader('Content-Type', 'font/woff');
          break;
        case '.woff2':
          res.setHeader('Content-Type', 'font/woff2');
          break;
        case '.ttf':
          res.setHeader('Content-Type', 'font/ttf');
          break;
        case '.eot':
          res.setHeader('Content-Type', 'application/vnd.ms-fontobject');
          break;
      }
    }
  }));

  // Debug endpoint to check asset availability
  app.get('/debug-assets', (req, res) => {
    const assetsDir = path.join(frontendBuildPath, 'assets');
    try {
      if (fs.existsSync(assetsDir)) {
        const assets = fs.readdirSync(assetsDir);
        const assetDetails = assets.map(asset => {
          const fullPath = path.join(assetsDir, asset);
          const stats = fs.statSync(fullPath);
          return {
            name: asset,
            size: stats.size,
            path: fullPath,
            exists: true
          };
        });
        
        res.json({
          success: true,
          assetsDir,
          assets: assetDetails,
          totalAssets: assets.length
        });
      } else {
        res.json({
          success: false,
          error: 'Assets directory not found',
          assetsDir,
          frontendBuildPath,
          currentDir: __dirname
        });
      }
    } catch (error) {
      res.json({
        success: false,
        error: error.message,
        assetsDir,
        frontendBuildPath,
        currentDir: __dirname
      });
    }
  });

  // Comprehensive asset debugging endpoint
  app.get('/debug-build', (req, res) => {
    try {
      const buildInfo = {
        frontendBuildPath,
        currentDir: __dirname,
        buildExists: fs.existsSync(frontendBuildPath),
        timestamp: new Date().toISOString()
      };
      
      if (buildInfo.buildExists) {
        const buildContents = fs.readdirSync(frontendBuildPath);
        buildInfo.buildContents = buildContents;
        
        const assetsDir = path.join(frontendBuildPath, 'assets');
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
        if (fs.existsSync(indexHtmlPath)) {
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

  // Test CSS serving endpoint
  app.get('/test-css', (req, res) => {
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

  // React catch-all route - MUST be last to handle SPA routing without masking API 404s
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Check if index.html exists
    if (!fs.existsSync(indexHtmlPath)) {
      console.error('❌ index.html not found at:', indexHtmlPath);
      return res.status(500).json({ error: 'Frontend build incomplete' });
    }
    
    // Serve React app for all non-API routes (SPA routing)
    res.sendFile(indexHtmlPath);
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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

module.exports = app; // Force rebuild - Sat Aug  9 21:04:14 CEST 2025

// FORCE DEPLOYMENT - CSP blob URL fix v4.2
// Updated helmet configuration to properly handle blob URLs
// Fixed: imgSrc now uses correct blob: syntax without invalid URLs
// Status: Ready for production deployment
