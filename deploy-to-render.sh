#!/bin/bash

echo "🚀 Deploying Tattoo Artist Locator with Geocoding to Render..."

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
if [ ! -f "render.yaml" ]; then
    print_error "render.yaml not found. Please run this script from the project root."
    exit 1
fi

print_status "Starting deployment to Render..."

# 1. Commit changes to git
print_status "Committing changes to git..."
git add .
git commit -m "Add frontend geocoding system with admin interface" || {
    print_warning "No changes to commit or git not configured"
}

# 2. Push to git (assuming you have a remote configured)
print_status "Pushing to git repository..."
git push origin main || {
    print_warning "Could not push to git. Make sure you have a remote configured."
}

# 3. Deploy to Render
print_status "Deploying to Render..."
print_status "This will trigger an automatic deployment on Render.com"

# 4. Wait for deployment and then run the database setup
print_status "Waiting for deployment to complete..."
print_status "You can monitor the deployment at: https://dashboard.render.com/web/tattooed-world-app"

print_success "Deployment initiated!"
echo ""
print_status "Next steps:"
echo "1. Wait for Render deployment to complete (usually 2-3 minutes)"
echo "2. Once deployed, run the database setup script:"
echo "   cd backend && node deploy-geocoding-to-render.js"
echo "3. Access your admin panel:"
echo "   https://tattooed-world-backend.onrender.com/admin"
echo "4. Log in as admin and use the Studio Geocoding feature"
echo ""
print_status "Your geocoding system will be live at:"
echo "https://tattooed-world-backend.onrender.com/admin/geocoding"

# Optional: Check if user wants to run the database setup now
echo ""
read -p "Do you want to run the database setup script now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Running database setup..."
    cd backend
    node deploy-geocoding-to-render.js
else
    print_status "Remember to run the database setup script after deployment completes."
fi 