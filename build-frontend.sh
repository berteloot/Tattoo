#!/bin/bash

# Frontend Build Script with Debugging
echo "🔨 Starting frontend build process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from frontend directory."
    exit 1
fi

# Check Node.js version
echo "📊 Node.js version: $(node --version)"
echo "📊 NPM version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

# Check if Vite is available
echo "🔍 Checking Vite installation..."
if ! npx vite --version > /dev/null 2>&1; then
    echo "❌ Error: Vite not found"
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build the application
echo "🔨 Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

# Check if build was successful
echo "🔍 Checking build output..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ Error: dist/index.html not found"
    echo "📁 Contents of dist folder:"
    ls -la dist/ || echo "dist folder doesn't exist"
    exit 1
fi

echo "✅ Frontend build completed successfully!"
echo "📁 Build output:"
ls -la dist/
echo "📄 index.html size: $(wc -c < dist/index.html) bytes" 