# Deployment Fix Guide

## Current Issue
The app is returning 404 errors for all endpoints, indicating the deployment needs to be updated with the new single-domain configuration.

## Root Cause
The current deployment on Render is using an old configuration that doesn't match our updated single-domain setup.

## Solution Steps

### 1. Update Render Configuration

#### Option A: Manual Update (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your `tattooed-world-app` service
3. Go to **Settings** tab
4. Update the following:

**Build Command:**
```bash
npm install
cd backend && npm install && npx prisma generate
cd ../frontend && npm install && npm run build
cd ..
```

**Start Command:**
```bash
cd backend && npm run start:prod
```

**Environment Variables:**
- `NODE_ENV`: `production`
- `CORS_ORIGIN`: `https://tattooed-world-app.onrender.com`
- `FRONTEND_URL`: `https://tattooed-world-app.onrender.com`
- `PORT`: `10000`

#### Option B: Automatic Update via Git
1. Commit and push your changes to GitHub
2. Render will automatically redeploy with the new `render.yaml` configuration

### 2. Verify Environment Variables

Make sure these environment variables are set in Render:

**Required:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=auto-generated
PORT=10000
CORS_ORIGIN=https://tattooed-world-app.onrender.com
FRONTEND_URL=https://tattooed-world-app.onrender.com
```

**Optional:**
```bash
GOOGLE_MAPS_API_KEY=your-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
SENDGRID_API_KEY=your-key
```

### 3. Trigger Redeployment

#### Method 1: Manual Redeploy
1. Go to Render Dashboard
2. Click on your service
3. Click **Manual Deploy** → **Deploy latest commit**

#### Method 2: Push to Git
```bash
git add .
git commit -m "Fix deployment configuration for single-domain setup"
git push origin main
```

### 4. Monitor Deployment

1. Watch the deployment logs in Render Dashboard
2. Look for these success indicators:
   ```
   ✅ All required environment variables are configured
   ✅ Database connection successful
   ✅ Frontend build found at: /opt/render/project/src/backend/../../frontend/dist
   🚀 Full-stack server running on port 10000
   ```

### 5. Test After Deployment

Run the verification script:
```bash
node verify-deployment.js
```

Expected output:
```
🧪 Testing: Health Check
   ✅ PASS - Status: 200

🧪 Testing: API Info
   ✅ PASS - Status: 200

🧪 Testing: Artists API
   ✅ PASS - Status: 200

🧪 Testing: Frontend Root
   ✅ PASS - Status: 200

🧪 Testing: Login Page
   ✅ PASS - Status: 200
```

## Troubleshooting

### If Deployment Still Fails

#### 1. Check Build Logs
Look for these errors in Render logs:
- `npm install` failures
- `prisma generate` errors
- `npm run build` failures
- Missing environment variables

#### 2. Common Issues

**Frontend Build Fails:**
```bash
# Check if all dependencies are installed
cd frontend && npm install
npm run build
```

**Backend Build Fails:**
```bash
# Check if Prisma is working
cd backend && npx prisma generate
```

**Database Connection Fails:**
- Verify `DATABASE_URL` is set correctly
- Check if database is accessible from Render

#### 3. Manual Testing

Test individual components:

**Health Check:**
```bash
curl https://tattooed-world-app.onrender.com/health
```

**API Info:**
```bash
curl https://tattooed-world-app.onrender.com/api
```

**Frontend:**
```bash
curl https://tattooed-world-app.onrender.com/
```

## Expected File Structure After Deployment

```
/opt/render/project/src/
├── backend/
│   ├── src/
│   │   └── server.js
│   ├── node_modules/
│   └── package.json
├── frontend/
│   ├── dist/           # Built React app
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   ├── node_modules/
│   └── package.json
└── package.json
```

## Success Indicators

When the deployment is working correctly, you should see:

1. **Health endpoint returns 200:**
   ```json
   {
     "status": "OK",
     "message": "Tattooed World API is running",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "environment": "production"
   }
   ```

2. **API endpoint returns 200:**
   ```json
   {
     "message": "Welcome to Tattooed World API",
     "version": "1.0.0",
     "endpoints": {
       "auth": "/api/auth",
       "artists": "/api/artists",
       "flash": "/api/flash",
       "reviews": "/api/reviews",
       "specialties": "/api/specialties",
       "services": "/api/services"
     }
   }
   ```

3. **Frontend loads correctly:**
   - React app loads at root URL
   - Navigation works
   - API calls succeed

## Next Steps

After successful deployment:

1. **Test all features:**
   - User registration/login
   - Artist browsing
   - Admin functions
   - Flash gallery

2. **Set up monitoring:**
   - Enable Render alerts
   - Monitor error rates
   - Check performance

3. **Configure custom domain (optional):**
   - Add custom domain in Render
   - Update environment variables
   - Configure SSL

## Support

If you continue to have issues:

1. Check Render documentation
2. Review deployment logs carefully
3. Test locally first: `npm run dev` in both frontend and backend
4. Verify all environment variables are set correctly 