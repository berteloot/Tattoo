# 🔒 SECURITY DOCUMENTATION

## 🚨 CRITICAL SECURITY REQUIREMENTS

This document outlines the security measures that **MUST** be implemented before deploying to production.

## Google Maps API Key Security

### ⚠️ CRITICAL: API Key Exposure

The `VITE_GOOGLE_MAPS_API_KEY` environment variable is used in the frontend and will be visible to users. This is **normal and expected** for Google Maps JavaScript API, but **requires strict domain restrictions** to prevent abuse.

### Required Security Measures

#### 1. HTTP Referrer Restrictions (MANDATORY)

**Step-by-step setup:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Select your Google Maps API key
4. Under **"Application restrictions"**, select **"HTTP referrers (web sites)"**
5. Add **ONLY** your production domains:

```
https://tattooed-world-backend.onrender.com/*
https://yourdomain.com/*
http://localhost:5173/* (for development only)
```

**⚠️ IMPORTANT:** Never use wildcards like `*` or `https://*.googleapis.com/*` - this defeats the purpose of restrictions.

#### 2. API Restrictions (MANDATORY)

1. Under **"API restrictions"**, select **"Restrict key"**
2. Enable **ONLY** these APIs:
   - ✅ **Maps JavaScript API** (required for maps)
   - ✅ **Geocoding API** (required for address lookup)
   - ✅ **Places API** (required for address autocomplete)
3. **Disable all other APIs** to minimize attack surface

#### 3. Billing Alerts (RECOMMENDED)

1. Set up billing alerts in Google Cloud Console
2. Configure alerts for:
   - Daily spending thresholds
   - Unusual API usage patterns
   - Geographic usage outside your region

### Security Risks of Unrestricted Keys

| Risk | Impact | Prevention |
|------|---------|------------|
| **API Abuse** | Unauthorized usage on other websites | HTTP referrer restrictions |
| **Billing Impact** | Unexpected charges from malicious usage | Billing alerts + restrictions |
| **Rate Limiting** | Your quota consumed by other sites | Domain restrictions |
| **Service Disruption** | API access blocked due to abuse | Proper restrictions + monitoring |

## Environment Variables Security

### Critical Variables

| Variable | Security Requirement | Risk if Insecure |
|----------|---------------------|------------------|
| `JWT_SECRET` | 32+ characters, unique per environment | Session hijacking, unauthorized access |
| `DATABASE_URL` | Production database, never commit to git | Data breaches, unauthorized access |
| `CORS_ORIGINS` | Restrict to production domains only | CSRF attacks, unauthorized API access |
| `VITE_GOOGLE_MAPS_API_KEY` | Domain restrictions in Google Cloud | API abuse, billing impact |

### Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different secrets** for development, staging, and production
3. **Rotate secrets regularly** (especially JWT_SECRET)
4. **Monitor environment variables** for unauthorized changes

## Database Security

### Production Database Requirements

1. **Strong Passwords**: 16+ characters with complexity
2. **Network Restrictions**: Only allow connections from your application
3. **Regular Backups**: Automated daily backups with retention
4. **Access Logging**: Monitor all database connections
5. **SSL/TLS**: Encrypt all database connections

### Database Access Control

```sql
-- Example: Restrict database access to specific IPs
ALTER USER your_app_user CONNECTION LIMIT 10;
ALTER USER your_app_user VALID UNTIL 'infinity';
```

## Application Security

### Security Headers

The application uses Helmet.js to set security headers:

- **Content Security Policy (CSP)**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Strict-Transport-Security**: Enforces HTTPS

### Rate Limiting

- **API Endpoints**: 500 requests per 15 minutes per IP
- **Authentication**: 100 requests per 15 minutes per IP
- **Proxy Handling**: Secure IP detection behind load balancers

### JWT Security

- **Access Tokens**: 15-minute expiration
- **Refresh Tokens**: 7-day expiration, httpOnly cookies
- **Token Rotation**: New refresh token on each use
- **Secure Storage**: No localStorage usage

## Deployment Security Checklist

### Pre-Deployment

- [ ] Google Maps API key restricted to your domains
- [ ] JWT_SECRET is 32+ characters and unique
- [ ] DATABASE_URL points to production database
- [ ] CORS_ORIGINS restricted to production domains
- [ ] NODE_ENV set to "production"
- [ ] All security fixes deployed

### Post-Deployment

- [ ] HTTPS enforced (no HTTP redirects)
- [ ] Security headers present and correct
- [ ] Rate limiting working correctly
- [ ] Database connections encrypted
- [ ] Monitoring and alerting configured

## Monitoring and Alerting

### Required Monitoring

1. **API Usage**: Monitor Google Maps API usage patterns
2. **Authentication**: Monitor failed login attempts
3. **Database**: Monitor connection patterns and performance
4. **Errors**: Monitor application errors and security events

### Alerting Setup

1. **Billing Alerts**: Google Cloud billing thresholds
2. **Security Events**: Failed authentication, rate limit violations
3. **Performance**: Database connection issues, high response times
4. **Availability**: Service downtime, health check failures

## Incident Response

### Security Breach Response

1. **Immediate Actions**
   - Revoke compromised API keys
   - Rotate JWT secrets
   - Review access logs
   - Assess data exposure

2. **Investigation**
   - Analyze security logs
   - Identify attack vectors
   - Document incident details
   - Implement additional security measures

3. **Recovery**
   - Restore from secure backups
   - Update security configurations
   - Monitor for additional attacks
   - Review and update security procedures

## Compliance and Standards

### Security Standards

- **OWASP Top 10**: Addresses common web application vulnerabilities
- **CSP Level 3**: Content Security Policy implementation
- **JWT Best Practices**: Secure token handling
- **Database Security**: PostgreSQL security hardening

### Regular Security Reviews

- **Monthly**: Review access logs and API usage
- **Quarterly**: Security configuration review
- **Annually**: Full security audit and penetration testing
- **Continuous**: Monitor security advisories and updates

## Support and Resources

### Security Documentation

- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [OWASP Security Guidelines](https://owasp.org/www-project-top-ten/)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bic/)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)

### Security Contacts

- **Google Cloud Support**: For API key security issues
- **Database Provider**: For database security concerns
- **Application Security**: For code-level security issues

---

**⚠️ REMEMBER: Security is not optional. Implement ALL required measures before production deployment.**
