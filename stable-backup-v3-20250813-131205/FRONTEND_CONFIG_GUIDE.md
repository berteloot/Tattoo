# Frontend Configuration Guide

## Environment Variables Setup

Since .env files are gitignored, you need to create them manually:

### Development Environment

Create `/frontend/.env`:
```bash
# Frontend Environment Variables for Development

# API Configuration for Development
VITE_API_URL=http://localhost:3001/api

# Google Maps API Key (Optional - app has fallback)
# VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Environment
VITE_NODE_ENV=development
```

### Production Environment

Create `/frontend/.env.production`:
```bash
# Production Environment Variables

# API Configuration for Production
# Leave empty to use Vercel rewrites to backend
VITE_API_URL=

# Google Maps API Key (Optional - app has fallback)
# VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Environment
VITE_NODE_ENV=production
```

## Configuration Changes Made

### 1. Fixed Vite Configuration
- Added proper environment handling
- Improved proxy configuration
- Added optimization settings
- Added network access for development

### 2. Fixed Vercel Configuration
- API routes now properly proxy to your backend at `tattooed-world-backend.onrender.com`
- SPA routing still works for non-API routes
- Added proper CORS headers

### 3. Improved API Service
- Better environment detection
- Proper fallbacks for different environments
- Maintains compatibility with existing code

## How It Works

### Development Mode
1. Vite dev server runs on port 5173
2. API calls to `/api` are proxied to `http://localhost:3001/api`
3. Backend runs on port 3001

### Production Mode (Vercel)
1. Frontend is served as static files
2. API calls to `/api/*` are rewritten to `https://tattooed-world-backend.onrender.com/api/*`
3. All other routes serve `index.html` for SPA routing

## Next Steps

1. Create the `.env` files as shown above
2. Test the development environment
3. Update any hardcoded API URLs in your code
4. Test the production deployment

## Port Configuration

The configuration now handles port conflicts better:
- Frontend will try ports 5173, 5174, 5175, etc.
- Backend should run on port 3001
- If port 3001 is in use, you'll need to update the VITE_API_URL accordingly

## Benefits

✅ **Proper separation** between dev and production configs
✅ **No CORS issues** in production
✅ **Fallback support** for missing API keys
✅ **Better error handling** and environment detection
✅ **Optimized builds** with proper chunking
✅ **Network access** enabled for development testing
