#!/bin/bash

# Database Backup Script for Tattoo Artist Locator
# This script creates a complete database backup with schema and data

set -e

echo "=========================================="
echo "Database Backup - Tattoo Artist Locator"
echo "=========================================="

# Configuration
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="database-backup-${TIMESTAMP}"
SCHEMA_FILE="schema-${TIMESTAMP}.sql"
DATA_FILE="data-${TIMESTAMP}.sql"
FULL_BACKUP_FILE="full-database-backup-${TIMESTAMP}.sql"

# Create backup directory
mkdir -p "$BACKUP_DIR"
cd "$BACKUP_DIR"

echo "📁 Creating backup directory: $BACKUP_DIR"

# Load environment variables
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
elif [ -f "../backend/.env" ]; then
    export $(cat ../backend/.env | grep -v '^#' | xargs)
else
    echo "❌ Error: No .env file found"
    echo "Please ensure you have a .env file with DATABASE_URL configured"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in environment"
    exit 1
fi

echo "🔍 Database URL found: ${DATABASE_URL:0:20}..."

# Extract database connection info
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')

echo "📊 Database Info:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"

# Test database connection
echo "🔍 Testing database connection..."
if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; then
    echo "❌ Error: Cannot connect to database"
    exit 1
fi

echo "✅ Database connection successful"

# Create schema backup (structure only)
echo "📋 Creating schema backup..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --schema-only --no-owner --no-privileges > "$SCHEMA_FILE"

# Create data backup (data only)
echo "📊 Creating data backup..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --data-only --no-owner --no-privileges > "$DATA_FILE"

# Create full backup (schema + data)
echo "📦 Creating full backup..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --no-owner --no-privileges > "$FULL_BACKUP_FILE"

# Create Prisma schema backup
echo "🔧 Creating Prisma schema backup..."
if [ -f "../backend/prisma/schema.prisma" ]; then
    cp ../backend/prisma/schema.prisma ./prisma-schema.prisma
    echo "✅ Prisma schema backed up"
else
    echo "⚠️  Prisma schema not found"
fi

# Create migration files backup
echo "📁 Creating migrations backup..."
if [ -d "../backend/prisma/migrations" ]; then
    cp -r ../backend/prisma/migrations ./migrations/
    echo "✅ Migrations backed up"
else
    echo "⚠️  Migrations directory not found"
fi

# Create backup info file
cat > BACKUP_INFO.md << EOF
# Database Backup Information

## Backup Details
- **Date**: $(date +"%Y-%m-%d %H:%M:%S")
- **Database**: $DB_NAME
- **Host**: $DB_HOST:$DB_PORT
- **User**: $DB_USER

## Files Created
- **Schema**: $SCHEMA_FILE (database structure only)
- **Data**: $DATA_FILE (data only)
- **Full Backup**: $FULL_BACKUP_FILE (complete database)
- **Prisma Schema**: prisma-schema.prisma
- **Migrations**: migrations/ (all migration files)

## Database Tables
- users
- artist_profiles
- specialties
- services
- flash
- reviews
- admin_actions
- favorites

## Recovery Instructions

### Full Database Restore
\`\`\`bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $FULL_BACKUP_FILE
\`\`\`

### Schema Only Restore
\`\`\`bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $SCHEMA_FILE
\`\`\`

### Data Only Restore
\`\`\`bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $DATA_FILE
\`\`\`

### Prisma Migration Restore
\`\`\`bash
# Copy migrations back to backend/prisma/migrations/
# Run: npx prisma migrate deploy
\`\`\`

## File Sizes
- Schema: $(du -h "$SCHEMA_FILE" | cut -f1)
- Data: $(du -h "$DATA_FILE" | cut -f1)
- Full Backup: $(du -h "$FULL_BACKUP_FILE" | cut -f1)

## Security Notes
- Backup files contain sensitive data
- Store securely and limit access
- Consider encryption for production backups
- Test restore procedures regularly

## Application Info
- **Live URL**: https://tattooed-world-app.onrender.com
- **Version**: 1.0.0
- **Status**: Production Ready
EOF

# Create restore script
cat > restore-database.sh << 'EOF'
#!/bin/bash

# Database Restore Script
# This script restores the database from backup

set -e

echo "=========================================="
echo "Database Restore Script"
echo "=========================================="

# Check if we're in the backup directory
if [ ! -f "BACKUP_INFO.md" ]; then
    echo "❌ Error: Please run this script from the backup directory"
    exit 1
fi

# Load environment variables
if [ -f "../.env" ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
elif [ -f "../backend/.env" ]; then
    export $(cat ../backend/.env | grep -v '^#' | xargs)
else
    echo "❌ Error: No .env file found"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not found in environment"
    exit 1
fi

# Extract database connection info
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\).*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')

echo "🔍 Database Info:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"

echo ""
echo "⚠️  WARNING: This will overwrite the existing database!"
echo "Are you sure you want to continue? (y/N)"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Find the full backup file
FULL_BACKUP_FILE=$(ls full-database-backup-*.sql 2>/dev/null | head -1)

if [ -z "$FULL_BACKUP_FILE" ]; then
    echo "❌ Error: No full backup file found"
    exit 1
fi

echo "📦 Restoring from: $FULL_BACKUP_FILE"

# Drop and recreate database
echo "🗑️  Dropping existing database..."
dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME || true

echo "🆕 Creating new database..."
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME

echo "📥 Restoring database..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < "$FULL_BACKUP_FILE"

echo "✅ Database restore complete!"

# Restore Prisma schema if available
if [ -f "prisma-schema.prisma" ]; then
    echo "🔧 Restoring Prisma schema..."
    cp prisma-schema.prisma ../backend/prisma/schema.prisma
    echo "✅ Prisma schema restored"
fi

# Restore migrations if available
if [ -d "migrations" ]; then
    echo "📁 Restoring migrations..."
    cp -r migrations/* ../backend/prisma/migrations/
    echo "✅ Migrations restored"
fi

echo ""
echo "🚀 Next steps:"
echo "1. Run: cd ../backend && npx prisma generate"
echo "2. Run: npx prisma migrate deploy"
echo "3. Start the application: npm run dev"
EOF

chmod +x restore-database.sh

# Calculate file sizes
SCHEMA_SIZE=$(du -h "$SCHEMA_FILE" | cut -f1)
DATA_SIZE=$(du -h "$DATA_FILE" | cut -f1)
FULL_SIZE=$(du -h "$FULL_BACKUP_FILE" | cut -f1)

echo "=========================================="
echo "✅ Database Backup Complete!"
echo "=========================================="
echo "📁 Backup Directory: $BACKUP_DIR"
echo "📋 Schema Backup: $SCHEMA_FILE ($SCHEMA_SIZE)"
echo "📊 Data Backup: $DATA_FILE ($DATA_SIZE)"
echo "📦 Full Backup: $FULL_BACKUP_FILE ($FULL_SIZE)"
echo ""
echo "📋 Backup Contents:"
echo "✅ Database schema (structure)"
echo "✅ Database data (content)"
echo "✅ Complete database backup"
echo "✅ Prisma schema file"
echo "✅ Migration files"
echo "✅ Recovery instructions"
echo "✅ Restore script"
echo ""
echo "🚀 Next Steps:"
echo "1. Test the backup: cd $BACKUP_DIR && ./restore-database.sh"
echo "2. Store the backup securely"
echo "3. For restoration: run ./restore-database.sh"
echo ""
echo "🔗 Live Application: https://tattooed-world-app.onrender.com"
echo "📚 Documentation: BACKUP_INFO.md"
echo ""
echo "✅ Database backup created successfully!" 