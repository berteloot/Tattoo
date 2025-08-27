#!/bin/bash

echo "=== Prisma Production Database Baseline ==="
echo "This script will mark existing migrations as APPLIED in production"
echo "WARNING: Make sure you have a backup of your production database!"
echo ""

# List all migrations
echo "Available migrations:"
ls -1 prisma/migrations | grep -v migration_lock.toml
echo ""

# Confirm before proceeding
read -p "Do you want to proceed with baselining? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Baseline cancelled."
    exit 0
fi

echo ""
echo "=== Baselining migrations ==="

# Baseline each migration as already applied
for migration in $(ls -1 prisma/migrations | grep -v migration_lock.toml | sort); do
    echo "Marking $migration as APPLIED..."
    npx prisma migrate resolve --applied "$migration"
    if [ $? -eq 0 ]; then
        echo "✅ $migration marked as APPLIED"
    else
        echo "❌ Failed to mark $migration as APPLIED"
        exit 1
    fi
done

echo ""
echo "=== Baseline Complete ==="
echo "All migrations have been marked as APPLIED"
echo "You can now run: npx prisma migrate deploy"
echo "Or restart your Render service"

