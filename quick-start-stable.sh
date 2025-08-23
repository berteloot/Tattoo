#!/bin/bash

# ========================================
# TATTOO ARTIST LOCATOR - STABLE VERSION 1.0.0
# Quick Start Script
# ========================================

set -e  # Exit on any error

echo "🚀 Starting Tattoo Artist Locator - Stable Version 1.0.0"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the root directory of the tattoo-app project"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18 or higher is required. Current version: $(node --version)"
    exit 1
fi
print_success "Node.js version: $(node --version)"

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    print_warning "Backend .env file not found. Creating from template..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        print_status "Please edit backend/.env with your database credentials"
        print_status "Required: DATABASE_URL, JWT_SECRET"
        echo ""
        echo "Press Enter when you've configured backend/.env..."
        read
    else
        print_error "backend/.env.example not found. Please create backend/.env manually"
        exit 1
    fi
fi

if [ ! -f "frontend/.env" ]; then
    print_warning "Frontend .env file not found. Creating from template..."
    if [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example frontend/.env
        print_status "Please edit frontend/.env with your API URL"
        print_status "Required: VITE_API_URL"
        echo ""
        echo "Press Enter when you've configured frontend/.env..."
        read
    else
        print_error "frontend/.env.example not found. Please create frontend/.env manually"
        exit 1
    fi
fi

# Install dependencies
print_status "Installing dependencies..."
npm run install:all

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Generate Prisma client
print_status "Generating Prisma client..."
cd backend
npx prisma generate
cd ..

if [ $? -eq 0 ]; then
    print_success "Prisma client generated successfully"
else
    print_error "Failed to generate Prisma client"
    exit 1
fi

# Check database connection
print_status "Testing database connection..."
cd backend
if npx prisma db push --accept-data-loss; then
    print_success "Database connection successful"
else
    print_error "Database connection failed. Please check your DATABASE_URL in backend/.env"
    print_status "Make sure PostgreSQL is running and accessible"
    exit 1
fi
cd ..

# Build frontend
print_status "Building frontend..."
cd frontend
npm run build
cd ..

if [ $? -eq 0 ]; then
    print_success "Frontend built successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

# Verify build output
if [ -d "frontend/dist" ] && [ -f "frontend/dist/index.html" ]; then
    print_success "Frontend build verified"
else
    print_error "Frontend build verification failed"
    exit 1
fi

# Start the application
echo ""
echo "🎉 Setup completed successfully!"
echo "=================================================="
echo ""
echo "Your Tattoo Artist Locator app is ready to run!"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start development mode (frontend + backend)"
echo "  npm run start:dev    - Start backend only in development mode"
echo "  npm run start        - Start production mode"
echo "  npm test             - Run tests"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:3001"
echo "  Health Check: http://localhost:3001/api/health"
echo ""
echo "Would you like to start the application now? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    print_status "Starting the application..."
    npm run dev
else
    print_status "Setup complete! Run 'npm run dev' when you're ready to start"
fi

echo ""
echo "📚 For more information, see:"
echo "  - STABLE_VERSION_SUMMARY.md"
echo "  - DEPLOYMENT_CHECKLIST.md"
echo "  - docs/ENVIRONMENT_SETUP.md"
echo "  - README.md"
echo ""
print_success "Happy coding! 🚀"
