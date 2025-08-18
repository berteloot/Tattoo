# Package Versions - New Stable Backup

## Frontend Dependencies
$(cd frontend && npm list --depth=0 2>/dev/null | head -20)

## Backend Dependencies
$(cd backend && npm list --depth=0 2>/dev/null | head -20)

## Root Dependencies
$(npm list --depth=0 2>/dev/null | head -20)

---
**Generated**: $(date)
