# Tattoo Artist Locator - Setup Guide

## 🚀 Quick Start

This guide will help you set up the Tattoo Artist Locator application on your local machine.

## 📋 Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (version 8 or higher)
- **PostgreSQL** database
- **Google Maps API Key** (optional, for map functionality)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
# Install root dependencies (concurrently for running both frontend and backend)
npm install

# Install all dependencies (frontend and backend)
npm run install:all
```

### 2. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a new database:
   ```sql
   CREATE DATABASE tattoo_app;
   ```

#### Option B: Cloud Database (Recommended for production)
- Use services like:
  - [Neon](https://neon.tech) (PostgreSQL with generous free tier)
  - [Supabase](https://supabase.com) (PostgreSQL with additional features)
  - [Railway](https://railway.app) (Easy PostgreSQL hosting)

### 3. Environment Configuration

#### Backend Environment (.env file in backend/ directory)

Create a `.env` file in the `backend/` directory:

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

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Configuration (Optional - for password reset functionality)
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="your-verified-sender@yourdomain.com"
FRONTEND_URL="http://localhost:5173"

# File Upload Configuration (Optional - for image uploads)
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/webp"

# Cloudinary Configuration (Optional - for image storage)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

#### Frontend Environment (.env file in frontend/ directory)

Create a `.env` file in the `frontend/` directory:

```bash
# API Configuration
VITE_API_URL="http://localhost:3001"

# Google Maps API (Optional)
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Environment
VITE_NODE_ENV="development"
```

### 4. Database Migration and Seeding

```bash
# Run database migrations
npm run db:migrate

# Seed the database with initial data
npm run db:seed
```

### 5. Start the Application

#### Development Mode (Recommended)
```bash
# Start both frontend and backend in development mode
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:5173`

#### Production Mode
```bash
# Build and start in production mode
npm run build
npm start
```

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "npm start" Error in Root Directory
**Problem**: `npm start` fails because there's no package.json in the root directory.

**Solution**: Use the new root package.json that includes all necessary scripts:
```bash
npm run dev          # For development
npm start            # For production
```

#### 2. Database Connection Issues
**Problem**: Backend can't connect to the database.

**Solutions**:
- Check your `DATABASE_URL` in the backend `.env` file
- Ensure PostgreSQL is running
- Verify database credentials
- Test connection: `npm run db:studio`

#### 3. Login/Sign-in Errors
**Problem**: Users can't log in or register.

**Solutions**:
- ✅ **Fixed**: Updated AuthContext to handle response structure properly
- ✅ **Fixed**: Added proper error handling for API responses
- Check that JWT_SECRET is set in backend `.env`
- Verify database migrations have been run

#### 4. Google Maps Deprecation Warning
**Problem**: Console shows deprecation warning for `google.maps.Marker`.

**Solution**: ✅ **Fixed**: Updated ArtistMap component to avoid deprecated Marker usage. The map will show a fallback list of artists when no API key is provided.

#### 5. CORS Issues
**Problem**: Frontend can't communicate with backend.

**Solution**: Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL.

#### 6. Environment Variables Not Loading
**Problem**: Environment variables are undefined.

**Solutions**:
- Ensure `.env` files are in the correct directories
- Restart the development servers after changing `.env` files
- Check that variable names match exactly (case-sensitive)

### API Endpoints

The backend provides the following API endpoints:

- **Authentication**: `/api/auth/*`
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login user
  - `GET /api/auth/me` - Get current user profile
  - `PUT /api/auth/profile` - Update user profile

- **Artists**: `/api/artists/*`
  - `GET /api/artists` - Get all artists
  - `GET /api/artists/:id` - Get specific artist
  - `POST /api/artists` - Create artist profile
  - `PUT /api/artists/:id` - Update artist profile

- **Flash/Portfolio**: `/api/flash/*`
- **Reviews**: `/api/reviews/*`
- **Specialties**: `/api/specialties/*`
- **Services**: `/api/services/*`

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend
```

## 📦 Database Management

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Reset database (WARNING: This will delete all data)
npm run db:reset

# Generate Prisma client
npm run db:generate
```

## 🚀 Deployment

### Render.com Deployment

The project includes a `render.yaml` file for easy deployment on Render.com:

1. Connect your GitHub repository to Render
2. Render will automatically detect the configuration
3. Set environment variables in Render dashboard
4. Deploy!

### Manual Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Start the server: `npm start`

## 📝 Development Notes

### Recent Fixes Applied

1. **Root Package.json**: Added comprehensive scripts for managing the full-stack application
2. **AuthContext**: Fixed response handling to prevent login/sign-in errors
3. **Google Maps**: Removed deprecated Marker usage to eliminate console warnings
4. **Error Handling**: Improved error handling throughout the authentication flow

### File Structure

```
tattoo-app/
├── frontend/          # React + Vite app
├── backend/           # Node.js + Express API
├── package.json       # Root package.json with scripts
├── .env.example       # Environment template
├── render.yaml        # Render deployment config
└── README.md          # This file
```

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure database is running and accessible
4. Check the console for specific error messages
5. Review the API documentation in the backend routes

## 📄 License

MIT License - see LICENSE file for details. 