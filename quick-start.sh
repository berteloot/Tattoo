#!/bin/bash

echo "🚀 Tattoo Artist Locator - Quick Start Script"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend and backend dependencies
echo "📦 Installing frontend and backend dependencies..."
npm run install:all

# Check if .env files exist
echo "🔧 Checking environment configuration..."

if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found!"
    echo "   Please create backend/.env with the following variables:"
    echo "   DATABASE_URL=postgresql://username:password@localhost:5432/tattoo_app"
    echo "   JWT_SECRET=your-super-secret-jwt-key"
    echo "   PORT=3001"
    echo "   NODE_ENV=development"
    echo "   CORS_ORIGIN=http://localhost:5173"
    echo ""
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found!"
    echo "   Please create frontend/.env with the following variables:"
    echo "   VITE_API_URL=http://localhost:3001"
    echo ""
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Set up your database (PostgreSQL)"
echo "2. Create .env files in backend/ and frontend/ directories"
echo "3. Run: npm run db:migrate"
echo "4. Run: npm run db:seed"
echo "5. Start the app: npm run dev"
echo ""
echo "📖 For detailed instructions, see SETUP.md"
echo ""
echo "✨ Happy coding!" 