#!/bin/bash

echo "🧹 Cleaning up old/temporary files from repository..."

# Create backup before cleanup
echo "📦 Creating backup first..."
git add -A
git commit -m "Backup before cleanup" || echo "Nothing to commit"

# Remove test files (keeping essential ones)
echo "🗑️ Removing test files..."
find . -name "test-*.js" -not -path "./backend/src/__tests__/*" -not -path "./frontend/src/__tests__/*" -delete
find . -name "debug-*.js" -delete
find . -name "check-*.js" -delete

# Remove old SQL files (keeping essential ones)
echo "🗑️ Removing old SQL files..."
find . -name "add_*.sql" -delete
find . -name "fix_*.sql" -delete
find . -name "update_*.sql" -delete
find . -name "tattoo_gallery_*.sql" -delete
find . -name "cleanup-*.sql" -delete
find . -name "create-*.sql" -delete
find . -name "enhance_*.sql" -delete
find . -name "render-geocoding-*.sql" -delete

# Remove deployment and setup scripts
echo "🗑️ Removing old deployment scripts..."
find . -name "deploy-*.js" -delete
find . -name "deploy-*.sh" -delete
find . -name "setup-*.js" -delete
find . -name "setup-*.sh" -delete
find . -name "backup-*.sh" -delete
find . -name "build-*.sh" -delete

# Remove other temporary files
echo "🗑️ Removing other temporary files..."
find . -name "*-geocoding-*.js" -delete
find . -name "*-gallery-*.js" -delete
find . -name "*-production-*.js" -delete
find . -name "approve-*.js" -delete
find . -name "clear-*.js" -delete
find . -name "delete-*.js" -delete
find . -name "force-*.js" -delete
find . -name "import-*.js" -delete
find . -name "regenerate-*.js" -delete
find . -name "trigger-*.js" -delete
find . -name "verify-*.js" -delete
find . -name "run-*.js" -delete

# Remove old documentation (keeping essential ones)
echo "🗑️ Removing temporary documentation..."
rm -f *_IMPLEMENTATION.md
rm -f *_FIX*.md
rm -f *_GUIDE.md
rm -f *_SUMMARY.md
rm -f *_ANALYSIS.md
rm -f *_STATUS.md
rm -f DEPLOYMENT_*.md
rm -f GEOCODING_*.md
rm -f GALLERY_*.md
rm -f PROFILE_*.md
rm -f POSTGRES_*.md
rm -f AUTHENTICATION_*.md
rm -f AUTOMATED_*.md

# Remove other temporary files
rm -f pgadmin-sql-queries.sql
rm -f quick-start.sh
rm -f build.sh
rm -f deploy.sh
rm -f env.example

echo "✅ Cleanup completed!"
echo "📊 Files remaining:"
ls -la | wc -l
echo "🔍 Essential files kept:"
echo "  - backend/ (source code)"
echo "  - frontend/ (source code)" 
echo "  - docs/ (essential documentation)"
echo "  - README.md"
echo "  - render.yaml (deployment config)"
echo "  - package.json files"
echo "  - .cursorrules"
echo "  - studios-template.csv (template)"

echo "📝 Run 'git add -A && git commit -m \"Clean up old/temporary files\"' to commit changes"
