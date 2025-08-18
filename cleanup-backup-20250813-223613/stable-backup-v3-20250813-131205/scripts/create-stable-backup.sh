#!/bin/bash

# Tattoo App - Comprehensive Backup Script
# Creates multiple backup layers for maximum safety
# Usage: ./create-stable-backup.sh

set -e  # Exit on any error

# Configuration
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PROJECT_NAME="tattoo-app"
BACKUP_DIR="$HOME/Documents/Tattoo_Backups"
CURRENT_DIR="/Users/stanislasberteloot/Documents/Tattoo"

echo "🔄 Starting comprehensive backup process..."
echo "📅 Timestamp: $TIMESTAMP"
echo "📁 Source: $CURRENT_DIR"
echo "💾 Backup Directory: $BACKUP_DIR"

# Create backup directory structure
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/git-backups"
mkdir -p "$BACKUP_DIR/full-backups"
mkdir -p "$BACKUP_DIR/database-backups"

# 1. Create Git Tag for Current Stable Version
echo "🏷️  Creating git tag for stable version..."
cd "$CURRENT_DIR"
git tag -a "stable-backup-$TIMESTAMP" -m "Stable backup created on $(date)"
git push origin "stable-backup-$TIMESTAMP" || echo "⚠️  Warning: Could not push tag to origin (offline?)"

# 2. Create Git Bundle Backup (Complete Repository)
echo "📦 Creating git bundle backup..."
git bundle create "$BACKUP_DIR/git-backups/${PROJECT_NAME}-${TIMESTAMP}.bundle" --all
echo "✅ Git bundle created: ${PROJECT_NAME}-${TIMESTAMP}.bundle"

# 3. Create Full Project Archive
echo "🗜️  Creating full project archive..."
cd "$HOME/Documents"
tar -czf "$BACKUP_DIR/full-backups/${PROJECT_NAME}-full-${TIMESTAMP}.tar.gz" \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="*.log" \
    --exclude="dist" \
    --exclude="build" \
    "Tattoo"
echo "✅ Full archive created: ${PROJECT_NAME}-full-${TIMESTAMP}.tar.gz"

# 4. Create Source Code Only Backup
echo "📄 Creating source code backup..."
tar -czf "$BACKUP_DIR/full-backups/${PROJECT_NAME}-source-${TIMESTAMP}.tar.gz" \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="*.log" \
    --exclude="dist" \
    --exclude="build" \
    --exclude="package-lock.json" \
    "Tattoo"
echo "✅ Source code archive created: ${PROJECT_NAME}-source-${TIMESTAMP}.tar.gz"

# 5. Create Database Schema Backup
echo "🗄️  Creating database schema backup..."
cd "$CURRENT_DIR"
mkdir -p "$BACKUP_DIR/database-backups/$TIMESTAMP"

# Copy Prisma schema and migrations
cp -r backend/prisma/schema.prisma "$BACKUP_DIR/database-backups/$TIMESTAMP/"
cp -r backend/prisma/migrations "$BACKUP_DIR/database-backups/$TIMESTAMP/"
cp backend/prisma/seed.js "$BACKUP_DIR/database-backups/$TIMESTAMP/" 2>/dev/null || echo "No seed file found"

# Copy database scripts
cp -r backend/scripts "$BACKUP_DIR/database-backups/$TIMESTAMP/" 2>/dev/null || echo "No scripts directory found"

echo "✅ Database schema backup created"

# 6. Create Environment Templates Backup
echo "🔧 Creating environment templates backup..."
find . -name "*.env.example" -o -name ".env.template" | while read file; do
    cp "$file" "$BACKUP_DIR/database-backups/$TIMESTAMP/"
done
echo "✅ Environment templates backed up"

# 7. Create Documentation Backup
echo "📚 Creating documentation backup..."
mkdir -p "$BACKUP_DIR/database-backups/$TIMESTAMP/docs"
cp *.md "$BACKUP_DIR/database-backups/$TIMESTAMP/docs/" 2>/dev/null || echo "No markdown files in root"
cp -r docs "$BACKUP_DIR/database-backups/$TIMESTAMP/" 2>/dev/null || echo "No docs directory found"
echo "✅ Documentation backed up"

# 8. Create Package.json Backup (Dependencies)
echo "📋 Creating dependencies backup..."
find . -name "package.json" | while read file; do
    cp "$file" "$BACKUP_DIR/database-backups/$TIMESTAMP/$(basename $(dirname $file))-package.json"
done
echo "✅ Dependencies backed up"

# 9. Generate Backup Manifest
echo "📝 Creating backup manifest..."
cat > "$BACKUP_DIR/backup-manifest-$TIMESTAMP.txt" << EOF
# Tattoo App Backup Manifest
# Created: $(date)
# Git Commit: $(git rev-parse HEAD)
# Git Branch: $(git branch --show-current)

## Backup Contents:
1. Git Bundle: git-backups/${PROJECT_NAME}-${TIMESTAMP}.bundle
2. Full Archive: full-backups/${PROJECT_NAME}-full-${TIMESTAMP}.tar.gz
3. Source Only: full-backups/${PROJECT_NAME}-source-${TIMESTAMP}.tar.gz
4. Database Schema: database-backups/$TIMESTAMP/
5. Git Tag: stable-backup-$TIMESTAMP

## File Sizes:
$(du -sh "$BACKUP_DIR/git-backups/${PROJECT_NAME}-${TIMESTAMP}.bundle" 2>/dev/null || echo "Bundle: N/A")
$(du -sh "$BACKUP_DIR/full-backups/${PROJECT_NAME}-full-${TIMESTAMP}.tar.gz" 2>/dev/null || echo "Full: N/A")
$(du -sh "$BACKUP_DIR/full-backups/${PROJECT_NAME}-source-${TIMESTAMP}.tar.gz" 2>/dev/null || echo "Source: N/A")
$(du -sh "$BACKUP_DIR/database-backups/$TIMESTAMP" 2>/dev/null || echo "DB: N/A")

## Recovery Instructions:
1. Git Bundle: git clone ${PROJECT_NAME}-${TIMESTAMP}.bundle restored-project
2. Full Archive: tar -xzf ${PROJECT_NAME}-full-${TIMESTAMP}.tar.gz
3. Database: Use Prisma schema and migrations from database-backups/$TIMESTAMP/

## Recent Commits:
$(git log --oneline -5)

## Project Structure at Backup Time:
$(find . -type f -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" | grep -v node_modules | head -20)
EOF

# 10. Create Quick Recovery Script
cat > "$BACKUP_DIR/restore-backup-$TIMESTAMP.sh" << 'EOF'
#!/bin/bash
# Quick Recovery Script for Tattoo App Backup

BACKUP_TIMESTAMP="TIMESTAMP_PLACEHOLDER"
BACKUP_DIR="$HOME/Documents/Tattoo_Backups"
RESTORE_DIR="$HOME/Documents/Tattoo_Restored_$BACKUP_TIMESTAMP"

echo "🔄 Starting restoration process..."

# Method 1: Restore from Git Bundle (Recommended)
if [ -f "$BACKUP_DIR/git-backups/tattoo-app-$BACKUP_TIMESTAMP.bundle" ]; then
    echo "📦 Restoring from git bundle..."
    git clone "$BACKUP_DIR/git-backups/tattoo-app-$BACKUP_TIMESTAMP.bundle" "$RESTORE_DIR"
    cd "$RESTORE_DIR"
    echo "✅ Git repository restored"
fi

# Method 2: Restore from Full Archive (Alternative)
if [ ! -d "$RESTORE_DIR" ] && [ -f "$BACKUP_DIR/full-backups/tattoo-app-full-$BACKUP_TIMESTAMP.tar.gz" ]; then
    echo "🗜️  Restoring from full archive..."
    mkdir -p "$RESTORE_DIR"
    tar -xzf "$BACKUP_DIR/full-backups/tattoo-app-full-$BACKUP_TIMESTAMP.tar.gz" -C "$HOME/Documents/"
    mv "$HOME/Documents/Tattoo" "$RESTORE_DIR"
    echo "✅ Full archive restored"
fi

echo "🎉 Restoration complete! Project restored to: $RESTORE_DIR"
echo "💡 Next steps:"
echo "1. cd $RESTORE_DIR"
echo "2. npm install (in both frontend and backend directories)"
echo "3. Set up .env files using templates from database-backups/$BACKUP_TIMESTAMP/"
echo "4. Run database migrations if needed"
EOF

# Replace placeholder in restore script
sed -i '' "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/g" "$BACKUP_DIR/restore-backup-$TIMESTAMP.sh"
chmod +x "$BACKUP_DIR/restore-backup-$TIMESTAMP.sh"

# Final Summary
echo ""
echo "🎉 BACKUP COMPLETE!"
echo "═══════════════════════════════════════════════════════════"
echo "📁 Backup Location: $BACKUP_DIR"
echo "🏷️  Git Tag: stable-backup-$TIMESTAMP"
echo "📝 Manifest: backup-manifest-$TIMESTAMP.txt"
echo "🔄 Restore Script: restore-backup-$TIMESTAMP.sh"
echo ""
echo "📊 Backup Summary:"
echo "$(ls -la "$BACKUP_DIR" | tail -n +2)"
echo ""
echo "💡 To restore this backup later:"
echo "   bash $BACKUP_DIR/restore-backup-$TIMESTAMP.sh"
echo ""
echo "✅ Your stable version is now safely backed up!"
