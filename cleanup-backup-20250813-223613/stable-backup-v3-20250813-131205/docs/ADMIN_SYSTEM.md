# 🔴 Admin System Documentation

## Overview

The Tattoo Artist Locator admin system provides comprehensive user management, content moderation, and system administration capabilities. This document outlines all admin features, permissions, and best practices.

## 🎯 Admin User Setup

### Current Admin User
- **Email**: `berteloot@gmail.com`
- **Password**: `admin123`
- **Role**: `ADMIN`
- **Status**: Active and Verified

### Creating Additional Admin Users

To create a new admin user, use the script:

```bash
cd backend
node scripts/create-admin.js
```

Or manually update an existing user:

```sql
UPDATE users 
SET role = 'ADMIN', isActive = true, isVerified = true 
WHERE email = 'newadmin@example.com';
```

## 🔐 Role-Based Access Control (RBAC)

### Admin Permissions

| Feature | Permission | Description |
|---------|------------|-------------|
| **User Management** | Full Control | View, edit, block, restore all users |
| **Artist Verification** | Full Control | Approve, reject, suspend artist profiles |
| **Content Moderation** | Full Control | Moderate reviews, flash items, comments |
| **System Settings** | Full Control | Manage specialties, services, system config |
| **Audit Trail** | Full Access | View all admin actions and system logs |
| **Analytics** | Full Access | View dashboard statistics and reports |

### Security Features

- **Self-Protection**: Admins cannot modify their own accounts
- **Audit Logging**: All admin actions are logged with timestamps
- **Soft Deletes**: Users are deactivated rather than permanently deleted
- **Reason Tracking**: All actions require optional reason documentation

## 🎛️ Admin Dashboard

### Access
- **URL**: `/admin`
- **Required Role**: `ADMIN`
- **Navigation**: "Admin Panel" button in header

### Features

#### 📊 Statistics Overview
- Total Users Count
- Total Artists Count
- Pending Verifications
- Total Reviews
- System Status Indicators

#### ⚡ Quick Actions
- **User Management**: `/admin/users`
- **Artist Verification**: `/admin/artists/pending`
- **Review Moderation**: `/admin/reviews`
- **Content Management**: `/admin/content`
- **System Settings**: `/admin/settings`
- **Audit Log**: `/admin/actions`

#### 📋 Recent Admin Actions
- Real-time feed of recent admin activities
- Action type indicators with color coding
- Timestamp and admin user information

## 👥 User Management System

### Access
- **URL**: `/admin/users`
- **Required Role**: `ADMIN`

### Features

#### 🔍 Advanced Filtering
- **Search**: By name, email, or phone
- **Role Filter**: CLIENT, ARTIST, ADMIN
- **Status Filter**: Active, Inactive
- **Pagination**: 20 users per page

#### 📝 User Operations

##### View User Details
- Click "View" button to see comprehensive user information
- Includes profile data, reviews, artist profile (if applicable)
- Shows account statistics and activity

##### Edit User Information
- **Editable Fields**:
  - First Name, Last Name
  - Email Address
  - Phone Number
  - User Role (CLIENT/ARTIST/ADMIN)
  - Account Status (Active/Inactive)
  - Verification Status
- **Reason Tracking**: Optional reason for changes

##### Block/Deactivate User
- **Soft Delete**: Sets `isActive = false`
- **Reason Required**: Optional reason for deactivation
- **Audit Trail**: Logged in admin actions
- **Reversible**: Can be restored later

##### Restore User
- **Reactivation**: Sets `isActive = true`
- **Audit Trail**: Logged in admin actions
- **Immediate Effect**: User can login immediately

### User Status Management

#### Active Users
- Can login and use all features
- Appear in search results
- Can create content and reviews

#### Inactive Users
- Cannot login to the system
- Hidden from public searches
- Content remains but user cannot access
- Can be restored by admin

## 🎨 Artist Verification System

### Verification Statuses

| Status | Description | User Impact |
|--------|-------------|-------------|
| **PENDING** | Awaiting admin review | Limited access, cannot upload flash |
| **APPROVED** | Verified by admin | Full artist features enabled |
| **REJECTED** | Application denied | Cannot access artist features |
| **SUSPENDED** | Temporarily suspended | Account blocked, content hidden |

### Verification Process

1. **Artist Registration**: User registers as ARTIST role
2. **Profile Creation**: Artist creates detailed profile
3. **Admin Review**: Admin reviews application
4. **Decision**: Approve, reject, or request changes
5. **Notification**: Artist receives status update

### Admin Actions

#### Approve Artist
- Sets `verificationStatus = 'APPROVED'`
- Sets `isVerified = true`
- Enables flash upload functionality
- Sends approval notification

#### Reject Artist
- Sets `verificationStatus = 'REJECTED'`
- Maintains `isVerified = false`
- Blocks flash upload functionality
- Sends rejection notification with reason

#### Suspend Artist
- Sets `verificationStatus = 'SUSPENDED'`
- Hides artist from public searches
- Blocks all artist functionality
- Maintains data for potential restoration

## 📝 Content Moderation

### Review Moderation

#### Moderation Actions
- **Approve Review**: Makes review visible to public
- **Hide Review**: Hides review from public view
- **Delete Review**: Permanently removes review

#### Moderation Criteria
- **Inappropriate Content**: Offensive language, spam
- **Fake Reviews**: Suspicious rating patterns
- **Policy Violations**: Terms of service violations
- **Quality Issues**: Low-quality or irrelevant content

### Flash Item Moderation

#### Moderation Actions
- **Approve Flash**: Makes item visible in gallery
- **Hide Flash**: Hides item from public view
- **Delete Flash**: Permanently removes item

#### Moderation Criteria
- **Inappropriate Content**: Offensive or inappropriate images
- **Quality Standards**: Poor image quality
- **Policy Compliance**: Copyright, trademark issues
- **Spam Prevention**: Duplicate or low-effort content

## 🔍 Audit Trail System

### Admin Action Logging

All admin actions are automatically logged with:

- **Admin User**: Who performed the action
- **Action Type**: What was done (UPDATE_USER, VERIFY_ARTIST, etc.)
- **Target Type**: What was affected (USER, ARTIST, REVIEW, etc.)
- **Target ID**: Specific item affected
- **Details**: Additional information about the action
- **Timestamp**: When the action occurred

### Action Types

| Action | Description | Target Type |
|--------|-------------|-------------|
| `UPDATE_USER` | User information modified | USER |
| `DELETE_USER` | User deactivated | USER |
| `RESTORE_USER` | User reactivated | USER |
| `VERIFY_ARTIST` | Artist verification decision | ARTIST |
| `FEATURE_ARTIST` | Artist featured/unfeatured | ARTIST |
| `MODERATE_REVIEW` | Review moderation action | REVIEW |
| `MODERATE_FLASH` | Flash item moderation | FLASH |

### Audit Log Access

- **URL**: `/admin/actions`
- **Filtering**: By action type, target type, date range
- **Pagination**: 50 actions per page
- **Export**: Available for compliance and reporting

## 🛡️ Security Best Practices

### Admin Account Security

1. **Strong Passwords**: Use complex, unique passwords
2. **Regular Updates**: Change passwords periodically
3. **Limited Access**: Only grant admin to trusted users
4. **Session Management**: Logout when not in use
5. **Audit Monitoring**: Regularly review admin actions

### Data Protection

1. **Soft Deletes**: Never permanently delete user data
2. **Reason Documentation**: Always provide reasons for actions
3. **Audit Trail**: Maintain complete action history
4. **Access Control**: Verify permissions before actions
5. **Data Backup**: Regular database backups

### Content Moderation

1. **Consistent Standards**: Apply moderation rules uniformly
2. **Documentation**: Keep records of moderation decisions
3. **Appeal Process**: Allow users to appeal decisions
4. **Transparency**: Clear communication about policies
5. **Regular Review**: Periodically review moderation practices

## 🚨 Emergency Procedures

### Account Compromise

If an admin account is compromised:

1. **Immediate Action**: Deactivate the compromised account
2. **Password Reset**: Force password change
3. **Audit Review**: Check for unauthorized actions
4. **Security Assessment**: Review access logs
5. **Recovery**: Restore any unauthorized changes

### System Issues

If the admin system experiences issues:

1. **Database Backup**: Ensure recent backup exists
2. **Log Analysis**: Review error logs
3. **Service Restart**: Restart backend services
4. **Health Check**: Verify all endpoints
5. **User Communication**: Notify users if needed

## 📊 Reporting and Analytics

### Dashboard Statistics

The admin dashboard provides real-time statistics:

- **User Growth**: New user registrations over time
- **Artist Verification**: Pending and approved artists
- **Content Activity**: Reviews and flash items
- **System Health**: API performance and uptime

### Export Capabilities

- **User Lists**: Export user data for analysis
- **Action Logs**: Export audit trails for compliance
- **Content Reports**: Export moderation statistics
- **System Metrics**: Export performance data

## 🔧 Technical Implementation

### API Endpoints

#### User Management
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Deactivate user
- `POST /api/admin/users/:id/restore` - Restore user

#### Artist Verification
- `GET /api/admin/artists/pending` - Pending verifications
- `PUT /api/admin/artists/:id/verify` - Verify artist
- `PUT /api/admin/artists/:id/feature` - Feature artist

#### Content Moderation
- `GET /api/admin/reviews` - List reviews
- `PUT /api/admin/reviews/:id/moderate` - Moderate review
- `GET /api/admin/flash` - List flash items
- `PUT /api/admin/flash/:id/moderate` - Moderate flash

#### Audit Trail
- `GET /api/admin/actions` - Admin action log
- `GET /api/admin/dashboard` - Dashboard statistics

### Database Schema

#### AdminAction Model
```sql
CREATE TABLE admin_actions (
  id TEXT PRIMARY KEY,
  admin_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### User Model Extensions
```sql
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'CLIENT';
```

## 📞 Support and Maintenance

### Regular Maintenance Tasks

1. **Daily**: Review pending artist verifications
2. **Weekly**: Review admin action logs
3. **Monthly**: Review moderation statistics
4. **Quarterly**: Security audit and password updates
5. **Annually**: System performance review

### Support Contacts

- **Technical Issues**: Check backend logs and API health
- **User Complaints**: Review through admin dashboard
- **Security Concerns**: Immediate action required
- **Feature Requests**: Document for future development

---

**Last Updated**: July 30, 2025  
**Version**: 1.0  
**Admin User**: berteloot@gmail.com 