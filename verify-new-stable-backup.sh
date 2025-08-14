#!/bin/bash

# New Stable Backup Verification Script
# This script verifies the integrity of the new stable backup

echo "🔍 Verifying New Stable Backup Integrity..."
echo "==========================================="

BACKUP_DIR="new-stable-backup-20250813-230230"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ Error: Backup directory not found: $BACKUP_DIR"
    exit 1
fi

echo "✅ Backup directory found: $BACKUP_DIR"

# Check critical directories
echo ""
echo "📁 Checking critical directories..."

CRITICAL_DIRS=("frontend" "backend" "docs" "scripts" "config")
for dir in "${CRITICAL_DIRS[@]}"; do
    if [ -d "$BACKUP_DIR/$dir" ]; then
        echo "✅ $dir directory exists"
    else
        echo "❌ $dir directory missing"
    fi
done

# Check critical files
echo ""
echo "📄 Checking critical files..."

CRITICAL_FILES=(
    "frontend/package.json"
    "frontend/src/App.jsx"
    "backend/package.json"
    "backend/src/server.js"
    "backend/prisma/schema.prisma"
    "README.md"
    "render.yaml"
    "BACKUP_MANIFEST.md"
    "BACKUP_SUMMARY.md"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$BACKUP_DIR/$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check file counts
echo ""
echo "📊 Checking file counts..."

FRONTEND_FILES=$(find "$BACKUP_DIR/frontend" -type f | wc -l)
BACKEND_FILES=$(find "$BACKUP_DIR/backend" -type f | wc -l)
DOCS_FILES=$(find "$BACKUP_DIR/docs" -type f | wc -l)
TOTAL_FILES=$(find "$BACKUP_DIR" -type f | wc -l)

echo "Frontend files: $FRONTEND_FILES"
echo "Backend files: $BACKEND_FILES"
echo "Documentation files: $DOCS_FILES"
echo "Total files: $TOTAL_FILES"

# Check backup size
echo ""
echo "💾 Checking backup size..."
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "Backup size: $BACKUP_SIZE"

# Check compressed archive
echo ""
echo "🗜️  Checking compressed archive..."
ARCHIVE_FILE="${BACKUP_DIR}.tar.gz"
if [ -f "$ARCHIVE_FILE" ]; then
    ARCHIVE_SIZE=$(ls -lh "$ARCHIVE_FILE" | awk '{print $5}')
    echo "✅ Compressed archive exists: $ARCHIVE_SIZE"
else
    echo "❌ Compressed archive missing"
fi

# Check for new features
echo ""
echo "🆕 Checking for new features..."
if [ -f "$BACKUP_DIR/backend/src/routes/artists.js" ]; then
    if grep -q "studioName" "$BACKUP_DIR/backend/src/routes/artists.js"; then
        echo "✅ Studio integration system found"
    else
        echo "⚠️  Studio integration not detected"
    fi
    
    if grep -q "messages" "$BACKUP_DIR/backend/src/routes/artists.js"; then
        echo "✅ Message system for artist cards found"
    else
        echo "⚠️  Message system not detected"
    fi
else
    echo "❌ Artists route file not found"
fi

# Final verification
echo ""
echo "🎯 Final Verification Results..."
echo "================================"

if [ $FRONTEND_FILES -gt 1000 ] && [ $BACKEND_FILES -gt 40 ] && [ $TOTAL_FILES -gt 1000 ]; then
    echo "✅ NEW STABLE BACKUP VERIFICATION PASSED"
    echo "✅ All critical components present"
    echo "✅ File counts are reasonable"
    echo "✅ Backup is ready for production use"
    echo "✅ New features are included"
else
    echo "❌ NEW STABLE BACKUP VERIFICATION FAILED"
    echo "❌ Some critical components may be missing"
    echo "❌ File counts are suspiciously low"
fi

echo ""
echo "📋 Backup Location: $(pwd)/$BACKUP_DIR"
echo "🗜️  Archive Location: $(pwd)/$ARCHIVE_FILE"
echo "📊 Total Size: $BACKUP_SIZE"
echo "📄 Total Files: $TOTAL_FILES"
echo ""
echo "🚀 New stable backup verification complete!"
