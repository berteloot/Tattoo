#!/bin/bash

echo "🎨 Tattoo Artist Locator - Environment Setup"
echo "============================================="

# Check if PostgreSQL is running
echo "📊 Checking PostgreSQL status..."
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first."
    echo "   On macOS with Homebrew: brew services start postgresql"
    echo "   On Ubuntu: sudo systemctl start postgresql"
    exit 1
fi
echo "✅ PostgreSQL is running"

# Create database if it doesn't exist
echo "🗄️  Setting up database..."
psql -c "CREATE DATABASE tattoo_app;" postgres 2>/dev/null || echo "Database already exists or error occurred"

# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -base64 32)

# Update backend .env file
echo "🔧 Configuring backend environment..."
cat > backend/.env << EOF
# Database Configuration
DATABASE_URL="postgresql://$(whoami)@localhost:5432/tattoo_app"

# JWT Authentication
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional - can be configured later)
SENDGRID_API_KEY=""
FROM_EMAIL=""
FRONTEND_URL="http://localhost:5173"

# File Upload Configuration (Optional)
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"

# Cloudinary Configuration (Optional - can be configured later)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
EOF

# Update frontend .env file
echo "🎨 Configuring frontend environment..."
cat > frontend/.env << EOF
# API Configuration
VITE_API_URL="http://localhost:3001"

# Google Maps API (Optional - can be configured later)
VITE_GOOGLE_MAPS_API_KEY=""

# Environment
VITE_NODE_ENV="development"
EOF

echo "✅ Environment files created successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Install dependencies: npm install"
echo "2. Run database migrations: cd backend && npx prisma migrate dev"
echo "3. Seed the database: cd backend && npx prisma db seed"
echo "4. Start the backend: cd backend && npm run dev"
echo "5. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🔑 Optional API Keys to configure later:"
echo "- Google Maps API Key (for map functionality)"
echo "- SendGrid API Key (for email notifications)"
echo "- Cloudinary credentials (for image uploads)"
echo ""
echo "🎯 Test Accounts (after seeding):"
echo "- Admin: admin@tattoolocator.com / admin123"
echo "- Artist: artist@example.com / artist123"
echo "- Client: client@example.com / client123" 