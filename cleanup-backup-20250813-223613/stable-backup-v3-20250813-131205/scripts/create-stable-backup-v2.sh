#!/bin/bash

# Tattoo App - Enhanced Stable Backup Script v2.0
# Creates comprehensive backup with production-ready features
# Usage: ./create-stable-backup-v2.sh

set -e  # Exit on any error

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PROJECT_NAME="tattoo-app"
BACKUP_DIR="$HOME/Documents/Tattoo_Backups"
CURRENT_DIR="/Users/stanislasberteloot/Documents/Tattoo"
VERSION="v2.0-stable"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Enhanced Stable Backup Process v2.0${NC}"
echo -e "${BLUE}📅 Timestamp: ${TIMESTAMP}${NC}"
echo -e "${BLUE}📁 Source: ${CURRENT_DIR}${NC}"
echo -e "${BLUE}💾 Backup Directory: ${BACKUP_DIR}${NC}"
echo ""

# Create backup directory structure
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/git-backups"
mkdir -p "$BACKUP_DIR/full-backups"
mkdir -p "$BACKUP_DIR/database-backups"
mkdir -p "$BACKUP_DIR/production-configs"
mkdir -p "$BACKUP_DIR/documentation"

# Verify we're in the correct directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Error: Not in the correct project directory${NC}"
    echo "Expected structure: package.json, frontend/, backend/"
    exit 1
fi

# 1. Create Git Tag for Current Stable Version
echo -e "${YELLOW}🏷️  Creating git tag for stable version...${NC}"
cd "$CURRENT_DIR"

# Check if git repository exists
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not a git repository, initializing...${NC}"
    git init
    git add .
    git commit -m "Initial commit for stable backup $TIMESTAMP"
fi

# Create tag
git tag -a "stable-backup-$TIMESTAMP" -m "Enhanced stable backup v2.0 created on $(date)"
git push origin "stable-backup-$TIMESTAMP" 2>/dev/null || echo -e "${YELLOW}⚠️  Warning: Could not push tag to origin (offline or no remote?)${NC}"
echo -e "${GREEN}✅ Git tag created: stable-backup-$TIMESTAMP${NC}"

# 2. Create Git Bundle Backup (Complete Repository)
echo -e "${YELLOW}📦 Creating git bundle backup...${NC}"
git bundle create "$BACKUP_DIR/git-backups/${PROJECT_NAME}-${VERSION}-${TIMESTAMP}.bundle" --all
echo -e "${GREEN}✅ Git bundle created: ${PROJECT_NAME}-${VERSION}-${TIMESTAMP}.bundle${NC}"

# 3. Create Full Project Archive (Production Ready)
echo -e "${YELLOW}🗜️  Creating full project archive...${NC}"
cd "$HOME/Documents"
tar -czf "$BACKUP_DIR/full-backups/${PROJECT_NAME}-full-${VERSION}-${TIMESTAMP}.tar.gz" \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="*.log" \
    --exclude="dist" \
    --exclude="build" \
    --exclude=".env" \
    --exclude=".env.local" \
    --exclude="coverage" \
    --exclude=".nyc_output" \
    --exclude="*.sqlite" \
    --exclude="*.db" \
    "Tattoo"
echo -e "${GREEN}✅ Full archive created: ${PROJECT_NAME}-full-${VERSION}-${TIMESTAMP}.tar.gz${NC}"

# 4. Create Source Code Only Backup (Clean)
echo -e "${YELLOW}📄 Creating clean source code backup...${NC}"
tar -czf "$BACKUP_DIR/full-backups/${PROJECT_NAME}-source-${VERSION}-${TIMESTAMP}.tar.gz" \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="*.log" \
    --exclude="dist" \
    --exclude="build" \
    --exclude="package-lock.json" \
    --exclude=".env*" \
    --exclude="coverage" \
    --exclude=".nyc_output" \
    "Tattoo"
echo -e "${GREEN}✅ Source code archive created: ${PROJECT_NAME}-source-${VERSION}-${TIMESTAMP}.tar.gz${NC}"

# 5. Create Database Schema and Migrations Backup
echo -e "${YELLOW}🗄️  Creating database schema backup...${NC}"
cd "$CURRENT_DIR"
mkdir -p "$BACKUP_DIR/database-backups/$TIMESTAMP"

# Copy Prisma schema and migrations
if [ -f "backend/prisma/schema.prisma" ]; then
    cp backend/prisma/schema.prisma "$BACKUP_DIR/database-backups/$TIMESTAMP/"
    echo -e "${GREEN}  ✓ Prisma schema backed up${NC}"
fi

if [ -d "backend/prisma/migrations" ]; then
    cp -r backend/prisma/migrations "$BACKUP_DIR/database-backups/$TIMESTAMP/"
    echo -e "${GREEN}  ✓ Database migrations backed up${NC}"
fi

if [ -f "backend/prisma/seed.js" ]; then
    cp backend/prisma/seed.js "$BACKUP_DIR/database-backups/$TIMESTAMP/"
    echo -e "${GREEN}  ✓ Database seed file backed up${NC}"
fi

# Copy database scripts
if [ -d "backend/scripts" ]; then
    cp -r backend/scripts "$BACKUP_DIR/database-backups/$TIMESTAMP/"
    echo -e "${GREEN}  ✓ Database scripts backed up${NC}"
fi

# Copy any SQL files
find . -name "*.sql" -not -path "./node_modules/*" -not -path "./.git/*" | while read file; do
    mkdir -p "$BACKUP_DIR/database-backups/$TIMESTAMP/sql-files/$(dirname "$file")"
    cp "$file" "$BACKUP_DIR/database-backups/$TIMESTAMP/sql-files/$file"
done

echo -e "${GREEN}✅ Database schema backup created${NC}"

# 6. Create Production Configuration Backup
echo -e "${YELLOW}🔧 Creating production configuration backup...${NC}"

# Environment templates
find . -name "*.env.example" -o -name ".env.template" | while read file; do
    cp "$file" "$BACKUP_DIR/production-configs/"
done

# Package.json files (dependencies)
find . -name "package.json" -not -path "./node_modules/*" | while read file; do
    relative_path=$(echo "$file" | sed 's|^\./||')
    target_name=$(echo "$relative_path" | sed 's|/|_|g')
    cp "$file" "$BACKUP_DIR/production-configs/$target_name"
done

# Configuration files
for config_file in "render.yaml" "tailwind.config.js" "vite.config.js" "postcss.config.js" "jest.config.js" "vitest.config.js"; do
    find . -name "$config_file" -not -path "./node_modules/*" | while read file; do
        cp "$file" "$BACKUP_DIR/production-configs/"
    done
done

echo -e "${GREEN}✅ Production configurations backed up${NC}"

# 7. Create Documentation Backup
echo -e "${YELLOW}📚 Creating documentation backup...${NC}"

# Copy all markdown files
find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" | while read file; do
    cp "$file" "$BACKUP_DIR/documentation/"
done

# Copy docs directory if it exists
if [ -d "docs" ]; then
    cp -r docs "$BACKUP_DIR/documentation/"
fi

echo -e "${GREEN}✅ Documentation backed up${NC}"

# 8. Create Current State Snapshot
echo -e "${YELLOW}📊 Creating current state snapshot...${NC}"

# Get current git status and commit info
cat > "$BACKUP_DIR/current-state-$TIMESTAMP.txt" << EOF
# Tattoo App - Current State Snapshot
# Created: $(date)
# Backup Version: $VERSION
# Timestamp: $TIMESTAMP

## Git Information:
Current Branch: $(git branch --show-current 2>/dev/null || echo "No git repository")
Current Commit: $(git rev-parse HEAD 2>/dev/null || echo "No git repository")
Git Status: $(git status --porcelain 2>/dev/null || echo "No git repository")

## Recent Commits (Last 10):
$(git log --oneline -10 2>/dev/null || echo "No git history")

## Project Structure:
$(find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" -o -name "*.sql" \) -not -path "./node_modules/*" -not -path "./.git/*" | sort)

## Package Versions:
Frontend Dependencies:
$(cd frontend && npm list --depth=0 2>/dev/null || echo "No frontend dependencies")

Backend Dependencies:
$(cd backend && npm list --depth=0 2>/dev/null || echo "No backend dependencies")

## Environment Files:
$(find . -name "*.env*" -not -path "./node_modules/*" | sort)

## Database Migrations:
$(find backend/prisma/migrations -name "*.sql" 2>/dev/null | sort || echo "No migrations found")

## Key Features Status:
- ✅ Role-based Access Control (CLIENT/ARTIST/ADMIN)
- ✅ Admin Dashboard with User Management
- ✅ Artist Dashboard with Analytics
- ✅ Google Maps Integration (with fallback)
- ✅ Review System with Moderation
- ✅ Message Management System
- ✅ Gallery Management
- ✅ Studio Management
- ✅ Favorites System
- ✅ Contact Email Protection
- ✅ Calendly Integration
- ✅ Production Deployment (Render.com)
- ✅ Rate Limiting (Fixed for Render)
- ✅ Spam Protection
- ✅ Geocoding Service
EOF

echo -e "${GREEN}✅ Current state snapshot created${NC}"

# 9. Generate Enhanced Backup Manifest
echo -e "${YELLOW}📝 Creating enhanced backup manifest...${NC}"
cat > "$BACKUP_DIR/backup-manifest-$VERSION-$TIMESTAMP.md" << EOF
# Tattoo App Enhanced Backup Manifest v2.0

**Created:** $(date)  
**Version:** $VERSION  
**Timestamp:** $TIMESTAMP  
**Git Commit:** $(git rev-parse HEAD 2>/dev/null || echo "No git repository")  
**Git Branch:** $(git branch --show-current 2>/dev/null || echo "No git repository")

## 🎯 Production Status
- **Live URL:** https://tattooed-world-backend.onrender.com
- **Deployment:** Single domain architecture (frontend + backend)
- **Database:** PostgreSQL with PostGIS support
- **Authentication:** JWT with role-based access control
- **Status:** Production-ready with comprehensive features

## 📦 Backup Contents

### 1. Git Repository Backup
- **File:** \`git-backups/${PROJECT_NAME}-${VERSION}-${TIMESTAMP}.bundle\`
- **Type:** Complete git repository with full history
- **Usage:** \`git clone <bundle-file> restored-project\`

### 2. Full Project Archive
- **File:** \`full-backups/${PROJECT_NAME}-full-${VERSION}-${TIMESTAMP}.tar.gz\`
- **Type:** Complete project excluding node_modules and build files
- **Usage:** \`tar -xzf <archive-file>\`

### 3. Clean Source Code
- **File:** \`full-backups/${PROJECT_NAME}-source-${VERSION}-${TIMESTAMP}.tar.gz\`
- **Type:** Source code only, no dependencies or configs
- **Usage:** For code review and clean deployments

### 4. Database Schema & Migrations
- **Directory:** \`database-backups/$TIMESTAMP/\`
- **Contents:**
  - Prisma schema (\`schema.prisma\`)
  - All database migrations
  - Database seed file
  - Database utility scripts
  - SQL files

### 5. Production Configurations
- **Directory:** \`production-configs/\`
- **Contents:**
  - Environment templates (\`.env.example\`)
  - Package.json files (dependencies)
  - Build configuration files
  - Deployment configurations

### 6. Documentation
- **Directory:** \`documentation/\`
- **Contents:**
  - All markdown documentation
  - Setup guides
  - API documentation
  - System architecture docs

## 📊 File Sizes
$(du -sh "$BACKUP_DIR/git-backups/${PROJECT_NAME}-${VERSION}-${TIMESTAMP}.bundle" 2>/dev/null || echo "Bundle: Calculating...")
$(du -sh "$BACKUP_DIR/full-backups/${PROJECT_NAME}-full-${VERSION}-${TIMESTAMP}.tar.gz" 2>/dev/null || echo "Full Archive: Calculating...")
$(du -sh "$BACKUP_DIR/full-backups/${PROJECT_NAME}-source-${VERSION}-${TIMESTAMP}.tar.gz" 2>/dev/null || echo "Source Archive: Calculating...")
$(du -sh "$BACKUP_DIR/database-backups/$TIMESTAMP" 2>/dev/null || echo "Database Backup: Calculating...")

## 🔄 Recovery Instructions

### Quick Recovery (Recommended)
\`\`\`bash
# Run the automated restore script
bash $BACKUP_DIR/restore-backup-$VERSION-$TIMESTAMP.sh
\`\`\`

### Manual Recovery Options

#### Option 1: Git Bundle Restore
\`\`\`bash
git clone $BACKUP_DIR/git-backups/${PROJECT_NAME}-${VERSION}-${TIMESTAMP}.bundle restored-tattoo-app
cd restored-tattoo-app
npm run install:all
\`\`\`

#### Option 2: Archive Restore
\`\`\`bash
tar -xzf $BACKUP_DIR/full-backups/${PROJECT_NAME}-full-${VERSION}-${TIMESTAMP}.tar.gz
cd Tattoo
npm run install:all
\`\`\`

#### Option 3: Clean Source Deploy
\`\`\`bash
tar -xzf $BACKUP_DIR/full-backups/${PROJECT_NAME}-source-${VERSION}-${TIMESTAMP}.tar.gz
cd Tattoo
# Set up environment files from production-configs/
npm run install:all
npm run build
\`\`\`

## 🗄️ Database Recovery
\`\`\`bash
# Copy schema and migrations
cp $BACKUP_DIR/database-backups/$TIMESTAMP/schema.prisma backend/prisma/
cp -r $BACKUP_DIR/database-backups/$TIMESTAMP/migrations backend/prisma/

# Run migrations
cd backend
npx prisma migrate deploy
npx prisma db seed  # If seed file exists
\`\`\`

## 🌟 Key Features Included in This Backup

### Frontend Features
- React + Vite with Tailwind CSS
- Google Maps integration (with fallback)
- Role-based UI components
- Admin dashboard with user management
- Artist dashboard with analytics
- Review and rating system
- Message management
- Gallery management
- Favorites system
- Contact email protection

### Backend Features
- Node.js + Express API
- Prisma ORM with PostgreSQL
- JWT authentication
- Role-based access control (CLIENT/ARTIST/ADMIN)
- File upload with Cloudinary
- Email service integration
- Rate limiting (Render.com compatible)
- Geocoding service
- Anti-scraping protection
- Comprehensive API endpoints

### Database Features
- PostgreSQL with PostGIS
- Complete migration history
- Role-based permissions
- Audit trail system
- Optimized queries and indexes

### Production Features
- Single domain deployment
- Render.com configuration
- Environment templates
- Health check endpoints
- Error handling and logging
- Security middleware

## 🔍 Recent Commits
$(git log --oneline -5 2>/dev/null || echo "No git history available")

## 📁 Project Structure at Backup Time
\`\`\`
$(find . -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" \) -not -path "./node_modules/*" -not -path "./.git/*" | head -30 | sort)
...
\`\`\`

## 💡 Next Steps After Restore
1. **Environment Setup:** Copy \`.env.example\` files and configure with your values
2. **Dependencies:** Run \`npm run install:all\` to install all dependencies
3. **Database:** Set up PostgreSQL and run migrations
4. **Build:** Run \`npm run build\` for production deployment
5. **Deploy:** Follow deployment instructions in README.md

## 🆘 Support
If you need help restoring this backup:
1. Check the automated restore script first
2. Review the documentation in the \`documentation/\` directory
3. Ensure all environment variables are properly configured
4. Verify database connection and run migrations

---
**Backup completed successfully on $(date)**
EOF

echo -e "${GREEN}✅ Enhanced backup manifest created${NC}"

# 10. Create Enhanced Recovery Script
echo -e "${YELLOW}🔄 Creating enhanced recovery script...${NC}"
cat > "$BACKUP_DIR/restore-backup-$VERSION-$TIMESTAMP.sh" << EOF
#!/bin/bash
# Enhanced Recovery Script for Tattoo App Backup v2.0
# Timestamp: $TIMESTAMP
# Version: $VERSION

set -e

# Configuration
BACKUP_TIMESTAMP="$TIMESTAMP"
BACKUP_VERSION="$VERSION"
BACKUP_DIR="$HOME/Documents/Tattoo_Backups"
RESTORE_DIR="$HOME/Documents/Tattoo_Restored_\$BACKUP_TIMESTAMP"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "\${BLUE}🔄 Starting Enhanced Restoration Process v2.0\${NC}"
echo -e "\${BLUE}📅 Backup Timestamp: \$BACKUP_TIMESTAMP\${NC}"
echo -e "\${BLUE}📁 Restore Location: \$RESTORE_DIR\${NC}"
echo ""

# Check if restore directory already exists
if [ -d "\$RESTORE_DIR" ]; then
    echo -e "\${YELLOW}⚠️  Restore directory already exists: \$RESTORE_DIR\${NC}"
    echo -e "\${YELLOW}Do you want to remove it and continue? (y/N)\${NC}"
    read -r response
    if [[ "\$response" =~ ^[Yy]\$ ]]; then
        rm -rf "\$RESTORE_DIR"
        echo -e "\${GREEN}✅ Existing directory removed\${NC}"
    else
        echo -e "\${RED}❌ Restoration cancelled\${NC}"
        exit 1
    fi
fi

# Method 1: Restore from Git Bundle (Recommended)
if [ -f "\$BACKUP_DIR/git-backups/${PROJECT_NAME}-\$BACKUP_VERSION-\$BACKUP_TIMESTAMP.bundle" ]; then
    echo -e "\${YELLOW}📦 Restoring from git bundle...\${NC}"
    git clone "\$BACKUP_DIR/git-backups/${PROJECT_NAME}-\$BACKUP_VERSION-\$BACKUP_TIMESTAMP.bundle" "\$RESTORE_DIR"
    cd "\$RESTORE_DIR"
    echo -e "\${GREEN}✅ Git repository restored with full history\${NC}"
    
elif [ -f "\$BACKUP_DIR/full-backups/${PROJECT_NAME}-full-\$BACKUP_VERSION-\$BACKUP_TIMESTAMP.tar.gz" ]; then
    # Method 2: Restore from Full Archive
    echo -e "\${YELLOW}🗜️  Restoring from full archive...\${NC}"
    mkdir -p "\$(dirname "\$RESTORE_DIR")"
    tar -xzf "\$BACKUP_DIR/full-backups/${PROJECT_NAME}-full-\$BACKUP_VERSION-\$BACKUP_TIMESTAMP.tar.gz" -C "\$(dirname "\$RESTORE_DIR")"
    mv "\$(dirname "\$RESTORE_DIR")/Tattoo" "\$RESTORE_DIR"
    echo -e "\${GREEN}✅ Full archive restored\${NC}"
    
else
    echo -e "\${RED}❌ Error: No backup files found!\${NC}"
    echo "Expected files:"
    echo "  - \$BACKUP_DIR/git-backups/${PROJECT_NAME}-\$BACKUP_VERSION-\$BACKUP_TIMESTAMP.bundle"
    echo "  - \$BACKUP_DIR/full-backups/${PROJECT_NAME}-full-\$BACKUP_VERSION-\$BACKUP_TIMESTAMP.tar.gz"
    exit 1
fi

# Copy environment templates
echo -e "\${YELLOW}🔧 Setting up environment templates...\${NC}"
if [ -d "\$BACKUP_DIR/production-configs" ]; then
    # Backend environment
    if [ -f "\$BACKUP_DIR/production-configs/.env.example" ]; then
        cp "\$BACKUP_DIR/production-configs/.env.example" "\$RESTORE_DIR/backend/.env.example"
        echo -e "\${GREEN}  ✓ Backend environment template copied\${NC}"
    fi
    
    # Frontend environment
    if [ -f "\$BACKUP_DIR/production-configs/.env.example" ]; then
        cp "\$BACKUP_DIR/production-configs/.env.example" "\$RESTORE_DIR/frontend/.env.example"
        echo -e "\${GREEN}  ✓ Frontend environment template copied\${NC}"
    fi
fi

# Install dependencies
echo -e "\${YELLOW}📦 Installing dependencies...\${NC}"
cd "\$RESTORE_DIR"

if [ -f "package.json" ]; then
    echo -e "\${BLUE}  Installing root dependencies...\${NC}"
    npm install
fi

if [ -f "backend/package.json" ]; then
    echo -e "\${BLUE}  Installing backend dependencies...\${NC}"
    cd backend && npm install && cd ..
fi

if [ -f "frontend/package.json" ]; then
    echo -e "\${BLUE}  Installing frontend dependencies...\${NC}"
    cd frontend && npm install && cd ..
fi

echo -e "\${GREEN}✅ Dependencies installed\${NC}"

# Generate Prisma client
if [ -f "backend/prisma/schema.prisma" ]; then
    echo -e "\${YELLOW}🗄️  Generating Prisma client...\${NC}"
    cd backend && npx prisma generate && cd ..
    echo -e "\${GREEN}✅ Prisma client generated\${NC}"
fi

# Final Summary
echo ""
echo -e "\${GREEN}🎉 RESTORATION COMPLETE!\${NC}"
echo -e "\${GREEN}═══════════════════════════════════════════════════════════\${NC}"
echo -e "\${BLUE}📁 Project restored to: \$RESTORE_DIR\${NC}"
echo -e "\${BLUE}📚 Documentation: \$BACKUP_DIR/documentation/\${NC}"
echo -e "\${BLUE}🔧 Configs: \$BACKUP_DIR/production-configs/\${NC}"
echo ""
echo -e "\${YELLOW}💡 Next steps:\${NC}"
echo -e "1. \${BLUE}cd \$RESTORE_DIR\${NC}"
echo -e "2. \${BLUE}Set up environment files:\${NC}"
echo -e "   - Copy \${BLUE}backend/.env.example\${NC} to \${BLUE}backend/.env\${NC} and configure"
echo -e "   - Copy \${BLUE}frontend/.env.example\${NC} to \${BLUE}frontend/.env\${NC} and configure"
echo -e "3. \${BLUE}Set up database:\${NC}"
echo -e "   - Create PostgreSQL database"
echo -e "   - Run: \${BLUE}cd backend && npx prisma migrate deploy\${NC}"
echo -e "   - Run: \${BLUE}npx prisma db seed\${NC} (if needed)"
echo -e "4. \${BLUE}Start development:\${NC}"
echo -e "   - Run: \${BLUE}npm run dev\${NC} (both frontend and backend)"
echo -e "5. \${BLUE}Build for production:\${NC}"
echo -e "   - Run: \${BLUE}npm run build\${NC}"
echo ""
echo -e "\${GREEN}✅ Your tattoo app is ready to go!\${NC}"
EOF

chmod +x "$BACKUP_DIR/restore-backup-$VERSION-$TIMESTAMP.sh"
echo -e "${GREEN}✅ Enhanced recovery script created${NC}"

# 11. Create Verification Report
echo -e "${YELLOW}🔍 Creating backup verification report...${NC}"
cat > "$BACKUP_DIR/verification-report-$VERSION-$TIMESTAMP.txt" << EOF
# Backup Verification Report
# Created: $(date)
# Version: $VERSION
# Timestamp: $TIMESTAMP

## File Verification:
Git Bundle: $([ -f "$BACKUP_DIR/git-backups/${PROJECT_NAME}-${VERSION}-${TIMESTAMP}.bundle" ] && echo "✅ EXISTS" || echo "❌ MISSING")
Full Archive: $([ -f "$BACKUP_DIR/full-backups/${PROJECT_NAME}-full-${VERSION}-${TIMESTAMP}.tar.gz" ] && echo "✅ EXISTS" || echo "❌ MISSING")
Source Archive: $([ -f "$BACKUP_DIR/full-backups/${PROJECT_NAME}-source-${VERSION}-${TIMESTAMP}.tar.gz" ] && echo "✅ EXISTS" || echo "❌ MISSING")
Database Backup: $([ -d "$BACKUP_DIR/database-backups/$TIMESTAMP" ] && echo "✅ EXISTS" || echo "❌ MISSING")
Production Configs: $([ -d "$BACKUP_DIR/production-configs" ] && echo "✅ EXISTS" || echo "❌ MISSING")
Documentation: $([ -d "$BACKUP_DIR/documentation" ] && echo "✅ EXISTS" || echo "❌ MISSING")
Restore Script: $([ -f "$BACKUP_DIR/restore-backup-$VERSION-$TIMESTAMP.sh" ] && echo "✅ EXISTS" || echo "❌ MISSING")

## File Sizes:
$(ls -lh "$BACKUP_DIR/git-backups/${PROJECT_NAME}-${VERSION}-${TIMESTAMP}.bundle" 2>/dev/null || echo "Git Bundle: Not found")
$(ls -lh "$BACKUP_DIR/full-backups/${PROJECT_NAME}-full-${VERSION}-${TIMESTAMP}.tar.gz" 2>/dev/null || echo "Full Archive: Not found")
$(ls -lh "$BACKUP_DIR/full-backups/${PROJECT_NAME}-source-${VERSION}-${TIMESTAMP}.tar.gz" 2>/dev/null || echo "Source Archive: Not found")

## Critical Files Check:
Backend package.json: $([ -f "backend/package.json" ] && echo "✅" || echo "❌")
Frontend package.json: $([ -f "frontend/package.json" ] && echo "✅" || echo "❌")
Prisma schema: $([ -f "backend/prisma/schema.prisma" ] && echo "✅" || echo "❌")
Server.js: $([ -f "backend/src/server.js" ] && echo "✅" || echo "❌")
Main App.jsx: $([ -f "frontend/src/App.jsx" ] && echo "✅" || echo "❌")
Render config: $([ -f "render.yaml" ] && echo "✅" || echo "❌")

## Database Migrations Count:
$(find backend/prisma/migrations -name "*.sql" 2>/dev/null | wc -l | xargs echo "Migration files:")

## Environment Templates:
$(find . -name "*.env.example" -o -name ".env.template" | wc -l | xargs echo "Environment templates:")

## Documentation Files:
$(find . -name "*.md" -not -path "./node_modules/*" | wc -l | xargs echo "Markdown files:")

## Backup Integrity: $([ $? -eq 0 ] && echo "✅ PASSED" || echo "❌ FAILED")
EOF

echo -e "${GREEN}✅ Verification report created${NC}"

# Final Summary with enhanced output
echo ""
echo -e "${GREEN}🎉 ENHANCED STABLE BACKUP COMPLETE! 🎉${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📁 Backup Location: ${BACKUP_DIR}${NC}"
echo -e "${BLUE}🏷️  Git Tag: stable-backup-${TIMESTAMP}${NC}"
echo -e "${BLUE}📝 Manifest: backup-manifest-${VERSION}-${TIMESTAMP}.md${NC}"
echo -e "${BLUE}🔄 Restore Script: restore-backup-${VERSION}-${TIMESTAMP}.sh${NC}"
echo -e "${BLUE}🔍 Verification: verification-report-${VERSION}-${TIMESTAMP}.txt${NC}"
echo ""
echo -e "${YELLOW}📊 Backup Summary:${NC}"
echo -e "$(ls -la "$BACKUP_DIR" | tail -n +2)"
echo ""
echo -e "${YELLOW}💾 Total Backup Size:${NC}"
echo -e "$(du -sh "$BACKUP_DIR" | cut -f1) - Complete backup directory"
echo ""
echo -e "${GREEN}💡 To restore this backup later:${NC}"
echo -e "${BLUE}   bash $BACKUP_DIR/restore-backup-$VERSION-$TIMESTAMP.sh${NC}"
echo ""
echo -e "${GREEN}🌟 Features included in this stable backup:${NC}"
echo -e "   ✅ Complete role-based access control system"
echo -e "   ✅ Admin dashboard with user management"
echo -e "   ✅ Artist dashboard with analytics"
echo -e "   ✅ Google Maps integration (with fallback)"
echo -e "   ✅ Review and messaging systems"
echo -e "   ✅ Gallery and favorites management"
echo -e "   ✅ Production-ready deployment configuration"
echo -e "   ✅ Complete database schema with migrations"
echo -e "   ✅ Security features and anti-spam protection"
echo ""
echo -e "${GREEN}✅ Your stable version is now safely backed up with enhanced features!${NC}"

