#!/bin/bash

echo "🎨 Cloudinary Setup for Tattoo Artist Locator"
echo "=============================================="
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file not found!"
    echo "Please run setup-env.sh first to create the environment file."
    exit 1
fi

echo "📋 This script will help you configure Cloudinary for image uploads."
echo ""

# Get Cloudinary credentials
echo "🔑 Please enter your Cloudinary credentials:"
echo ""

read -p "Cloud Name: " cloud_name
read -p "API Key: " api_key
read -p "API Secret: " api_secret

echo ""
echo "⏳ Updating backend/.env file..."

# Update the .env file
sed -i.bak "s/CLOUDINARY_CLOUD_NAME=.*/CLOUDINARY_CLOUD_NAME=\"$cloud_name\"/" backend/.env
sed -i.bak "s/CLOUDINARY_API_KEY=.*/CLOUDINARY_API_KEY=\"$api_key\"/" backend/.env
sed -i.bak "s/CLOUDINARY_API_SECRET=.*/CLOUDINARY_API_SECRET=\"$api_secret\"/" backend/.env

# Remove backup files
rm -f backend/.env.bak

echo "✅ Cloudinary credentials updated!"
echo ""

# Test the configuration
echo "🧪 Testing Cloudinary configuration..."
cd backend
node test-cloudinary.js
cd ..

echo ""
echo "🎉 Cloudinary setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Start your backend server: cd backend && npm run dev"
echo "2. Start your frontend: cd frontend && npm run dev"
echo "3. Test the image upload feature in the Artist Dashboard"
echo ""
echo "📚 For more information, see CLOUDINARY_IMPLEMENTATION.md" 