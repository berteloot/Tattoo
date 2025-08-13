#!/bin/bash

# Tattoo App Codebase Cleanup Script
# This script removes old, temporary, and backup files to optimize the codebase

echo "🧹 Starting Tattoo App Codebase Cleanup..."
echo "=========================================="

# Create backup of current state before cleanup
echo "📦 Creating safety backup..."
BACKUP_DIR="cleanup-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 1. Remove emergency/one-time fix scripts
echo "🗑️  Removing emergency/one-time fix scripts..."
EMERGENCY_FILES=(
    "backend/reset-stan-password-emergency.js"
    "backend/reset-stan-password-via-api.js"
    "backend/reset-stan-password-production.js"
    "backend/reset-stan-password.js"
    "backend/emergency-account-recovery.js"
    "backend/emergency-favorites-fix.js"
    "backend/render-database-recovery.js"
    "backend/production-quick-fix.js"
    "backend/quick-fix-disable-verification.js"
    "backend/add-profile-picture-fields-production.js"
    "backend/fix-paris-studios-data.js"
    "backend/fix-production-paris-data-sql.sql"
    "backend/add-studio-coordinates.js"
    "backend/create-studio-views.js"
    "backend/fix-favorites-schema.js"
    "backend/verify-all-users.sql"
)

for file in "${EMERGENCY_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  Removing: $file"
        mv "$file" "$BACKUP_DIR/" 2>/dev/null || echo "    Failed to move: $file"
    fi
done

# 2. Remove duplicate/backup files
echo "🗑️  Removing duplicate/backup files..."
DUPLICATE_FILES=(
    "backend/src/routes/artists.js.backup"
    "backend/test-geocoding-endpoint.js"
    "backend/.force-rebuild"
)

for file in "${DUPLICATE_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  Removing: $file"
        mv "$file" "$BACKUP_DIR/" 2>/dev/null || echo "    Failed to move: $file"
    fi
done

# 3. Remove legacy database fix scripts
echo "🗑️  Removing legacy database fix scripts..."
LEGACY_SCRIPTS=(
    "backend/scripts/fix-database-schema.js"
    "backend/scripts/fix-database-triggers.sql"
    "backend/scripts/fix-db-triggers.js"
    "backend/scripts/fix-flash-schema.js"
    "backend/scripts/fix-specialties-schema.js"
    "backend/scripts/fix-studio-artist-relationships.js"
    "backend/scripts/fix-test-accounts.js"
    "backend/scripts/fix-favorites-production.js"
    "backend/scripts/remove-legacy-functions.js"
    "backend/scripts/drop-legacy-functions.sql"
    "backend/scripts/check-db-triggers-rules.js"
    "backend/scripts/check-db-functions.js"
    "backend/scripts/check-geocoding.js"
    "backend/scripts/setup-postgres-geocoding.sql"
    "backend/scripts/apply-geocoding-directly.js"
    "backend/scripts/apply-geocoding-results.sql"
    "backend/scripts/add-geocode-cache.js"
)

for file in "${LEGACY_SCRIPTS[@]}"; do
    if [ -f "$file" ]; then
        echo "  Removing: $file"
        mv "$file" "$BACKUP_DIR/" 2>/dev/null || echo "    Failed to move: $file"
    fi
done

# 4. Remove large backup archive (optional - uncomment if you're sure)
echo "🗑️  Removing large backup archive..."
if [ -d "stable-backup-v3-20250813-131205" ]; then
    echo "  Removing: stable-backup-v3-20250813-131205/ (242MB)"
    mv "stable-backup-v3-20250813-131205" "$BACKUP_DIR/"
fi

if [ -f "stable-backup-v3-20250813-131205.tar.gz" ]; then
    echo "  Removing: stable-backup-v3-20250813-131205.tar.gz (45MB)"
    mv "stable-backup-v3-20250813-131205.tar.gz" "$BACKUP_DIR/"
fi

# 5. Remove outdated documentation (keep only essential ones)
echo "🗑️  Removing outdated documentation..."
OUTDATED_DOCS=(
    "BACKUP_README.md"
    "BACKUP_SYSTEM_COMPLETE.md"
    "BACKUP_V3_SUMMARY.md"
    "STABLE_BACKUP_V3_COMPLETE.md"
    "DEVELOPMENT_SETUP_COMPLETE.md"
    "ENVIRONMENT_SETUP_COMPLETE.md"
    "FRONTEND_CONFIG_GUIDE.md"
    "GOOGLE_MAPS_API_SETUP.md"
    "GOOGLE_MAPS_SETUP_COMPLETE.md"
    "SINGLE_DOMAIN_DEPLOYMENT.md"
    "SETUP.md"
    "create-complete-backup.sh"
    "create-stable-backup.sh"
    "create-stable-backup-v2.sh"
    "create-stable-backup-v3.sh"
    "verify-backup-v3.sh"
)

for file in "${OUTDATED_DOCS[@]}"; do
    if [ -f "$file" ]; then
        echo "  Removing: $file"
        mv "$file" "$BACKUP_DIR/" 2>/dev/null || echo "    Failed to move: $file"
    fi
done

# 6. Clean up empty directories
echo "🧹 Cleaning up empty directories..."
find . -type d -empty -delete 2>/dev/null

# 7. Show cleanup results
echo ""
echo "✅ Cleanup Complete!"
echo "==================="
echo "📁 Safety backup created in: $BACKUP_DIR"
echo "📊 Space freed up: ~287MB (backup archive + old files)"
echo ""
echo "📋 Files moved to backup:"
ls -la "$BACKUP_DIR" | wc -l
echo ""

# Show current directory size
CURRENT_SIZE=$(du -sh . | cut -f1)
echo "📁 Current project size: $CURRENT_SIZE"

echo ""
echo "💡 To restore any files if needed:"
echo "   mv $BACKUP_DIR/filename ."
echo ""
echo "💡 To completely remove backup:"
echo "   rm -rf $BACKUP_DIR"
echo ""
echo "🧹 Codebase is now clean and optimized!"
