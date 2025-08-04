# SendGrid Setup Guide - Fix Email Verification

## Current Issues
1. **401 Unauthorized Error**: SendGrid API key is invalid or not properly configured
2. **Email Not Sending**: Users can't receive verification emails
3. **Frontend Error**: `TypeError: a is not a function` in EmailVerification component

## Step 1: Fix SendGrid Configuration in Render

### 1.1 Get a Valid SendGrid API Key
1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings > API Keys**
3. Create a new API Key with **Mail Send** permissions
4. Copy the API key (starts with `SG.`)

### 1.2 Configure Render Environment Variables
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your `tattooed-world-app` service
3. Go to **Environment** tab
4. Add/Update these variables:

```
SENDGRID_API_KEY = SG.your_actual_api_key_here
FROM_EMAIL = stan@altilead.com
```

### 1.3 Verify Sender Email in SendGrid
1. In SendGrid Dashboard, go to **Settings > Sender Authentication**
2. Add and verify `stan@altilead.com` as a sender
3. Follow the verification process (check email and click link)

## Step 2: Test SendGrid Configuration

### 2.1 Test API Key Locally
```bash
cd backend
node test-sendgrid-config.js
```

### 2.2 Test Email Sending in Production
1. Deploy the changes to Render
2. Try registering a new user
3. Check if verification email is received

## Step 3: Alternative Email Service Setup

If SendGrid continues to have issues, you can use alternative services:

### Option A: Gmail SMTP (Free)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Update environment variables:

```
EMAIL_SERVICE = gmail
EMAIL_USER = your-email@gmail.com
EMAIL_PASS = your-app-password
```

### Option B: Mailgun (Free tier available)
1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Verify your domain
3. Get API key and domain
4. Update environment variables:

```
MAILGUN_API_KEY = your-mailgun-api-key
MAILGUN_DOMAIN = your-domain.com
```

## Step 4: Update Email Service Code

If switching to alternative services, update `backend/src/utils/emailService.js`:

```javascript
// For Gmail SMTP
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// For Mailgun
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
});
```

## Step 5: Verify Frontend Integration

The frontend error has been fixed by:
1. Adding proper error handling in EmailVerification component
2. Ensuring API methods are correctly defined in `api.js`
3. Using proper toast notifications

## Step 6: Test Complete Flow

1. **Register a new user** with a fresh email
2. **Check for verification email** in inbox/spam
3. **Click verification link** to activate account
4. **Verify automatic login** and redirect
5. **Test resend verification** if needed

## Troubleshooting

### SendGrid 401 Error
- Verify API key is correct and active
- Check if sender email is verified
- Ensure API key has Mail Send permissions

### Email Not Received
- Check spam/junk folder
- Verify sender email is properly configured
- Test with different email providers

### Frontend Errors
- Clear browser cache
- Check browser console for JavaScript errors
- Verify all API endpoints are working

## Environment Variables Summary

Required for SendGrid:
```
SENDGRID_API_KEY = SG.your_api_key_here
FROM_EMAIL = stan@altilead.com
FRONTEND_URL = https://tattooed-world-backend.onrender.com
```

## Next Steps

1. **Immediate**: Configure SendGrid API key in Render
2. **Verify**: Test email sending with new configuration
3. **Monitor**: Check email delivery rates and bounces
4. **Optimize**: Consider email templates and delivery optimization

## Support

If issues persist:
1. Check SendGrid account status and limits
2. Verify domain authentication
3. Review email delivery logs
4. Consider alternative email services 