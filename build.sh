#!/bin/bash

# Comprehensive build script for Render deployment
set -e  # Exit on any error

echo "🚀 Starting comprehensive build process..."

# Check current directory
echo "📁 Current directory: $(pwd)"
echo "📁 Directory contents:"
ls -la

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Build backend
echo "🔨 Building backend..."
cd backend
npm install
npx prisma generate
cd ..

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm install
echo "📊 Frontend dependencies installed"
echo "🔍 Checking if vite is available..."
npx vite --version
echo "🔨 Running frontend build..."
npm run build
echo "✅ Frontend build completed"
echo "📁 Frontend build output:"
ls -la dist/
cd ..

echo "🎉 Build completed successfully!" 