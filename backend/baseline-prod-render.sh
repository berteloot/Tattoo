#!/bin/bash

echo "=== Production Database Baseline for Render ==="
echo "This script will mark existing migrations as APPLIED in PRODUCTION"
echo ""

# List all migrations
echo "Available migrations:"
ls -1 prisma/migrations | grep -v migration_lock.toml
echo ""

# Baseline each migration as already applied
echo "=== Baselining migrations in PRODUCTION ==="
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
echo "=== Production Baseline Complete ==="
echo "All migrations have been marked as APPLIED"
echo "You can now restart your Render service"

