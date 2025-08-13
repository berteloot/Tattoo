# Single Domain Deployment Guide

## Overview
The Tattooed World app is now configured as a **single full-stack application** deployed on Render.com. Both the frontend (React) and backend (Node.js/Express) are served from the same URL: `https://tattooed-world-backend.onrender.com`

## Architecture

### Before (Separate Services)
- Frontend: `https://tattoo-app-frontend.onrender.com`
- Backend: `https://tattoo-app-backend.onrender.com`
- CORS issues, complex routing, separate deployments

### After (Single Service)
- **Single URL**: `https://tattooed-world-backend.onrender.com`
- Frontend and backend served from same domain
- No CORS issues, simpler deployment, better performance

## How It Works

### 1. Build Process
```bash
# Render build command
npm install
cd backend && npm install && npx prisma generate
cd ../frontend && npm install && npm run build
cd ..
```

### 2. Server Configuration
The backend server (`backend/src/server.js`) serves both:
- **API routes**: `/api/*` → Express API endpoints
- **Static files**: `/` → React build files from `frontend/dist/`
- **SPA routing**: All non-API routes → `index.html`

### 3. Frontend Configuration
- **API calls**: Use relative URLs (`/api/artists`, `/api/auth/login`)
- **No CORS issues**: Same domain, no cross-origin requests
- **Better performance**: No additional network hops

## URL Structure

```
https://tattooed-world-backend.onrender.com/
├── /                    → React app (Home page)
├── /login              → React app (Login page)
├── /artists            → React app (Artists page)
├── /admin              → React app (Admin dashboard)
├── /api                → API info endpoint
├── /api/auth/*         → Authentication endpoints
├── /api/artists/*      → Artist management endpoints
├── /api/flash/*        → Flash gallery endpoints
├── /api/reviews/*      → Review endpoints
├── /api/admin/*        → Admin endpoints
└── /health             → Health check endpoint
```

## Benefits

### ✅ Advantages
1. **Simplified deployment**: One service instead of two
2. **No CORS issues**: Everything on same domain
3. **Better performance**: No cross-origin requests
4. **Easier SSL**: Single certificate
5. **Simplified routing**: No proxy configuration needed
6. **Cost effective**: One service instead of two

### ⚠️ Considerations
1. **Single point of failure**: If backend fails, frontend is also down
2. **Larger build size**: Includes both frontend and backend
3. **Longer cold starts**: More code to load

## Environment Variables

### Required for Production
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=10000
CORS_ORIGIN=https://tattooed-world-backend.onrender.com
FRONTEND_URL=https://tattooed-world-backend.onrender.com
```

### Optional
```bash
GOOGLE_MAPS_API_KEY=your-maps-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
SENDGRID_API_KEY=your-email-key
```

## Testing the Deployment

### 1. Health Check
```bash
curl https://tattooed-world-backend.onrender.com/health
```

### 2. API Test
```bash
curl https://tattooed-world-backend.onrender.com/api
```

### 3. Frontend Test
```bash
curl https://tattooed-world-backend.onrender.com/
```

### 4. Automated Testing
```bash
node verify-deployment.js
```

## Troubleshooting

### Common Issues

#### 1. 404 Errors
- **Cause**: Frontend build not found
- **Solution**: Check build process in Render logs

#### 2. API Not Found
- **Cause**: Route not properly configured
- **Solution**: Verify API routes in `backend/src/server.js`

#### 3. CORS Errors
- **Cause**: Shouldn't happen with single domain
- **Solution**: Check CORS configuration

#### 4. Database Connection
- **Cause**: DATABASE_URL not set
- **Solution**: Verify environment variables in Render

### Debug Steps
1. Check Render deployment logs
2. Test health endpoint: `/health`
3. Test API endpoint: `/api`
4. Check database connection
5. Verify frontend build exists

## Migration from Separate Services

If you were previously using separate frontend/backend services:

1. **Update bookmarks**: Use single URL
2. **Update API calls**: Already using relative URLs
3. **Update environment**: Set CORS_ORIGIN to single URL
4. **Test thoroughly**: Verify all functionality works

## Performance Optimization

### 1. Static File Caching
```javascript
app.use(express.static(frontendBuildPath, {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));
```

### 2. API Rate Limiting
```javascript
app.use('/api/', limiter);
```

### 3. Security Headers
```javascript
app.use(helmet({
  contentSecurityPolicy: { /* ... */ }
}));
```

## Monitoring

### Health Check
- Endpoint: `/health`
- Returns: Status, timestamp, environment

### API Status
- Endpoint: `/api`
- Returns: Available endpoints, version

### Logs
- Check Render dashboard for application logs
- Monitor error rates and response times

## Conclusion

The single-domain deployment provides a simpler, more reliable, and more performant solution for the Tattooed World app. All functionality remains the same, but with improved deployment architecture. 