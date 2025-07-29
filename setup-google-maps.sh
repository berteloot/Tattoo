#!/bin/bash

echo "🗺️  Google Maps API Setup for Local Development"
echo "================================================"
echo ""

echo "📋 Steps to get your Google Maps API Key:"
echo "1. Go to: https://console.cloud.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable billing (required)"
echo "4. Go to APIs & Services > Library"
echo "5. Search for 'Maps JavaScript API' and enable it"
echo "6. Go to APIs & Services > Credentials"
echo "7. Create API Key"
echo "8. Restrict the key to localhost URLs"
echo ""

echo "🔒 Recommended API Key Restrictions:"
echo "   Application restrictions: HTTP referrers"
echo "   Add these URLs:"
echo "   - http://localhost:5173/*"
echo "   - http://localhost:5174/*"
echo "   - http://localhost:5175/*"
echo "   - http://localhost:5176/*"
echo "   - http://localhost:5177/*"
echo "   API restrictions: Maps JavaScript API"
echo ""

read -p "Enter your Google Maps API key (or press Enter to skip): " GOOGLE_MAPS_API_KEY

if [ -n "$GOOGLE_MAPS_API_KEY" ]; then
    echo ""
    echo "🔧 Updating frontend environment..."
    
    # Update frontend .env file
    cat > frontend/.env << EOF
# API Configuration
VITE_API_URL="http://localhost:3001"

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY="${GOOGLE_MAPS_API_KEY}"

# Environment
VITE_NODE_ENV="development"
EOF
    
    echo "✅ Google Maps API key configured!"
    echo ""
    echo "🎯 Your app will now have full map functionality:"
    echo "   - Interactive studio location selection"
    echo "   - Click-to-set location on map"
    echo "   - Drag & drop marker positioning"
    echo "   - Address geocoding"
    echo ""
    echo "🔄 Restart your frontend server to apply changes:"
    echo "   cd frontend && npm run dev"
    echo ""
else
    echo ""
    echo "⏭️  Skipping Google Maps configuration"
    echo "   Your app will work without maps (fallback mode)"
    echo "   You can add the API key later by editing frontend/.env"
    echo ""
fi

echo "📚 Additional Resources:"
echo "- Google Maps API Documentation: https://developers.google.com/maps/documentation/javascript"
echo "- API Key Best Practices: https://developers.google.com/maps/api-security-best-practices"
echo "- Billing Setup: https://developers.google.com/maps/documentation/javascript/billing" 