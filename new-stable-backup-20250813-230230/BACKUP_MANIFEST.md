# Tattoo Artist Locator App - New Stable Backup

## Backup Information
- **Date**: $(date)
- **Version**: New Stable
- **Type**: Current Stable Version Backup
- **Status**: Complete

## Application Overview
This is the current stable version of the tattoo artist locator application with:
- Complete role-based access control (CLIENT/ARTIST/ADMIN)
- Full admin system with user management and audit trails
- Artist dashboard with analytics and location management
- Google Maps integration with fallback support
- Single domain deployment architecture
- PostgreSQL database with Prisma ORM
- React frontend with Tailwind CSS
- Node.js backend with Express

## Core Features
✅ **Authentication System**: JWT-based with role management
✅ **Admin Dashboard**: Complete user and content management
✅ **Artist Dashboard**: Analytics, portfolio, and location management
✅ **Google Maps**: Interactive location selection with fallbacks
✅ **Review System**: Moderation and rating management
✅ **File Uploads**: Cloudinary integration for images
✅ **Geocoding**: Address to coordinates conversion
✅ **Rate Limiting**: Production-ready with proxy support
✅ **Security**: Input validation, CORS, audit trails

## File Structure
```
new-stable-backup/
├── frontend/          # React + Vite application
├── backend/           # Node.js + Express API
├── docs/             # Complete documentation
├── scripts/          # Emergency and utility scripts
├── config/           # Configuration files
└── BACKUP_MANIFEST.md # This file
```

## Production Status
- **Live URL**: https://tattooed-world-backend.onrender.com
- **Database**: PostgreSQL with Prisma ORM
- **Hosting**: Render.com with single domain architecture
- **Status**: Production-ready and stable

## Test Accounts (for development)
```
Admin: berteloot@gmail.com / admin123
Client: client@example.com / client123
Artist: artist@example.com / artist123
Pending Artist: pending@example.com / pending123
```

## Recent Features
- ✅ Authentication system fully functional
- ✅ Admin system complete with audit trails
- ✅ Artist dashboard with location management
- ✅ Google Maps integration working
- ✅ Rate limiting fixed for Render.com
- ✅ Frontend crash issues resolved
- ✅ Database schema optimized
- ✅ Emergency recovery scripts included
- ✅ Studio integration with production API
- ✅ Message system for artist cards

## Restoration Instructions
1. Extract this backup to a clean directory
2. Run `npm install` in both frontend and backend directories
3. Set up environment variables (see .env.example)
4. Run database migrations: `npx prisma migrate deploy`
5. Start backend: `npm run dev` (backend directory)
6. Start frontend: `npm run dev` (frontend directory)

## Emergency Recovery
Use the scripts in the `scripts/` directory for:
- Account recovery
- Password resets
- Database recovery
- Production fixes
- Schema repairs

## Notes
- This backup represents the current stable version
- All critical fixes and improvements are included
- Emergency recovery procedures are documented
- Complete admin system is functional
- Single domain deployment is configured
- Rate limiting is optimized for production
- Studio integration is working with production API

---
**Backup Created**: $(date)
**Backup Version**: New Stable
**Status**: CURRENT STABLE VERSION
