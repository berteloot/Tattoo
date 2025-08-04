#!/bin/bash

echo "🚀 Deploying geocoding feature to Render..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Error: Git repository not found. Please initialize git first."
    exit 1
fi

# Add all changes
echo "📝 Adding changes to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Add geocoding service for dynamic address-to-coordinate conversion

- Add geocoding API routes for single and batch address geocoding
- Implement caching to avoid repeated API calls
- Add fallback coordinates when API key is not configured
- Update ArtistMap component to geocode addresses on the fly
- Add admin endpoint to update studio coordinates
- Include comprehensive setup guide for Google Maps API keys"

# Push to main branch (assuming Render is connected to main)
echo "🚀 Pushing to main branch..."
git push origin main

echo "✅ Deployment initiated!"
echo "⏳ Render will automatically build and deploy the changes."
echo "🌐 Check deployment status at: https://dashboard.render.com"
echo ""
echo "📋 Next steps:"
echo "1. Set up Google Maps API keys (see GOOGLE_MAPS_API_SETUP.md)"
echo "2. Add environment variables in Render dashboard:"
echo "   - GOOGLE_GEOCODE_API_KEY (server key for geocoding)"
echo "   - VITE_GOOGLE_MAPS_API_KEY (browser key for maps)"
echo "3. Test the geocoding service: node test-geocoding.js"
echo "4. Update existing studios: node update-studios-with-geocoding.js"
echo "5. Check the map: https://tattooed-world-backend.onrender.com/map" 