#!/bin/bash

echo "🗺️  Google Maps Address Autocomplete Setup"
echo "=========================================="
echo ""

echo "📋 This script will help you set up Google Maps API for address autocomplete."
echo ""

echo "🔑 Step 1: Get Google Maps API Key"
echo "1. Go to: https://console.cloud.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable billing (required for API usage)"
echo "4. Go to APIs & Services > Library"
echo "5. Search for and enable these APIs:"
echo "   - Maps JavaScript API"
echo "   - Places API (NEW - required for autocomplete)"
echo "6. Go to APIs & Services > Credentials"
echo "7. Create API Key"
echo ""

echo "🔒 Step 2: Configure API Key Restrictions"
echo "Application restrictions: HTTP referrers"
echo "Add these URLs:"
echo "   - http://localhost:5173/*"
echo "   - http://localhost:5174/*"
echo "   - http://localhost:5175/*"
echo "   - http://localhost:5176/*"
echo "   - http://localhost:5177/*"
echo "   - https://tattooed-world-app.onrender.com/*"
echo ""
echo "API restrictions:"
echo "   - Maps JavaScript API"
echo "   - Places API"
echo ""

read -p "Enter your Google Maps API key (or press Enter to skip): " GOOGLE_MAPS_API_KEY

if [ -n "$GOOGLE_MAPS_API_KEY" ]; then
    echo ""
    echo "🔧 Updating frontend environment..."
    
    # Check if frontend/.env exists, if not create it
    if [ ! -f "frontend/.env" ]; then
        echo "Creating frontend/.env file..."
        cat > frontend/.env << EOF
# API Configuration
VITE_API_URL="http://localhost:3001"

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY}"

# Environment
VITE_NODE_ENV="development"
EOF
    else
        echo "Updating existing frontend/.env file..."
        # Update or add the Google Maps API key
        if grep -q "VITE_GOOGLE_MAPS_API_KEY" frontend/.env; then
            # Replace existing key
            sed -i '' "s/VITE_GOOGLE_MAPS_API_KEY=.*/VITE_GOOGLE_MAPS_API_KEY=\"${GOOGLE_MAPS_API_KEY}\"/" frontend/.env
        else
            # Add new key
            echo "VITE_GOOGLE_MAPS_API_KEY=\"${GOOGLE_MAPS_API_KEY}\"" >> frontend/.env
        fi
    fi
    
    echo "✅ Google Maps API key configured!"
    echo ""
    echo "🎯 Address Autocomplete Features Now Available:"
    echo "   - Real-time address suggestions"
    echo "   - Automatic field population (city, state, zip, country)"
    echo "   - Coordinate extraction (latitude/longitude)"
    echo "   - Click-to-select from suggestions"
    echo "   - Keyboard navigation support"
    echo ""
    echo "🔄 Restart your frontend server to apply changes:"
    echo "   cd frontend && npm run dev"
    echo ""
    echo "🧪 Test the implementation:"
    echo "   node test-address-autocomplete.js"
    echo ""
else
    echo ""
    echo "⏭️  Skipping Google Maps configuration"
    echo "   Address autocomplete will work in fallback mode"
    echo "   (regular input field without suggestions)"
    echo "   You can add the API key later by editing frontend/.env"
    echo ""
fi

echo "📚 Additional Resources:"
echo "   - Google Maps Platform: https://developers.google.com/maps"
echo "   - Places API Documentation: https://developers.google.com/maps/documentation/places/web-service"
echo "   - API Key Best Practices: https://developers.google.com/maps/api-security-best-practices"
echo ""
echo "💰 Cost Information:"
echo "   - Places API: 1000 requests/day (free tier)"
echo "   - Maps JavaScript API: 28,500 requests/day (free tier)"
echo "   - Monitor usage in Google Cloud Console"
echo ""
echo "�� Setup Complete!" 