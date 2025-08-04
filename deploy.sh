#!/bin/bash

# 🚀 Tattooed World - Deployment Script
# This script helps migrate from the old two-service architecture to the new single-service setup

echo "🎯 Tattooed World - Deployment Migration Script"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found render.yaml - proceeding with deployment setup"
echo ""

# Check if all required files exist
echo "🔍 Checking required files..."
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    exit 1
fi

echo "✅ All required files found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Build the application
echo "🔨 Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi
echo "✅ Application built successfully"
echo ""

# Test the build locally
echo "🧪 Testing build locally..."
cd backend
npm run start:prod &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test health endpoint
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "❌ Health check failed"
    kill $SERVER_PID
    exit 1
fi

# Test frontend
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Frontend served successfully"
else
    echo "❌ Frontend not accessible"
    kill $SERVER_PID
    exit 1
fi

# Stop the test server
kill $SERVER_PID
cd ..

echo ""
echo "🎉 Local testing completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. 🗑️  Delete the old frontend service in Render dashboard:"
echo "   - Go to your Render dashboard"
echo "   - Find 'tattooed-world-frontend' service"
echo "   - Click 'Delete' (this is safe - data is in the database)"
echo ""
echo "2. 🔄 Update the backend service:"
echo "   - Go to 'tattooed-world-backend' service in Render"
echo "   - Click 'Settings'"
echo "   - Rename to 'tattooed-world-app'"
echo "   - Update Build Command to:"
echo "     npm install && cd backend && npm install && npx prisma generate && cd ../frontend && npm install && npm run build"
echo "   - Update Start Command to:"
echo "     cd backend && npm run start:prod"
echo ""
echo "3. 🚀 Deploy:"
echo "   - Push your code to GitHub"
echo "   - Render will automatically redeploy"
echo "   - Your app will be available at: https://tattooed-world-backend.onrender.com"
echo ""
echo "4. ✅ Verify:"
echo "   - Test all features work correctly"
echo "   - Check that admin dashboard is accessible"
echo "   - Verify artist profiles and reviews work"
echo ""
echo "🎯 Benefits of the new architecture:"
echo "===================================="
echo "✅ No more 404 errors"
echo "✅ No more CORS issues"
echo "✅ Single service to manage"
echo "✅ Better performance"
echo "✅ Easier debugging"
echo "✅ More reliable deployment"
echo ""
echo "🚀 Ready to deploy! Follow the steps above to complete the migration." 