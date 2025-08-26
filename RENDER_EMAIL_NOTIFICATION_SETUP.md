# Render Deployment: Email & Dashboard Notification Setup

## Overview
This document outlines the configuration needed to ensure email notifications and dashboard notifications work properly in the Render deployment.

## ✅ What's Already Configured

### 1. **Email Service URLs** ✅
- All email templates now use the correct production URL: `https://tattooedworld.org`
- Email links point to the dashboard instead of profile pages
- Environment variables are properly set in `render.yaml`

### 2. **Dashboard Notifications** ✅
- Artist dashboard displays recent reviews in real-time
- Reviews are fetched using React Query with proper error handling
- Debug information is shown in development mode

### 3. **Review System** ✅
- Reviews are automatically approved if no moderation flags
- Email notifications are sent immediately for approved reviews
- Comprehensive logging and error handling added

## 🔧 Required Environment Variables

### In Render Dashboard
Make sure these environment variables are set in your Render service:

```bash
# Email Configuration (REQUIRED for notifications)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=stan@berteloot.org

# Frontend URL (REQUIRED for email links)
FRONTEND_URL=https://tattooedworld.org

# Environment
NODE_ENV=production
```

### SendGrid Setup
1. Create a SendGrid account at https://sendgrid.com
2. Generate an API key with "Mail Send" permissions
3. Verify your sender email (`stan@berteloot.org`)
4. Add the API key to Render environment variables

## 🧪 Testing Email Notifications

### 1. **Test Email Service**
Run this command in your Render service to test email configuration:

```bash
cd backend && node scripts/test-email-service.js
```

### 2. **Test Review Submission**
1. Create a test review for an artist
2. Check Render logs for email service messages
3. Verify email is received by the artist
4. Check artist dashboard for new review display

### 3. **Monitor Logs**
Look for these log messages in Render:

```
📧 Sending review notification email to artist: {...}
✅ Review notification email sent successfully: messageId
📧 Email service configuration check: {...}
```

## 🚨 Troubleshooting

### Email Notifications Not Working

#### Check SendGrid Configuration
```bash
# In Render logs, look for:
❌ Email service is not configured. Please set SENDGRID_API_KEY
```

**Solution**: Set `SENDGRID_API_KEY` in Render environment variables

#### Check Email Service Status
```bash
# In Render logs, look for:
📧 Email service configuration check: {
  hasSendGridKey: true/false,
  fromEmail: "stan@berteloot.org",
  configured: true/false
}
```

**Solution**: Verify SendGrid API key and sender email verification

### Dashboard Notifications Not Working

#### Check API Responses
```bash
# In browser console, look for:
🔍 Fetching reviews for user ID: [userId]
📋 Fetched reviews: [count] reviews
```

**Solution**: Check API endpoint `/api/reviews?recipientId=[userId]`

#### Check User Authentication
```bash
# In browser console, verify:
user.id exists and is not null
user.artistProfile exists
```

**Solution**: Ensure user is properly authenticated and has artist profile

## 📧 Email Templates

### Review Notification Email
- **Subject**: "New Review on Your Profile! ⭐"
- **Content**: Rating, title, comment, reviewer name
- **Action Button**: "View Your Dashboard" → links to `https://tattooedworld.org/dashboard`
- **Design**: Professional HTML with gradient header

### Email Verification
- **Subject**: "Verify Your Email - Tattooed World 🎨"
- **Action Button**: "Verify Email Address" → links to verification page
- **Design**: Consistent with review notification styling

## 🔄 Real-Time Updates

### Dashboard Refresh
- Reviews are fetched every 60 seconds (staleTime: 60 * 1000)
- React Query handles caching and background updates
- Manual refresh available through React Query refetch

### Review Display
- Shows last 3 reviews in dashboard
- Displays rating, comment, reviewer info, and date
- Handles missing data gracefully with fallbacks

## 📊 Monitoring & Logging

### Email Service Logs
```bash
# Success
✅ Review notification email sent successfully: [messageId]

# Failure
❌ Failed to send review notification email: [error]
❌ Error sending review notification email: [error]
```

### Dashboard Logs
```bash
# Success
🔍 Fetching reviews for user ID: [userId]
📋 Fetched reviews: [count] reviews

# Failure
❌ Error fetching artist reviews: [error]
```

## 🚀 Deployment Checklist

- [ ] SendGrid API key set in Render environment
- [ ] FROM_EMAIL verified in SendGrid
- [ ] FRONTEND_URL set to `https://tattooedworld.org`
- [ ] NODE_ENV set to `production`
- [ ] Email service test script passes
- [ ] Review submission test works
- [ ] Dashboard displays new reviews
- [ ] Email notifications received by artists

## 🔗 Useful Links

- **Render Dashboard**: https://dashboard.render.com
- **SendGrid Dashboard**: https://app.sendgrid.com
- **Production App**: https://tattooedworld.org
- **API Endpoint**: https://tattooedworld.org/api

## 📞 Support

If you encounter issues:
1. Check Render logs for error messages
2. Verify environment variables are set correctly
3. Test email service with the test script
4. Check SendGrid account status and API key permissions

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
