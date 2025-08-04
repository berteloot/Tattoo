# 🚀 Tattooed World - Deployment Guide

## 🎯 New Simplified Architecture

We've **completely redesigned** the deployment to use a **single full-stack service** instead of separate frontend and backend services. This eliminates all the CORS, networking, and coordination issues you were experiencing.

### ✅ Benefits of the New Architecture

1. **Single Service**: Everything runs on one Render service
2. **No CORS Issues**: Frontend and API are on the same domain
3. **Simpler Deployment**: One service to manage instead of two
4. **Better Performance**: No network latency between frontend and backend
5. **Easier Debugging**: All logs in one place
6. **More Reliable**: No service coordination issues

## 📁 Project Structure

```
tattooed-world/
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── server.js  # Main server (now serves frontend too)
│   │   ├── routes/    # API routes
│   │   └── ...
│   └── package.json
├── frontend/          # React frontend
│   ├── src/
│   ├── dist/          # Built frontend files (served by backend)
│   └── package.json
├── render.yaml        # Single service configuration
└── package.json       # Root package.json
```

## 🚀 Deployment Steps

### 1. Update Your Render Dashboard

1. Go to your Render dashboard
2. **Delete** the existing `tattooed-world-frontend` service
3. **Keep** the `tattooed-world-backend` service (we'll update it)
4. **Keep** the `tattooed-world-db` database

### 2. Update the Backend Service

1. In your Render dashboard, go to the `tattooed-world-backend` service
2. Click **Settings**
3. Update the service name to `tattooed-world-app`
4. Update the **Build Command** to:
   ```bash
   npm install && cd backend && npm install && npx prisma generate && cd ../frontend && npm install && npm run build
   ```
5. Update the **Start Command** to:
   ```bash
   cd backend && npm run start:prod
   ```

### 3. Environment Variables

Make sure these environment variables are set in your Render service:

**Required:**
- `DATABASE_URL` (from your database)
- `JWT_SECRET` (auto-generated)
- `NODE_ENV=production`
- `PORT=10000`

**Optional:**
- `GOOGLE_MAPS_API_KEY` (if you have one)
- `CLOUDINARY_*` (if you want file uploads)

### 4. Deploy

1. Push your updated code to GitHub
2. Render will automatically redeploy
3. The service will now serve both the API and frontend

## 🔧 Local Development

### Quick Start
```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev

# Or start just the backend (serves frontend too)
npm run start:dev
```

### Build for Production
```bash
# Build everything
npm run build

# Start production server
npm start
```

## 🌐 How It Works

### Production (Render)
- **Single URL**: `https://tattooed-world-backend.onrender.com`
- **API**: `https://tattooed-world-backend.onrender.com/api/*`
- **Frontend**: `https://tattooed-world-backend.onrender.com/*`

### Local Development
- **Backend**: `http://localhost:3001`
- **Frontend**: `http://localhost:3001` (served by backend)
- **API**: `http://localhost:3001/api/*`

## 🔍 Troubleshooting

### Common Issues

1. **404 Errors**: Make sure the frontend build exists in `frontend/dist/`
2. **API Not Found**: Check that routes start with `/api/`
3. **Database Issues**: Verify `DATABASE_URL` is correct
4. **Build Failures**: Check that all dependencies are installed

### Debug Commands

```bash
# Check if frontend builds correctly
cd frontend && npm run build

# Test backend locally
cd backend && npm run dev

# Check database connection
cd backend && npm run db:studio
```

## 📊 Test Accounts

After deployment, these accounts will be available:

- **Admin**: `admin@tattoolocator.com` / `admin123`
- **Client**: `client@example.com` / `client123`
- **Artist**: `artist@example.com` / `artist123`
- **Pending Artist**: `pending@example.com` / `pending123`

## 🎉 What's Fixed

✅ **No more 404 errors** - Everything served from one domain  
✅ **No more CORS issues** - Same-origin requests  
✅ **No more service coordination** - Single deployment  
✅ **Better performance** - No network latency  
✅ **Simpler debugging** - All logs in one place  
✅ **More reliable** - Fewer moving parts  

## 🔄 Migration from Old Architecture

If you're migrating from the old two-service setup:

1. **Backup your data** (database will be preserved)
2. **Update the service** as described above
3. **Test thoroughly** with the new single service
4. **Delete the old frontend service** once confirmed working

The new architecture is much simpler and more reliable! 🚀 