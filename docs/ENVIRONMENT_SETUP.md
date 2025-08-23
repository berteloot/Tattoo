# Environment Configuration Guide

## Required Environment Variables

### Backend (.env in backend/ directory)

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/tattoo_app"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting (Fixed for Render.com deployment)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DASHBOARD_RATE_LIMIT_MAX_REQUESTS=500
```

### Frontend (.env in frontend/ directory)

```bash
# API Configuration
VITE_API_URL="http://localhost:3001"

# Google Maps API (Optional)
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Environment
VITE_NODE_ENV="development"
```

## Optional Environment Variables

### Email Services
```bash
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="your-verified-sender@yourdomain.com"
FRONTEND_URL="http://localhost:5173"
```

### File Upload
```bash
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"
```

### Cloudinary (Image Hosting)
```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Google Maps
```bash
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

## Production Configuration

For production deployment on Render.com, use these overrides:

```bash
# Production Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Production CORS
CORS_ORIGIN="https://yourdomain.com"

# Production Frontend URL
FRONTEND_URL="https://yourdomain.com"
VITE_API_URL="https://yourdomain.com/api"
```

## Security Notes

- JWT_SECRET should be at least 32 characters long
- Use strong, unique passwords for database connections
- Keep API keys secure and never expose them in client-side code
- Use HTTPS in production
- Regularly rotate secrets and API keys
