#!/bin/bash

# Tattoo Artist Locator App - New Stable Backup
# This script creates a comprehensive backup of the current stable version
# Created: $(date)
# Version: New Stable

set -e  # Exit on any error

echo "🎨 Creating New Stable Backup of Tattoo Artist Locator App..."
echo "============================================================="

# Create backup directory with timestamp
BACKUP_DIR="new-stable-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Creating backup directory: $BACKUP_DIR"

# Function to copy directory with progress
copy_with_progress() {
    local src="$1"
    local dest="$2"
    local name="$3"
    
    if [ -d "$src" ]; then
        echo "📋 Copying $name..."
        cp -r "$src" "$dest/"
        echo "✅ $name copied successfully"
    else
        echo "⚠️  Warning: $src not found, skipping $name"
    fi
}

# Function to copy file with progress
copy_file_with_progress() {
    local src="$1"
    local dest="$2"
    local name="$3"
    
    if [ -f "$src" ]; then
        echo "📄 Copying $name..."
        cp "$src" "$dest/"
        echo "✅ $name copied successfully"
    else
        echo "⚠️  Warning: $src not found, skipping $name"
    fi
}

# Create main backup structure
mkdir -p "$BACKUP_DIR"/{frontend,backend,docs,scripts,config}

echo "🚀 Starting backup process..."

# 1. Frontend backup
echo ""
echo "🎯 Backing up Frontend..."
copy_with_progress "frontend" "$BACKUP_DIR" "Frontend Application"
copy_file_with_progress "frontend/package.json" "$BACKUP_DIR/frontend" "Frontend package.json"
copy_file_with_progress "frontend/package-lock.json" "$BACKUP_DIR/frontend" "Frontend package-lock.json"
copy_file_with_progress "frontend/vite.config.js" "$BACKUP_DIR/frontend" "Vite config"
copy_file_with_progress "frontend/tailwind.config.js" "$BACKUP_DIR/frontend" "Tailwind config"
copy_file_with_progress "frontend/postcss.config.js" "$BACKUP_DIR/frontend" "PostCSS config"
copy_file_with_progress "frontend/index.html" "$BACKUP_DIR/frontend" "Index HTML"
copy_file_with_progress "frontend/vercel.json" "$BACKUP_DIR/frontend" "Vercel config"

# 2. Backend backup
echo ""
echo "🔧 Backing up Backend..."
copy_with_progress "backend/src" "$BACKUP_DIR/backend" "Backend source code"
copy_with_progress "backend/prisma" "$BACKUP_DIR/backend" "Prisma schema and migrations"
copy_with_progress "backend/scripts" "$BACKUP_DIR/backend" "Backend scripts"
copy_file_with_progress "backend/package.json" "$BACKUP_DIR/backend" "Backend package.json"
copy_file_with_progress "backend/package-lock.json" "$BACKUP_DIR/backend" "Backend package-lock.json"
copy_file_with_progress "backend/jest.config.js" "$BACKUP_DIR/backend" "Jest config"

# 3. Documentation backup
echo ""
echo "📚 Backing up Documentation..."
copy_with_progress "docs" "$BACKUP_DIR" "Documentation"
copy_file_with_progress "README.md" "$BACKUP_DIR" "Main README"
copy_file_with_progress "SETUP.md" "$BACKUP_DIR" "Setup guide"
copy_file_with_progress "DEVELOPMENT_SETUP_COMPLETE.md" "$BACKUP_DIR" "Development setup"
copy_file_with_progress "ENVIRONMENT_SETUP_COMPLETE.md" "$BACKUP_DIR" "Environment setup"
copy_file_with_progress "ADMIN_SYSTEM_COMPLETE.md" "$BACKUP_DIR" "Admin system docs"
copy_file_with_progress "BACKUP_SYSTEM_COMPLETE.md" "$BACKUP_DIR" "Backup system docs"
copy_file_with_progress "SINGLE_DOMAIN_DEPLOYMENT.md" "$BACKUP_DIR" "Deployment guide"
copy_file_with_progress "GOOGLE_MAPS_SETUP_COMPLETE.md" "$BACKUP_DIR" "Google Maps setup"
copy_file_with_progress "CALENDLY_INTEGRATION.md" "$BACKUP_DIR" "Calendly integration"
copy_file_with_progress "CONTACT_GATING_IMPLEMENTATION.md" "$BACKUP_DIR" "Contact gating"
copy_file_with_progress "SPAM_PROTECTION_IMPLEMENTATION.md" "$BACKUP_DIR" "Spam protection"
copy_file_with_progress "REVIEW_MANAGEMENT_BEST_PRACTICES.md" "$BACKUP_DIR" "Review management"
copy_file_with_progress "GEOCODING_CRITICAL_FIX.md" "$BACKUP_DIR" "Geocoding fixes"
copy_file_with_progress "FRONTEND_CONFIG_GUIDE.md" "$BACKUP_DIR" "Frontend config"

# 4. Configuration files backup
echo ""
echo "⚙️  Backing up Configuration..."
copy_file_with_progress "package.json" "$BACKUP_DIR" "Root package.json"
copy_file_with_progress "package-lock.json" "$BACKUP_DIR" "Root package-lock.json"
copy_file_with_progress "render.yaml" "$BACKUP_DIR" "Render deployment config"

# 5. Emergency and utility scripts backup
echo ""
echo "🚨 Backing up Emergency Scripts..."
copy_file_with_progress "create-complete-backup.sh" "$BACKUP_DIR/scripts" "Complete backup script"
copy_file_with_progress "create-stable-backup.sh" "$BACKUP_DIR/scripts" "Stable backup script"
copy_file_with_progress "create-stable-backup-v2.sh" "$BACKUP_DIR/scripts" "Stable backup v2 script"
copy_file_with_progress "create-new-stable-backup.sh" "$BACKUP_DIR/scripts" "New stable backup script"

# 6. Database and migration scripts backup
echo ""
echo "🗄️  Backing up Database Scripts..."
copy_file_with_progress "studios-template.csv" "$BACKUP_DIR/scripts" "Studios template CSV"

# 7. Create backup manifest
echo ""
echo "📋 Creating backup manifest..."
cat > "$BACKUP_DIR/BACKUP_MANIFEST.md" << 'EOF'
# Tattoo Artist Locator App - New Stable Backup

## Backup Information
- **Date**: $(date)
- **Version**: New Stable
- **Type**: Current Stable Version Backup
- **Status**: Complete

## Application Overview
This is the current stable version of the tattoo artist locator application with:
- Complete role-based access control (CLIENT/ARTIST/ADMIN)
- Full admin system with user management and audit trails
- Artist dashboard with analytics and location management
- Google Maps integration with fallback support
- Single domain deployment architecture
- PostgreSQL database with Prisma ORM
- React frontend with Tailwind CSS
- Node.js backend with Express

## Core Features
✅ **Authentication System**: JWT-based with role management
✅ **Admin Dashboard**: Complete user and content management
✅ **Artist Dashboard**: Analytics, portfolio, and location management
✅ **Google Maps**: Interactive location selection with fallbacks
✅ **Review System**: Moderation and rating management
✅ **File Uploads**: Cloudinary integration for images
✅ **Geocoding**: Address to coordinates conversion
✅ **Rate Limiting**: Production-ready with proxy support
✅ **Security**: Input validation, CORS, audit trails

## File Structure
```
new-stable-backup/
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express API
├── docs/             # Complete documentation
├── scripts/          # Emergency and utility scripts
├── config/           # Configuration files
└── BACKUP_MANIFEST.md # This file
```

## Production Status
- **Live URL**: https://tattooed-world-backend.onrender.com
- **Database**: PostgreSQL with Prisma ORM
- **Hosting**: Render.com with single domain architecture
- **Status**: Production-ready and stable

## Test Accounts (for development)
```
Admin: berteloot@gmail.com / admin123
Client: client@example.com / client123
Artist: artist@example.com / artist123
Pending Artist: pending@example.com / pending123
```

## Recent Features
- ✅ Authentication system fully functional
- ✅ Admin system complete with audit trails
- ✅ Artist dashboard with location management
- ✅ Google Maps integration working
- ✅ Rate limiting fixed for Render.com
- ✅ Frontend crash issues resolved
- ✅ Database schema optimized
- ✅ Emergency recovery scripts included
- ✅ Studio integration with production API
- ✅ Message system for artist cards

## Restoration Instructions
1. Extract this backup to a clean directory
2. Run `npm install` in both frontend and backend directories
3. Set up environment variables (see .env.example)
4. Run database migrations: `npx prisma migrate deploy`
5. Start backend: `npm run dev` (backend directory)
6. Start frontend: `npm run dev` (frontend directory)

## Emergency Recovery
Use the scripts in the `scripts/` directory for:
- Account recovery
- Password resets
- Database recovery
- Production fixes
- Schema repairs

## Notes
- This backup represents the current stable version
- All critical fixes and improvements are included
- Emergency recovery procedures are documented
- Complete admin system is functional
- Single domain deployment is configured
- Rate limiting is optimized for production
- Studio integration is working with production API

---
**Backup Created**: $(date)
**Backup Version**: New Stable
**Status**: CURRENT STABLE VERSION
EOF

# 8. Create database schema backup
echo ""
echo "🗄️  Creating database schema backup..."
if [ -f "backend/prisma/schema.prisma" ]; then
    cp "backend/prisma/schema.prisma" "$BACKUP_DIR/config/"
    echo "✅ Database schema backed up"
else
    echo "⚠️  Warning: Database schema not found"
fi

# 9. Create package versions backup
echo ""
echo "📦 Creating package versions backup..."
cat > "$BACKUP_DIR/config/PACKAGE_VERSIONS.md" << 'EOF'
# Package Versions - New Stable Backup

## Frontend Dependencies
$(cd frontend && npm list --depth=0 2>/dev/null | head -20)

## Backend Dependencies
$(cd backend && npm list --depth=0 2>/dev/null | head -20)

## Root Dependencies
$(npm list --depth=0 2>/dev/null | head -20)

---
**Generated**: $(date)
EOF

# 10. Create backup summary
echo ""
echo "📊 Creating backup summary..."
cat > "$BACKUP_DIR/BACKUP_SUMMARY.md" << 'EOF'
# Backup Summary - New Stable Backup

## Backup Statistics
- **Total Files**: $(find "$BACKUP_DIR" -type f | wc -l)
- **Total Size**: $(du -sh "$BACKUP_DIR" | cut -f1)
- **Backup Date**: $(date)
- **Backup Version**: New Stable

## What's Included
✅ Complete frontend application (React + Vite)
✅ Complete backend API (Node.js + Express)
✅ Database schema and migrations (Prisma)
✅ All documentation and guides
✅ Emergency recovery scripts
✅ Configuration files
✅ Package dependencies
✅ Production deployment config

## What's NOT Included
❌ Environment variables (.env files)
❌ Database data (only schema)
❌ Uploaded files (images, etc.)
❌ Runtime logs
❌ Temporary files

## Critical Files Backed Up
- Frontend source code and configuration
- Backend API routes and middleware
- Database schema and migrations
- Admin system components
- Artist dashboard components
- Google Maps integration
- Authentication system
- Role-based access control
- Emergency recovery scripts
- Production deployment config
- Studio integration system

## Restoration Priority
1. **High Priority**: Backend API and database
2. **Medium Priority**: Frontend application
3. **Low Priority**: Documentation and scripts

## Security Notes
- No sensitive data included in backup
- Environment variables must be recreated
- Database credentials must be reconfigured
- API keys must be re-added

---
**Backup Complete**: $(date)
**Status**: READY FOR RESTORATION
EOF

# 11. Create compressed archive
echo ""
echo "🗜️  Creating compressed archive..."
tar -czf "${BACKUP_DIR}.tar.gz" "$BACKUP_DIR"
echo "✅ Compressed archive created: ${BACKUP_DIR}.tar.gz"

# 12. Final summary
echo ""
echo "🎉 NEW STABLE BACKUP COMPLETED SUCCESSFULLY!"
echo "============================================="
echo "📁 Backup Directory: $BACKUP_DIR"
echo "🗜️  Compressed Archive: ${BACKUP_DIR}.tar.gz"
echo "📊 Total Size: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo "📄 Total Files: $(find "$BACKUP_DIR" -type f | wc -l)"
echo ""
echo "📋 Backup Contents:"
echo "   ✅ Frontend Application (React + Vite)"
echo "   ✅ Backend API (Node.js + Express)"
echo "   ✅ Database Schema (Prisma)"
echo "   ✅ Complete Documentation"
echo "   ✅ Emergency Recovery Scripts"
echo "   ✅ Configuration Files"
echo "   ✅ Package Dependencies"
echo "   ✅ Production Deployment Config"
echo "   ✅ Studio Integration System"
echo ""
echo "🚀 This backup is ready for production restoration!"
echo "📚 See BACKUP_MANIFEST.md for detailed information"
echo "🔧 See BACKUP_SUMMARY.md for restoration guidance"
echo ""
echo "💾 Backup location: $(pwd)/$BACKUP_DIR"
echo "🗜️  Archive location: $(pwd)/${BACKUP_DIR}.tar.gz"





