#!/bin/bash

# PostgreSQL HTTP Foreign Data Wrapper Geocoding Setup Script
# This script sets up the radically different geocoding approach

set -e

echo "🚀 Setting up PostgreSQL HTTP Foreign Data Wrapper Geocoding System..."
echo ""

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
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "backend" ]; then
    print_error "Backend directory not found"
    exit 1
fi

print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "Node.js and npm are available"

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    print_warning ".env file not found in backend directory"
    print_status "Please create backend/.env with your database configuration"
    echo ""
    echo "Example .env content:"
    echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/tattoo_app\""
    echo "JWT_SECRET=\"your-jwt-secret\""
    echo "GOOGLE_MAPS_API_KEY=\"your-google-maps-api-key\""
    echo ""
    read -p "Press Enter to continue if you have created the .env file..."
fi

# Navigate to backend directory
cd backend

print_status "Installing backend dependencies..."
npm install

print_status "Setting up PostgreSQL geocoding system..."

# Check if the setup script exists
if [ ! -f "scripts/setup-postgres-geocoding.js" ]; then
    print_error "Setup script not found. Please ensure all files are in place."
    exit 1
fi

# Run the setup
print_status "Running PostgreSQL setup..."
node scripts/setup-postgres-geocoding.js setup

if [ $? -eq 0 ]; then
    print_success "PostgreSQL setup completed"
else
    print_error "PostgreSQL setup failed"
    exit 1
fi

# Check if Google Maps API key is set
if [ -z "$GOOGLE_MAPS_API_KEY" ]; then
    print_warning "GOOGLE_MAPS_API_KEY environment variable not set"
    print_status "You can set it now or later using:"
    echo "export GOOGLE_MAPS_API_KEY=\"your-api-key-here\""
    echo ""
    read -p "Enter your Google Maps API key (or press Enter to skip): " API_KEY
    
    if [ ! -z "$API_KEY" ]; then
        export GOOGLE_MAPS_API_KEY="$API_KEY"
        print_success "API key set for this session"
    fi
fi

# Test the system
print_status "Testing the geocoding system..."
node scripts/setup-postgres-geocoding.js test

if [ $? -eq 0 ]; then
    print_success "System test completed"
else
    print_warning "System test had issues. Check the output above."
fi

# Check geocoding status
print_status "Checking current geocoding status..."
node scripts/setup-postgres-geocoding.js status

# Navigate back to root
cd ..

print_status "Setting up frontend dependencies..."
cd frontend
npm install
cd ..

print_success "Setup completed!"
echo ""
echo "🎉 PostgreSQL HTTP Foreign Data Wrapper Geocoding System is ready!"
echo ""
echo "📋 What was set up:"
echo "   ✅ PostgreSQL extensions (PostGIS, http_fdw)"
echo "   ✅ Geocoding functions and views"
echo "   ✅ API endpoints for geocoding"
echo "   ✅ Frontend component (StudioMapPostgres)"
echo "   ✅ Test scripts and utilities"
echo ""
echo "🚀 Next steps:"
echo "   1. Set your Google Maps API key if not done already:"
echo "      export GOOGLE_MAPS_API_KEY=\"your-api-key-here\""
echo ""
echo "   2. Run batch geocoding for all studios:"
echo "      cd backend && node scripts/setup-postgres-geocoding.js batch"
echo ""
echo "   3. Test the system:"
echo "      node test-postgres-geocoding.js"
echo ""
echo "   4. Use the new StudioMapPostgres component in your React app"
echo ""
echo "📚 Documentation:"
echo "   - See POSTGRES_HTTP_GEOCODING_GUIDE.md for detailed instructions"
echo "   - API endpoints: /api/geocoding/*"
echo "   - Frontend component: frontend/src/components/StudioMapPostgres.jsx"
echo ""
echo "🔧 Troubleshooting:"
echo "   - Check PostgreSQL logs for extension installation issues"
echo "   - Verify Google Maps API key is valid and has Geocoding API enabled"
echo "   - Ensure database connection is working"
echo "   - Run test script to diagnose issues: node test-postgres-geocoding.js"
echo ""
print_success "Setup script completed successfully!" 