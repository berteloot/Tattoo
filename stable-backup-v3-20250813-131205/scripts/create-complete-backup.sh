#!/bin/bash

# Master Backup Script for Tattoo Artist Locator
# This script creates a complete backup strategy including:
# 1. Full application backup
# 2. Database backup
# 3. Version control backup

set -e

echo "=========================================="
echo "Tattoo Artist Locator - Complete Backup Strategy"
echo "=========================================="

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_SESSION="complete-backup-${TIMESTAMP}"

echo "🕐 Backup Session: $BACKUP_SESSION"
echo "📅 Date: $(date +"%Y-%m-%d %H:%M:%S")"
echo ""

# Create backup session directory
mkdir -p "$BACKUP_SESSION"
cd "$BACKUP_SESSION"

echo "📁 Creating backup session directory: $BACKUP_SESSION"
echo ""

# 1. Full Application Backup
echo "=========================================="
echo "1️⃣  Creating Full Application Backup"
echo "=========================================="
cd ..
./backup-stable-version.sh
echo ""

# 2. Database Backup
echo "=========================================="
echo "2️⃣  Creating Database Backup"
echo "=========================================="
./backup-database-only.sh
echo ""

# 3. Version Control Backup
echo "=========================================="
echo "3️⃣  Creating Version Control Backup"
echo "=========================================="
./backup-version-control.sh
echo ""

# Move all backups to session directory
echo "=========================================="
echo "📦 Organizing Backup Files"
echo "=========================================="

# Move application backup
if [ -d "backup-stable-v1.0.0-"* ]; then
    mv backup-stable-v1.0.0-* "$BACKUP_SESSION/"
    echo "✅ Application backup moved"
fi

# Move database backup
if [ -d "database-backup-"* ]; then
    mv database-backup-* "$BACKUP_SESSION/"
    echo "✅ Database backup moved"
fi

# Move version control files
if [ -f "tattoo-app-v1.0.0-"*.tar.gz ]; then
    mv tattoo-app-v1.0.0-*.tar.gz "$BACKUP_SESSION/"
    echo "✅ Version control archive moved"
fi

if [ -f "BACKUP_VERSION_INFO.md" ]; then
    mv BACKUP_VERSION_INFO.md "$BACKUP_SESSION/"
    echo "✅ Version info moved"
fi

if [ -f "restore-from-version.sh" ]; then
    mv restore-from-version.sh "$BACKUP_SESSION/"
    echo "✅ Version restore script moved"
fi

cd "$BACKUP_SESSION"

# Create comprehensive backup summary
cat > "BACKUP_SUMMARY.md" << EOF
# Complete Backup Summary - Tattoo Artist Locator

## Backup Session Information
- **Session ID**: $BACKUP_SESSION
- **Date**: $(date +"%Y-%m-%d %H:%M:%S")
- **Version**: 1.0.0
- **Status**: Production Ready

## Backup Types Created

### 1. Full Application Backup
- **Purpose**: Complete application code and configuration
- **Contents**: Frontend, Backend, Documentation, Scripts
- **Recovery**: Extract and run restore-backup.sh
- **Use Case**: Complete system restoration

### 2. Database Backup
- **Purpose**: Database schema and data
- **Contents**: Schema, Data, Prisma files, Migrations
- **Recovery**: Run restore-database.sh
- **Use Case**: Data recovery and migration

### 3. Version Control Backup
- **Purpose**: Git repository with version tags
- **Contents**: Source code, Git history, Version tags
- **Recovery**: Extract archive or checkout tag
- **Use Case**: Code versioning and rollback

## Application Status
- **Live URL**: https://tattooed-world-backend.onrender.com
- **Features**: Complete RBAC, Admin System, Artist Dashboard
- **Security**: JWT Auth, Rate Limiting, Input Validation
- **Database**: PostgreSQL with Prisma ORM

## Recovery Instructions

### Complete System Recovery
1. Extract application backup
2. Restore database from backup
3. Configure environment variables
4. Run: npm run db:setup
5. Start: npm run dev

### Database Only Recovery
1. Use database backup directory
2. Run: ./restore-database.sh
3. Follow prompts for restoration

### Version Rollback
1. Use version control backup
2. Extract archive or checkout tag
3. Install dependencies and configure

## Test Accounts
- **Admin**: berteloot@gmail.com / admin123
- **Client**: client@example.com / client123
- **Artist**: artist@example.com / artist123

## Security Notes
- All backups contain sensitive data
- Store securely and limit access
- Test recovery procedures regularly
- Keep multiple backup copies

## File Structure
\`\`\`
$BACKUP_SESSION/
├── backup-stable-v1.0.0-*/     # Full application backup
├── database-backup-*/          # Database backup
├── tattoo-app-v1.0.0-*.tar.gz # Version control archive
├── BACKUP_VERSION_INFO.md      # Version information
├── restore-from-version.sh     # Version restore script
└── BACKUP_SUMMARY.md          # This file
\`\`\`

## Support
- **Live Application**: https://tattooed-world-backend.onrender.com
- **Documentation**: See individual backup directories
- **Issues**: Check troubleshooting guides in backup files

---
**Backup Session**: $BACKUP_SESSION  
**Created**: $(date +"%Y-%m-%d %H:%M:%S")  
**Status**: Complete ✅
EOF

# Create master restore script
cat > "restore-complete-system.sh" << 'EOF'
#!/bin/bash

# Complete System Restore Script
# This script restores the entire system from all backup types

set -e

echo "=========================================="
echo "Complete System Restore - Tattoo Artist Locator"
echo "=========================================="

# Check if we're in the backup session directory
if [ ! -f "BACKUP_SUMMARY.md" ]; then
    echo "❌ Error: Please run this script from the backup session directory"
    exit 1
fi

echo "🔍 Available backup types:"

# Check for application backup
if [ -d "backup-stable-v1.0.0-"* ]; then
    echo "✅ Full application backup found"
    APP_BACKUP_DIR=$(ls -d backup-stable-v1.0.0-* | head -1)
else
    echo "❌ Full application backup not found"
fi

# Check for database backup
if [ -d "database-backup-"* ]; then
    echo "✅ Database backup found"
    DB_BACKUP_DIR=$(ls -d database-backup-* | head -1)
else
    echo "❌ Database backup not found"
fi

# Check for version control backup
if [ -f "tattoo-app-v1.0.0-"*.tar.gz ]; then
    echo "✅ Version control backup found"
    VERSION_ARCHIVE=$(ls tattoo-app-v1.0.0-*.tar.gz | head -1)
else
    echo "❌ Version control backup not found"
fi

echo ""
echo "🔄 Choose restore type:"
echo "1. Complete system restore (recommended)"
echo "2. Application only"
echo "3. Database only"
echo "4. Version control only"
echo "5. Exit"

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo "🚀 Starting complete system restore..."
        
        if [ -z "$APP_BACKUP_DIR" ]; then
            echo "❌ Application backup not found"
            exit 1
        fi
        
        if [ -z "$DB_BACKUP_DIR" ]; then
            echo "❌ Database backup not found"
            exit 1
        fi
        
        # Restore application
        echo "📦 Restoring application..."
        cp -r "$APP_BACKUP_DIR" ../restored-app/
        cd ../restored-app/
        
        # Restore database
        echo "📊 Restoring database..."
        cd "$DB_BACKUP_DIR"
        ./restore-database.sh
        
        echo "✅ Complete system restore finished!"
        echo "Next steps:"
        echo "1. Configure environment variables"
        echo "2. Start application: npm run dev"
        ;;
    2)
        if [ -z "$APP_BACKUP_DIR" ]; then
            echo "❌ Application backup not found"
            exit 1
        fi
        
        echo "📦 Restoring application only..."
        cp -r "$APP_BACKUP_DIR" ../restored-app/
        cd ../restored-app/
        ./restore-backup.sh
        ;;
    3)
        if [ -z "$DB_BACKUP_DIR" ]; then
            echo "❌ Database backup not found"
            exit 1
        fi
        
        echo "📊 Restoring database only..."
        cd "$DB_BACKUP_DIR"
        ./restore-database.sh
        ;;
    4)
        if [ -z "$VERSION_ARCHIVE" ]; then
            echo "❌ Version control backup not found"
            exit 1
        fi
        
        echo "🏷️  Restoring version control only..."
        ./restore-from-version.sh
        ;;
    5)
        echo "❌ Restore cancelled"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
EOF

chmod +x restore-complete-system.sh

# Calculate total backup size
TOTAL_SIZE=$(du -sh . | cut -f1)

echo "=========================================="
echo "✅ Complete Backup Strategy Finished!"
echo "=========================================="
echo "📁 Backup Session: $BACKUP_SESSION"
echo "💾 Total Size: $TOTAL_SIZE"
echo ""
echo "📋 Backup Contents:"
echo "✅ Full application backup (code + config)"
echo "✅ Database backup (schema + data)"
echo "✅ Version control backup (Git + tags)"
echo "✅ Recovery scripts and documentation"
echo "✅ Master restore script"
echo ""
echo "🚀 Recovery Options:"
echo "1. Complete system: ./restore-complete-system.sh"
echo "2. Application only: Use backup-stable-v1.0.0-* directory"
echo "3. Database only: Use database-backup-* directory"
echo "4. Version only: Use tattoo-app-v1.0.0-*.tar.gz"
echo ""
echo "🔗 Live Application: https://tattooed-world-backend.onrender.com"
echo "📚 Documentation: BACKUP_SUMMARY.md"
echo ""
echo "✅ Stable backup version v1.0.0 created successfully!"
echo "🛡️  Your application is now fully backed up and safe!" 