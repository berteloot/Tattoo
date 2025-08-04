#!/bin/bash

echo "🚀 Deploying map fix to Render..."

# Set the production database URL (you'll need to get this from Render dashboard)
# export DATABASE_URL="postgresql://username:password@host:port/database"

# Run the fix script
echo "🔧 Running map fix script..."
node fix-production-map.js

echo "✅ Map fix deployment completed!"
echo "🌐 Check https://tattooed-world-backend.onrender.com/map to see the updated map" 