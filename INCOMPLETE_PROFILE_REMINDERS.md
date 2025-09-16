# Incomplete Profile Reminder System

## Overview

This system automatically sends reminder emails to artists who signed up 3+ days ago but haven't completed their artist profile. The reminder encourages them to add essential information (bio and studio) to make their profile visible on the platform.

## Features

### ✅ **Email Template**
- **Subject**: "Your TattooedWorld profile isn't live yet"
- **Tone**: Friendly and encouraging
- **Content**: Clear instructions on how to complete their profile
- **Call-to-Action**: Direct link to dashboard
- **Professional Design**: HTML template with TattooedWorld branding

### ✅ **Database Tracking**
- New field: `incompleteProfileReminderSentAt` in `artist_profiles` table
- Tracks when reminder emails were sent
- Prevents duplicate emails to the same artist

### ✅ **API Endpoints**
- `GET /api/admin/incomplete-profiles` - View artists with incomplete profiles
- `POST /api/admin/send-incomplete-profile-reminders` - Send reminder emails

### ✅ **Automated Script**
- `scripts/send-incomplete-profile-reminders.js` - Standalone script for automation
- Can be run manually or scheduled via cron
- Comprehensive logging and error handling

## How It Works

### 1. **Profile Completion Criteria**
An artist profile is considered "incomplete" if it's missing:
- **Bio** (null or empty string)
- **Studio Name** (null or empty string)

### 2. **Timing Logic**
- Artists must have signed up **3+ days ago**
- Must have **ARTIST** or **ARTIST_ADMIN** role
- Must **not** have received a reminder email before

### 3. **Email Content**
The reminder email includes:
- Friendly greeting using the artist's first name
- Clear explanation that their profile isn't visible yet
- **2-step minimum process**:
  1. Go to Dashboard (top right)
  2. Add bio and search for studio in Basic Info
- **Optional enhancements**:
  - Add portfolio work
  - Add social media links
  - Select specialties
- Direct link to dashboard
- Encouragement to reply with feedback

## Usage

### **Manual Execution**
```bash
# Run the reminder script
cd backend
npm run reminders:send

# Or run directly
node scripts/send-incomplete-profile-reminders.js
```

### **API Usage**
```bash
# View incomplete profiles (Admin only)
GET /api/admin/incomplete-profiles

# Send reminder emails (Admin only)
POST /api/admin/send-incomplete-profile-reminders
```

### **Scheduled Automation**
Set up a cron job to run daily:
```bash
# Add to crontab (runs daily at 9 AM)
0 9 * * * cd /path/to/tattoo-app/backend && npm run reminders:send
```

## Configuration

### **Environment Variables**
```bash
# Required for email functionality
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="stan@berteloot.org"
FRONTEND_URL="https://tattooedworld.org"

# Database
DATABASE_URL="postgresql://..."
```

### **Database Schema**
```sql
-- New field added to artist_profiles table
ALTER TABLE artist_profiles 
ADD COLUMN incompleteProfileReminderSentAt TIMESTAMP;
```

## Email Template Preview

```
Subject: Your TattooedWorld profile isn't live yet

Hey [First Name],

Thanks for signing up with TattooedWorld. Right now, you're in the system — 
but your artist profile isn't visible yet.

At the minimum, you only need 2 quick steps to get listed as an artist:
1. Go to your Dashboard (top right).
2. In Basic Info, write a short bio (10 characters or more) and search for your studio. 
   If you're the owner, click Claim.

That's it — you'll show up on the map as an artist.

Want a complete profile? Go further:
• Add some of your work (healed tattoos, flash, etc.)
• Drop in your IG and other links
• Select your style and specialties

[Complete Your Profile Button]

We built TattooedWorld to put artists on the map — literally. If you hit a snag or 
have ideas, reply to this email. Your feedback helps us make it better for everyone.

Respect,
The TattooedWorld Team
```

## Monitoring & Analytics

### **Script Output**
The script provides detailed logging:
- Number of artists found with incomplete profiles
- List of artists who will receive reminders
- Success/failure status for each email
- Summary statistics
- Error details for failed sends

### **Database Queries**
```sql
-- Find artists with incomplete profiles
SELECT u.email, u.firstName, u.lastName, u.createdAt, 
       ap.bio, ap.studioName, ap.incompleteProfileReminderSentAt
FROM users u
JOIN artist_profiles ap ON u.id = ap.userId
WHERE u.role IN ('ARTIST', 'ARTIST_ADMIN')
  AND u.createdAt <= NOW() - INTERVAL '3 days'
  AND (ap.bio IS NULL OR ap.bio = '' OR ap.studioName IS NULL OR ap.studioName = '')
  AND ap.incompleteProfileReminderSentAt IS NULL;
```

## Error Handling

### **Graceful Degradation**
- Script continues even if individual emails fail
- Comprehensive error logging
- Database updates only on successful email sends
- Dry-run mode when SendGrid is not configured

### **Rate Limiting**
- 1-second delay between emails to avoid SendGrid rate limits
- Respects SendGrid's sending limits

### **Security**
- Admin-only API endpoints
- Input validation and sanitization
- Secure database queries using Prisma ORM

## Production Deployment

### **Render.com Setup**
1. Add environment variables in Render dashboard
2. Set up cron job or scheduled task
3. Monitor logs for email delivery status

### **Cron Job Example**
```bash
# Daily at 9 AM UTC
0 9 * * * cd /opt/render/project/src/backend && npm run reminders:send >> /var/log/incomplete-profile-reminders.log 2>&1
```

## Testing

### **Test the Script**
```bash
# Run in development (dry-run mode)
npm run reminders:send

# Check API endpoints
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     http://localhost:3001/api/admin/incomplete-profiles
```

### **Test Email Template**
The script includes a test mode that logs email content without sending when SendGrid is not configured.

## Maintenance

### **Regular Tasks**
- Monitor email delivery rates
- Check for failed sends and retry if needed
- Update email template based on user feedback
- Review and adjust timing (currently 3 days)

### **Troubleshooting**
- Check SendGrid API key and configuration
- Verify database connectivity
- Review server logs for errors
- Test with a small group before full deployment

## Future Enhancements

### **Potential Improvements**
- Multiple reminder emails (3 days, 7 days, 14 days)
- Different email templates based on completion level
- A/B testing for email content
- Integration with analytics dashboard
- Personalized recommendations based on artist type

### **Advanced Features**
- Email open/click tracking
- Unsubscribe functionality
- Template customization per studio
- Integration with CRM systems

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run reminders:send` | Send reminder emails |
| `GET /api/admin/incomplete-profiles` | View incomplete profiles |
| `POST /api/admin/send-incomplete-profile-reminders` | Send reminders via API |

| Field | Description |
|-------|-------------|
| `incompleteProfileReminderSentAt` | Timestamp when reminder was sent |
| `bio` | Artist bio (required for complete profile) |
| `studioName` | Studio name (required for complete profile) |

This system ensures that artists who sign up but don't complete their profiles receive helpful reminders to get their profiles live and visible to potential clients.
