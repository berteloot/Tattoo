# Tattooed World

A web application that connects clients with tattoo artists based on location, style, and specialty. Built with React, Node.js, and PostgreSQL.

## ⚠️ CRITICAL SECURITY REQUIREMENTS

### Google Maps API Key Security

**🚨 IMPORTANT: Your Google Maps API key is exposed to the client and MUST be properly restricted**

The `VITE_GOOGLE_MAPS_API_KEY` environment variable is used in the frontend and will be visible to users. This is normal for Google Maps JavaScript API, but **requires strict domain restrictions** to prevent abuse.

#### Required Security Measures:

1. **HTTP Referrer Restrictions** (MANDATORY)
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services > Credentials
   - Select your Google Maps API key
   - Under "Application restrictions", select "HTTP referrers (web sites)"
   - Add ONLY your production domains:
     ```
     https://tattooed-world-backend.onrender.com/*
     https://yourdomain.com/*
     http://localhost:5173/* (for development)
     ```

2. **API Restrictions** (MANDATORY)
   - Under "API restrictions", select "Restrict key"
   - Enable ONLY these APIs:
     - Maps JavaScript API
     - Geocoding API
     - Places API (if using address autocomplete)

3. **Billing Alerts** (RECOMMENDED)
   - Set up billing alerts in Google Cloud Console
   - Monitor API usage to detect potential abuse

#### Security Risks of Unrestricted Keys:
- ❌ **API Abuse**: Unauthorized usage on other websites
- ❌ **Billing Impact**: Unexpected charges from malicious usage
- ❌ **Rate Limiting**: Your quota consumed by other sites
- ❌ **Service Disruption**: API access blocked due to abuse

### Other Security Considerations

- **JWT_SECRET**: Must be a strong, unique secret (32+ characters)
- **DATABASE_URL**: Never commit to version control
- **CORS_ORIGINS**: Restrict to only your production domains
- **Rate Limiting**: Configured to prevent abuse

## Features

### For Clients
- Browse tattoo artists on an interactive map
- Filter by specialty, rating, and style
- View detailed artist profiles with bio, services, and flash
- Leave reviews and ratings
- Book appointments

### For Artists
- Create and manage public profiles
- Upload flash and portfolio images
- Set specialties, services, and pricing
- Respond to reviews
- View analytics dashboard

### For Admins
- Manage user accounts
- Moderate reviews and content
- Approve artist registrations

## Tech Stack

- **Frontend**: React + Vite, Google Maps API, Tailwind CSS
- **Backend**: Node.js + Express, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **File Storage**: Cloudinary/S3
- **Deployment**: Render.com

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Google Maps API key
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tattoo-app.git
   cd tattoo-app
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Set up the database**
   ```bash
   cd ../backend
   npx prisma generate
   npx prisma db push
   ```

5. **Start development servers**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory, in new terminal)
   cd ../frontend
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tattoo_app"

# JWT Secret (MUST be 32+ characters, unique per environment)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Google Maps API (⚠️ MUST be restricted to your domains)
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL="http://localhost:3001"

# CORS (restrict to your domains only)
CORS_ORIGINS="http://localhost:5173,https://yourdomain.com"
```

## Troubleshooting

### Registration Issues
If you encounter a 500 error when trying to register an account:

1. **Check Environment Variables**: Ensure `DATABASE_URL` and `JWT_SECRET` are properly configured
2. **Database Connection**: Verify your PostgreSQL database is running and accessible
3. **API Endpoints**: The frontend should call `/api/auth/register` (not `/auth/register`)

### Common Issues
- **500 Internal Server Error**: Usually indicates missing environment variables or database connection issues
- **CORS Errors**: Ensure `CORS_ORIGIN` is set to your frontend URL
- **JWT Errors**: Verify `JWT_SECRET` is set and not empty

### Development vs Production
- **Development**: Uses localhost URLs and development database
- **Production**: Uses Render.com URLs and production database
- **Environment Variables**: Must be configured separately for each environment

## Project Structure

```
tattoo-app/
├── frontend/              # React + Vite application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API service functions
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utility functions
│   └── prisma/           # Database schema and migrations
├── docs/                 # Documentation
└── .env.example          # Environment template
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Artists
- `GET /api/artists` - Get all artists
- `GET /api/artists/:id` - Get artist by ID
- `POST /api/artists` - Create artist profile
- `PUT /api/artists/:id` - Update artist profile

### Flash/Portfolio
- `GET /api/flash` - Get all flash
- `POST /api/flash` - Upload new flash
- `DELETE /api/flash/:id` - Delete flash

### Reviews
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review

## Security Checklist

Before deploying to production, ensure you have completed ALL security measures:

### ✅ Required Security Measures

- [ ] **Google Maps API Key Restricted**
  - [ ] HTTP referrer restrictions set to your domains only
  - [ ] API restrictions enabled (Maps JavaScript, Geocoding, Places only)
  - [ ] Billing alerts configured

- [ ] **Environment Variables Secured**
  - [ ] JWT_SECRET is 32+ characters and unique
  - [ ] DATABASE_URL is production database (not localhost)
  - [ ] CORS_ORIGINS restricted to production domains only
  - [ ] NODE_ENV set to "production"

- [ ] **Database Security**
  - [ ] Production database has strong password
  - [ ] Database access restricted to your application only
  - [ ] Regular backups configured

- [ ] **Application Security**
  - [ ] All security fixes deployed (CSP, logging, JWT, rate limiting)
  - [ ] HTTPS enforced in production
  - [ ] Security headers enabled (Helmet.js)

### 🚨 Security Risks of Incomplete Setup

- **API Key Abuse**: Unrestricted Google Maps key can be used on other websites
- **Unauthorized Access**: Weak JWT secrets can be compromised
- **Data Breaches**: Insecure database connections
- **Service Disruption**: Rate limiting bypasses and abuse

## Deployment

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables in Render dashboard

### Database Setup

1. Create a PostgreSQL database on Render
2. Update `DATABASE_URL` in environment variables
3. Run migrations: `npx prisma db push`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue in the GitHub repository. # Updated Thu Jul 31 14:44:32 CEST 2025
# Production deployment fix - Fri Aug  1 18:43:16 CEST 2025
