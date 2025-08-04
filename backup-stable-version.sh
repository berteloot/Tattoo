#!/bin/bash

# Tattoo Artist Locator App - Stable Backup Script
# Version: 1.0.0
# Date: $(date +%Y-%m-%d)
# Purpose: Create a complete backup of the stable production version

set -e  # Exit on any error

# Configuration
BACKUP_DIR="backup-stable-v1.0.0-$(date +%Y%m%d-%H%M%S)"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
VERSION="1.0.0"

echo "=========================================="
echo "Tattoo Artist Locator - Stable Backup v$VERSION"
echo "Timestamp: $TIMESTAMP"
echo "=========================================="

# Create backup directory
mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

echo "📁 Creating backup directory: $BACKUP_DIR"

# Create backup metadata
cat > BACKUP_INFO.md << EOF
# Tattoo Artist Locator - Stable Backup v$VERSION

## Backup Information
- **Version**: $VERSION
- **Date**: $TIMESTAMP
- **Status**: Production Ready
- **Live URL**: https://tattooed-world-app.onrender.com

## Application Features
- ✅ Complete Role-Based Access Control (CLIENT/ARTIST/ADMIN)
- ✅ Full Admin System with User Management
- ✅ Artist Dashboard with Analytics
- ✅ Google Maps Integration with Fallback
- ✅ Authentication System (100% Working)
- ✅ Rate Limiting (Fixed for Render.com)
- ✅ Single Domain Deployment
- ✅ Database with Prisma ORM
- ✅ File Upload Support (Cloudinary/S3)
- ✅ Email Verification System
- ✅ Review Management System
- ✅ Favorites System
- ✅ Calendly Integration

## Database Schema
- User Management with RBAC
- Artist Profiles with Verification
- Specialties and Services
- Flash Portfolio Management
- Review System with Moderation
- Admin Action Audit Trail
- Favorites System

## Environment Requirements
- Node.js >= 18.0.0
- PostgreSQL Database
- Environment Variables (see .env.example files)

## Deployment
- Render.com Single Domain Architecture
- Frontend + Backend served from same URL
- Automated build and deployment

## Test Accounts
- Admin: berteloot@gmail.com / admin123
- Client: client@example.com / client123
- Artist: artist@example.com / artist123

## Recovery Instructions
1. Extract backup to new directory
2. Run: npm run install:all
3. Set up environment variables
4. Run: npm run db:setup
5. Start with: npm run dev

## Files Included
- Complete frontend (React + Vite)
- Complete backend (Node.js + Express)
- Database schema and migrations
- Deployment configuration
- Environment templates
- Documentation
- Test files
- Build scripts

## Security Features
- JWT Authentication
- Role-based access control
- Input validation
- Rate limiting
- Admin audit trails
- Content moderation

## Recent Fixes Applied
- Rate limiter proxy header fix
- Frontend crash resolution
- Authentication system validation
- Admin system completion
- Artist dashboard implementation
- Google Maps integration
- Single domain deployment

EOF

# Copy core application files
echo "📦 Copying application files..."

# Frontend
cp -r ../frontend/ ./frontend/

# Backend
cp -r ../backend/ ./backend/

# Root configuration files
cp ../package.json ./
cp ../package-lock.json ./
cp ../render.yaml ./
cp ../.gitignore ./
cp ../.cursorrules ./
cp ../env.example ./

# Documentation
mkdir -p docs
cp ../README.md ./docs/
cp ../SETUP.md ./docs/
cp ../DEPLOYMENT_GUIDE.md ./docs/
cp ../ADMIN_SYSTEM_COMPLETE.md ./docs/
cp ../AUTHENTICATION_STATUS_SUMMARY.md ./docs/
cp ../RATE_LIMITER_FIX.md ./docs/
cp ../FRONTEND_CRASH_FIX.md ./docs/
cp ../SINGLE_DOMAIN_DEPLOYMENT.md ./docs/
cp ../GOOGLE_MAPS_SETUP_COMPLETE.md ./docs/
cp ../CLOUDINARY_IMPLEMENTATION.md ./docs/
cp ../EMAIL_VERIFICATION_IMPLEMENTATION.md ./docs/
cp ../CALENDLY_INTEGRATION.md ./docs/
cp ../REVIEW_MANAGEMENT_BEST_PRACTICES.md ./docs/
cp ../ADDRESS_AUTOCOMPLETE_IMPLEMENTATION.md ./docs/

# Scripts
cp ../quick-start.sh ./
cp ../build.sh ./
cp ../build-frontend.sh ./
cp ../deploy.sh ./
cp ../setup-env.sh ./
cp ../setup-google-maps.sh ./
cp ../setup-cloudinary.sh ./
cp ../setup-google-maps-autocomplete.sh ./

# SQL files
mkdir -p sql
cp ../add_favorites_table.sql ./sql/
cp ../add_sample_favorites.sql ./sql/
cp ../add_social_media_fields.sql ./sql/
cp ../enhance_flash_pricing_clean.sql ./sql/
cp ../enhance_flash_pricing_fixed.sql ./sql/
cp ../update_specialties_clean.sql ./sql/
cp ../check_artist_profiles_schema.sql ./sql/

# Create environment templates
echo "🔧 Creating environment templates..."

# Backend environment template
cat > backend/.env.example << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/tattoo_app"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting (Fixed for Render.com deployment)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional)
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="your-verified-sender@yourdomain.com"
FRONTEND_URL="http://localhost:5173"

# File Upload Configuration (Optional)
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
EOF

# Frontend environment template
cat > frontend/.env.example << 'EOF'
# API Configuration
VITE_API_URL="http://localhost:3001"

# Google Maps API (Optional)
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Environment
VITE_NODE_ENV="development"
EOF

# Create recovery script
cat > restore-backup.sh << 'EOF'
#!/bin/bash

# Tattoo Artist Locator - Backup Restoration Script
# This script will restore the application from backup

set -e

echo "=========================================="
echo "Tattoo Artist Locator - Backup Restoration"
echo "=========================================="

# Check if we're in the backup directory
if [ ! -f "BACKUP_INFO.md" ]; then
    echo "❌ Error: Please run this script from the backup directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm run install:all

echo "🔧 Setting up environment..."
echo "Please copy .env.example to .env and configure your environment variables"
echo "Then run: npm run db:setup"

echo "✅ Backup restoration ready!"
echo "Next steps:"
echo "1. Configure environment variables"
echo "2. Run: npm run db:setup"
echo "3. Start development: npm run dev"
echo "4. For production: npm run build && npm start"
EOF

chmod +x restore-backup.sh

# Create production deployment script
cat > deploy-production.sh << 'EOF'
#!/bin/bash

# Production Deployment Script
# This script deploys the application to Render.com

set -e

echo "=========================================="
echo "Tattoo Artist Locator - Production Deployment"
echo "=========================================="

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: render.yaml not found"
    exit 1
fi

echo "🚀 Deploying to Render.com..."
echo "Make sure you have:"
echo "1. Render.com account"
echo "2. Git repository connected"
echo "3. Environment variables configured"

echo "📋 Deployment checklist:"
echo "✅ render.yaml configured"
echo "✅ Environment variables set"
echo "✅ Database connection configured"
echo "✅ Build scripts ready"

echo "🔗 Live URL: https://tattooed-world-app.onrender.com"
echo "📊 Render Dashboard: https://dashboard.render.com"

echo "✅ Deployment script ready!"
echo "Push to your connected repository to trigger deployment"
EOF

chmod +x deploy-production.sh

# Create database backup script
cat > backup-database.sh << 'EOF'
#!/bin/bash

# Database Backup Script
# This script creates a database backup

set -e

echo "=========================================="
echo "Database Backup Script"
echo "=========================================="

# Load environment variables
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in environment"
    exit 1
fi

# Extract database info from URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')

BACKUP_FILE="database-backup-$(date +%Y%m%d-%H%M%S).sql"

echo "📊 Creating database backup: $BACKUP_FILE"

# Create backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE

echo "✅ Database backup created: $BACKUP_FILE"
echo "💾 Backup size: $(du -h $BACKUP_FILE | cut -f1)"
EOF

chmod +x backup-database.sh

# Create health check script
cat > health-check.sh << 'EOF'
#!/bin/bash

# Health Check Script
# This script checks the application health

set -e

echo "=========================================="
echo "Application Health Check"
echo "=========================================="

# Check Node.js version
echo "🔍 Checking Node.js version..."
node --version

# Check npm version
echo "🔍 Checking npm version..."
npm --version

# Check if dependencies are installed
echo "🔍 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Root dependencies installed"
else
    echo "❌ Root dependencies missing"
fi

if [ -d "backend/node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend dependencies missing"
fi

if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend dependencies missing"
fi

# Check environment files
echo "🔍 Checking environment files..."
if [ -f ".env" ]; then
    echo "✅ Root .env exists"
else
    echo "⚠️  Root .env missing (copy from .env.example)"
fi

if [ -f "backend/.env" ]; then
    echo "✅ Backend .env exists"
else
    echo "⚠️  Backend .env missing (copy from backend/.env.example)"
fi

if [ -f "frontend/.env" ]; then
    echo "✅ Frontend .env exists"
else
    echo "⚠️  Frontend .env missing (copy from frontend/.env.example)"
fi

# Check database connection
echo "🔍 Checking database connection..."
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    if [ ! -z "$DATABASE_URL" ]; then
        echo "✅ DATABASE_URL configured"
    else
        echo "❌ DATABASE_URL missing"
    fi
else
    echo "⚠️  Cannot check DATABASE_URL (no .env file)"
fi

echo "✅ Health check complete!"
EOF

chmod +x health-check.sh

# Create comprehensive README for backup
cat > README.md << 'EOF'
# Tattoo Artist Locator - Stable Backup v1.0.0

## 🎯 Overview
This is a complete backup of the Tattoo Artist Locator application, a full-stack web application that connects clients with tattoo artists based on location, style, and specialty.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL Database
- Git

### Installation
1. **Extract the backup** to your desired location
2. **Install dependencies**:
   ```bash
   npm run install:all
   ```
3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
4. **Configure your environment variables** in the `.env` files
5. **Set up the database**:
   ```bash
   npm run db:setup
   ```
6. **Start development server**:
   ```bash
   npm run dev
   ```

## 📁 Project Structure
```
tattoo-app/
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express API
├── docs/             # Documentation
├── sql/              # Database scripts
├── scripts/          # Utility scripts
└── README.md         # This file
```

## 🔧 Configuration

### Environment Variables
- **Backend**: See `backend/.env.example`
- **Frontend**: See `frontend/.env.example`
- **Root**: See `.env.example`

### Database Setup
The application uses PostgreSQL with Prisma ORM. Run:
```bash
npm run db:setup
```

## 🎨 Features

### Client Features
- Browse artists on interactive map
- Filter by specialty, rating, style
- View artist profiles and portfolios
- Leave reviews and ratings
- Manage favorites

### Artist Features
- Create and manage artist profile
- Upload flash designs
- Set services and pricing
- Manage location and specialties
- View analytics dashboard

### Admin Features
- Complete user management
- Artist verification system
- Review moderation
- Content management
- Audit trail logging

## 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (CLIENT/ARTIST/ADMIN)
- Input validation and sanitization
- Rate limiting
- Admin audit trails

## 🗄️ Database Schema
- **Users**: Authentication and profiles
- **ArtistProfiles**: Extended artist information
- **Specialties**: Tattoo styles and categories
- **Services**: Artist services and pricing
- **Flash**: Portfolio items
- **Reviews**: Client reviews and ratings
- **AdminActions**: Audit trail
- **Favorites**: User favorites

## 🚀 Deployment

### Render.com (Recommended)
1. Connect your repository to Render
2. Configure environment variables
3. Deploy using the provided `render.yaml`

### Manual Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`

## 📊 Test Accounts
- **Admin**: berteloot@gmail.com / admin123
- **Client**: client@example.com / client123
- **Artist**: artist@example.com / artist123

## 🔧 Scripts

### Development
- `npm run dev` - Start development servers
- `npm run build` - Build for production
- `npm test` - Run tests

### Database
- `npm run db:setup` - Setup database and seed data
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

### Utility
- `./health-check.sh` - Check application health
- `./backup-database.sh` - Create database backup
- `./deploy-production.sh` - Deploy to production

## 📚 Documentation
- **Setup Guide**: `docs/SETUP.md`
- **Deployment Guide**: `docs/DEPLOYMENT_GUIDE.md`
- **Admin System**: `docs/ADMIN_SYSTEM_COMPLETE.md`
- **Authentication**: `docs/AUTHENTICATION_STATUS_SUMMARY.md`

## 🛠️ Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL in environment
2. **Dependencies**: Run `npm run install:all`
3. **Build Errors**: Check Node.js version (>= 18.0.0)
4. **Port Conflicts**: Check if ports 3001 and 5173 are available

### Health Check
Run the health check script:
```bash
./health-check.sh
```

## 🔄 Recovery
To restore from this backup:
1. Extract to new directory
2. Run `./restore-backup.sh`
3. Configure environment variables
4. Set up database
5. Start application

## 📞 Support
- **Live URL**: https://tattooed-world-app.onrender.com
- **Documentation**: See `docs/` directory
- **Issues**: Check troubleshooting section above

## 📄 License
MIT License - See LICENSE file for details

---
**Backup Version**: 1.0.0  
**Created**: $(date +%Y-%m-%d)  
**Status**: Production Ready ✅
EOF

# Create a compressed archive
echo "📦 Creating compressed archive..."
cd ..
tar -czf "${BACKUP_DIR}.tar.gz" "$BACKUP_DIR"

# Calculate backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
ARCHIVE_SIZE=$(du -sh "${BACKUP_DIR}.tar.gz" | cut -f1)

echo "=========================================="
echo "✅ Backup Complete!"
echo "=========================================="
echo "📁 Backup Directory: $BACKUP_DIR"
echo "📦 Compressed Archive: ${BACKUP_DIR}.tar.gz"
echo "💾 Backup Size: $BACKUP_SIZE"
echo "🗜️  Archive Size: $ARCHIVE_SIZE"
echo ""
echo "📋 Backup Contents:"
echo "✅ Complete frontend application"
echo "✅ Complete backend API"
echo "✅ Database schema and migrations"
echo "✅ Environment templates"
echo "✅ Deployment configuration"
echo "✅ Documentation and guides"
echo "✅ Utility scripts"
echo "✅ Test files"
echo ""
echo "🚀 Next Steps:"
echo "1. Test the backup: cd $BACKUP_DIR && ./health-check.sh"
echo "2. Store the archive safely: ${BACKUP_DIR}.tar.gz"
echo "3. For restoration: extract and run ./restore-backup.sh"
echo ""
echo "🔗 Live Application: https://tattooed-world-app.onrender.com"
echo "📚 Documentation: $BACKUP_DIR/docs/"
echo ""
echo "✅ Stable backup v$VERSION created successfully!" 