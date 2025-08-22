# Role-Based Access Control (RBAC) System

## Overview

The Tattoo Artist Locator implements a comprehensive role-based access control system with four main user roles: **CLIENT**, **ARTIST**, **ARTIST_ADMIN**, and **ADMIN**. Each role has specific permissions and restrictions to ensure security and proper functionality.

## Role Hierarchy

```
CLIENT (Basic user)
    ↓
ARTIST (Artist with full artist permissions)
    ↓
ARTIST_ADMIN (Artist + Admin permissions)
    ↓
ADMIN (Full system control)
```

## User Roles

### 🔵 CLIENT Role
**Default role for new registrations**

#### Permissions:
- ✅ **View Artists**: Browse and search for tattoo artists
- ✅ **View Artist Profiles**: Access detailed artist information
- ✅ **View Flash/Portfolio**: Browse artist portfolios and flash designs
- ✅ **Create Reviews**: Leave reviews and ratings for artists
- ✅ **Edit Own Reviews**: Modify their own reviews
- ✅ **View Own Profile**: Access and edit personal profile
- ✅ **Contact Artists**: Send messages to artists (future feature)

#### Restrictions:
- ❌ Cannot create artist profiles
- ❌ Cannot upload flash/portfolio items
- ❌ Cannot moderate content
- ❌ Cannot access admin features

#### API Endpoints Access:
```
GET /api/artists - View all artists
GET /api/artists/:id - View specific artist
GET /api/flash - View flash items
POST /api/reviews - Create reviews
PUT /api/reviews/:id - Edit own reviews
GET /api/auth/me - View own profile
PUT /api/auth/profile - Update own profile
```

---

### 🎨 ARTIST Role
**For tattoo artists providing services**

#### Permissions:
- ✅ **All CLIENT permissions** (inherited)
- ✅ **Create Artist Profile**: Set up professional artist profile
- ✅ **Edit Own Artist Profile**: Update profile information
- ✅ **Upload Flash/Portfolio**: Add portfolio items (when verified)
- ✅ **Edit Own Flash**: Modify their own portfolio items
- ✅ **View Own Reviews**: See reviews received from clients
- ✅ **Respond to Reviews**: Reply to client reviews (future feature)
- ✅ **Manage Services**: Add/remove offered services
- ✅ **Manage Specialties**: Update artistic specialties

#### Restrictions:
- ❌ Cannot access admin features
- ❌ Cannot moderate other users' content
- ❌ Cannot verify other artists
- ❌ Flash uploads require verification approval

#### Verification Process:
1. **Registration**: Artist registers with ARTIST role
2. **Profile Creation**: Artist creates detailed profile
3. **Pending Status**: Profile marked as `PENDING` verification
4. **Admin Review**: Admin reviews and verifies profile
5. **Approved**: Artist can upload flash and receive full permissions

#### API Endpoints Access:
```
# Inherits all CLIENT endpoints
POST /api/artists - Create artist profile
PUT /api/artists/:id - Edit own artist profile
POST /api/flash - Upload flash (when verified)
PUT /api/flash/:id - Edit own flash
DELETE /api/flash/:id - Delete own flash
GET /api/reviews?recipientId=:id - View own reviews
```

---

### 🎨🔴 ARTIST_ADMIN Role
**For tattoo artists who also have administrative privileges**

#### Permissions:
- ✅ **All CLIENT permissions** (inherited)
- ✅ **All ARTIST permissions** (inherited)
- ✅ **All ADMIN permissions** (inherited)
- ✅ **Create Artist Profile**: Set up professional artist profile
- ✅ **Edit Own Artist Profile**: Update profile information
- ✅ **Upload Flash/Portfolio**: Add portfolio items (when verified)
- ✅ **Edit Own Flash**: Modify their own portfolio items
- ✅ **View Own Reviews**: See reviews received from clients
- ✅ **Manage Services**: Add/remove offered services
- ✅ **Manage Specialties**: Update artistic specialties
- ✅ **Manage Users**: View, edit, and deactivate user accounts
- ✅ **Verify Artists**: Approve/reject artist verification requests
- ✅ **Feature Artists**: Promote artists to featured status
- ✅ **Moderate Content**: Approve/hide reviews and flash items
- ✅ **Manage System**: Control specialties, services, and system settings
- ✅ **View Analytics**: Access dashboard statistics and reports
- ✅ **Audit Trail**: View admin action logs
- ✅ **Emergency Actions**: Suspend users, remove content

#### Restrictions:
- ❌ Cannot modify their own role (prevents self-demotion)
- ❌ Cannot delete the last admin account
- ❌ Actions are logged for audit purposes
- ❌ Flash uploads require verification approval (same as regular artists)

#### Verification Process:
1. **Registration**: Artist registers with ARTIST_ADMIN role
2. **Profile Creation**: Artist creates detailed profile
3. **Pending Status**: Profile marked as `PENDING` verification
4. **Admin Review**: Admin reviews and verifies profile
5. **Approved**: Artist can upload flash and receive full permissions

#### API Endpoints Access:
```
# Inherits all CLIENT, ARTIST, and ADMIN endpoints
GET /api/admin/dashboard - View admin dashboard
GET /api/admin/users - Manage all users
PUT /api/admin/users/:id - Update user status/role
GET /api/admin/artists/pending - View pending verifications
PUT /api/admin/artists/:id/verify - Verify/reject artists
PUT /api/admin/artists/:id/feature - Feature/unfeature artists
GET /api/admin/reviews - Moderate reviews
PUT /api/admin/reviews/:id/moderate - Approve/hide reviews
GET /api/admin/actions - View admin action log
```

---

### 🔴 ADMIN Role
**System administrators with full control**

#### Permissions:
- ✅ **All CLIENT and ARTIST permissions** (inherited)
- ✅ **Manage Users**: View, edit, and deactivate user accounts
- ✅ **Verify Artists**: Approve/reject artist verification requests
- ✅ **Feature Artists**: Promote artists to featured status
- ✅ **Moderate Content**: Approve/hide reviews and flash items
- ✅ **Manage System**: Control specialties, services, and system settings
- ✅ **View Analytics**: Access dashboard statistics and reports
- ✅ **Audit Trail**: View admin action logs
- ✅ **Emergency Actions**: Suspend users, remove content

#### Restrictions:
- ❌ Cannot modify their own role (prevents self-demotion)
- ❌ Cannot delete the last admin account
- ❌ Actions are logged for audit purposes

#### API Endpoints Access:
```
# Inherits all CLIENT and ARTIST endpoints
GET /api/admin/dashboard - View admin dashboard
GET /api/admin/users - Manage all users
PUT /api/admin/users/:id - Update user status/role
GET /api/admin/artists/pending - View pending verifications
PUT /api/admin/artists/:id/verify - Verify/reject artists
PUT /api/admin/artists/:id/feature - Feature/unfeature artists
GET /api/admin/reviews - Moderate reviews
PUT /api/admin/reviews/:id/moderate - Approve/hide reviews
GET /api/admin/actions - View admin action log
```

## Permission Matrix

| Action | CLIENT | ARTIST | ARTIST_ADMIN | ADMIN |
|--------|--------|--------|--------------|-------|
| View Artists | ✅ | ✅ | ✅ | ✅ |
| Create Reviews | ✅ | ✅ | ✅ | ✅ |
| Edit Own Reviews | ✅ | ✅ | ✅ | ✅ |
| Create Artist Profile | ❌ | ✅ | ✅ | ✅ |
| Upload Flash | ❌ | ✅* | ✅* | ✅ |
| Verify Artists | ❌ | ❌ | ✅ | ✅ |
| Feature Artists | ❌ | ❌ | ✅ | ✅ |
| Moderate Reviews | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ✅ | ✅ |
| View Admin Dashboard | ❌ | ❌ | ✅ | ✅ |

*Requires verification approval

## Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role Verification**: Server-side role validation on every request
- **Resource Ownership**: Users can only modify their own resources
- **Admin Audit Trail**: All admin actions are logged

### Data Protection
- **Input Validation**: All user inputs are validated and sanitized
- **SQL Injection Prevention**: Using Prisma ORM with parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **Rate Limiting**: API rate limiting to prevent abuse

### Content Moderation
- **Review Moderation**: Admins can approve/hide inappropriate reviews
- **Flash Approval**: Artist flash items can be moderated
- **User Suspension**: Admins can suspend problematic users
- **Verification System**: Artist profiles require admin verification

## Implementation Details

### Middleware Functions
```javascript
// Role-based middleware
const clientOnly = authorize('CLIENT');
const artistOnly = authorize('ARTIST', 'ARTIST_ADMIN');
const adminOnly = authorize('ADMIN', 'ARTIST_ADMIN');

// Permission-based middleware
const requireArtistVerification = async (req, res, next) => { /* ... */ };
const requireOwnership = (resourceType) => { /* ... */ };

// Combined permissions
const clientOrArtist = authorize('CLIENT', 'ARTIST', 'ARTIST_ADMIN');
const clientOrAdmin = authorize('CLIENT', 'ADMIN', 'ARTIST_ADMIN');
const artistOrAdmin = authorize('ARTIST', 'ADMIN', 'ARTIST_ADMIN');
```

### Database Schema
```sql
-- User roles enum
enum UserRole {
  CLIENT
  ARTIST
  ADMIN
}

-- Artist verification status
enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
  SUSPENDED
}

-- Admin actions tracking
model AdminAction {
  adminId     String
  action      String
  targetType  String
  targetId    String
  details     String?
  createdAt   DateTime
}
```

## Best Practices

### For Developers
1. **Always verify roles server-side** - Never trust client-side role information
2. **Use middleware for authorization** - Apply role checks at the route level
3. **Log admin actions** - Maintain audit trail for all administrative actions
4. **Validate resource ownership** - Ensure users can only modify their own data
5. **Implement proper error handling** - Return appropriate error messages for unauthorized access

### For Administrators
1. **Regular audit reviews** - Monitor admin action logs regularly
2. **Verification process** - Thoroughly review artist verification requests
3. **Content moderation** - Actively moderate user-generated content
4. **User management** - Monitor and manage user accounts appropriately
5. **System monitoring** - Keep track of system statistics and user activity

### For Users
1. **CLIENT**: Provide honest reviews and respect artist work
2. **ARTIST**: Maintain professional profiles and respond to client feedback
3. **ADMIN**: Use administrative powers responsibly and maintain system integrity

## Future Enhancements

### Planned Features
- **Role Hierarchy**: More granular permission levels
- **Permission Groups**: Custom permission sets for different admin types
- **Temporary Permissions**: Time-limited elevated permissions
- **Advanced Moderation**: AI-powered content moderation
- **User Reporting**: Client reporting system for inappropriate content
- **Artist Verification Levels**: Multiple verification tiers (Basic, Premium, Featured)

### Security Improvements
- **Two-Factor Authentication**: Enhanced login security
- **Session Management**: Advanced session tracking and control
- **API Rate Limiting**: Role-based rate limiting
- **Content Encryption**: Sensitive data encryption
- **Backup and Recovery**: Automated backup and disaster recovery 