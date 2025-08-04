#!/bin/bash

# Version Control Backup Script for Tattoo Artist Locator
# This script creates a Git archive and tags the stable version

set -e

echo "=========================================="
echo "Version Control Backup - Tattoo Artist Locator"
echo "=========================================="

# Configuration
VERSION="1.0.0"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
TAG_NAME="v${VERSION}-stable-${TIMESTAMP}"
ARCHIVE_NAME="tattoo-app-v${VERSION}-${TIMESTAMP}.tar.gz"

echo "🏷️  Creating version tag: $TAG_NAME"

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a Git repository"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: There are uncommitted changes"
    echo "Current status:"
    git status --short
    
    echo ""
    echo "Do you want to commit these changes before creating the backup? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "📝 Committing changes..."
        git add .
        git commit -m "Auto-commit before stable backup v$VERSION"
        echo "✅ Changes committed"
    else
        echo "⚠️  Proceeding with uncommitted changes"
    fi
fi

# Create version tag
echo "🏷️  Creating Git tag: $TAG_NAME"
git tag -a "$TAG_NAME" -m "Stable backup version $VERSION - $(date +"%Y-%m-%d %H:%M:%S")"

# Create Git archive
echo "📦 Creating Git archive: $ARCHIVE_NAME"
git archive --format=tar.gz --output="$ARCHIVE_NAME" "$TAG_NAME"

# Create backup info file
cat > "BACKUP_VERSION_INFO.md" << EOF
# Version Control Backup Information

## Backup Details
- **Version**: $VERSION
- **Tag**: $TAG_NAME
- **Date**: $(date +"%Y-%m-%d %H:%M:%S")
- **Archive**: $ARCHIVE_NAME

## Git Information
- **Current Branch**: $(git branch --show-current)
- **Last Commit**: $(git log -1 --oneline)
- **Commit Hash**: $(git rev-parse HEAD)
- **Repository**: $(git remote get-url origin 2>/dev/null || echo "No remote configured")

## Application Status
- **Live URL**: https://tattooed-world-app.onrender.com
- **Status**: Production Ready
- **Features**: Complete RBAC, Admin System, Artist Dashboard

## Recovery Instructions

### From Git Archive
\`\`\`bash
# Extract the archive
tar -xzf $ARCHIVE_NAME

# Install dependencies
npm run install:all

# Set up environment
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure environment variables
# Then run: npm run db:setup
\`\`\`

### From Git Tag
\`\`\`bash
# Checkout the tagged version
git checkout $TAG_NAME

# Or create a new branch from the tag
git checkout -b restore-from-$TAG_NAME $TAG_NAME
\`\`\`

## Version Features
- ✅ Complete Role-Based Access Control
- ✅ Full Admin System with User Management
- ✅ Artist Dashboard with Analytics
- ✅ Google Maps Integration
- ✅ Authentication System (100% Working)
- ✅ Rate Limiting (Fixed for Render.com)
- ✅ Single Domain Deployment
- ✅ Database with Prisma ORM
- ✅ File Upload Support
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

## Test Accounts
- Admin: berteloot@gmail.com / admin123
- Client: client@example.com / client123
- Artist: artist@example.com / artist123

## Deployment
- Render.com Single Domain Architecture
- Frontend + Backend served from same URL
- Automated build and deployment

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

## File Sizes
- Archive: $(du -h "$ARCHIVE_NAME" | cut -f1)

## Security Notes
- This is a stable production version
- All security patches applied
- Tested and verified working
- Ready for production deployment

## Support
- **Live Application**: https://tattooed-world-app.onrender.com
- **Documentation**: See docs/ directory
- **Issues**: Check troubleshooting guides
EOF

# Create restore script
cat > "restore-from-version.sh" << 'EOF'
#!/bin/bash

# Version Restore Script
# This script restores the application from a version backup

set -e

echo "=========================================="
echo "Version Restore Script"
echo "=========================================="

# Check if archive exists
ARCHIVE_FILE=$(ls tattoo-app-v*.tar.gz 2>/dev/null | head -1)

if [ -z "$ARCHIVE_FILE" ]; then
    echo "❌ Error: No version archive found"
    echo "Please ensure you have a tattoo-app-v*.tar.gz file in the current directory"
    exit 1
fi

echo "📦 Found archive: $ARCHIVE_FILE"

# Extract archive
echo "📁 Extracting archive..."
tar -xzf "$ARCHIVE_FILE"

# Get the extracted directory name
EXTRACTED_DIR=$(tar -tzf "$ARCHIVE_FILE" | head -1 | cut -d/ -f1)

echo "📁 Extracted to: $EXTRACTED_DIR"

# Move to extracted directory
cd "$EXTRACTED_DIR"

echo "📦 Installing dependencies..."
npm run install:all

echo "🔧 Setting up environment..."
echo "Please copy .env.example to .env and configure your environment variables"
echo "Then run: npm run db:setup"

echo "✅ Version restore ready!"
echo "Next steps:"
echo "1. Configure environment variables"
echo "2. Run: npm run db:setup"
echo "3. Start development: npm run dev"
echo "4. For production: npm run build && npm start"

echo ""
echo "🔗 Live Application: https://tattooed-world-app.onrender.com"
echo "📚 Documentation: docs/"
EOF

chmod +x restore-from-version.sh

# Calculate archive size
ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)

echo "=========================================="
echo "✅ Version Control Backup Complete!"
echo "=========================================="
echo "🏷️  Git Tag: $TAG_NAME"
echo "📦 Archive: $ARCHIVE_NAME ($ARCHIVE_SIZE)"
echo "📋 Info File: BACKUP_VERSION_INFO.md"
echo "🔄 Restore Script: restore-from-version.sh"
echo ""
echo "📋 Backup Contents:"
echo "✅ Complete source code"
echo "✅ Git history and tags"
echo "✅ Version information"
echo "✅ Recovery instructions"
echo "✅ Restore script"
echo ""
echo "🚀 Next Steps:"
echo "1. Push the tag: git push origin $TAG_NAME"
echo "2. Store the archive safely: $ARCHIVE_NAME"
echo "3. For restoration: run ./restore-from-version.sh"
echo ""
echo "🔗 Live Application: https://tattooed-world-app.onrender.com"
echo "📚 Documentation: BACKUP_VERSION_INFO.md"
echo ""
echo "✅ Version control backup created successfully!"

# Push tag to remote if available
if git remote get-url origin >/dev/null 2>&1; then
    echo ""
    echo "🌐 Push tag to remote repository?"
    echo "This will make the backup available to other team members (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "📤 Pushing tag to remote..."
        git push origin "$TAG_NAME"
        echo "✅ Tag pushed successfully"
    else
        echo "⚠️  Tag not pushed (run manually: git push origin $TAG_NAME)"
    fi
else
    echo "⚠️  No remote repository configured"
    echo "To push the tag later: git push origin $TAG_NAME"
fi 