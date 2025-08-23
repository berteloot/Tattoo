# 🚀 TATTOO ARTIST LOCATOR - STABLE VERSION 1.0.0

## 📋 Quick Start

**Want to get running immediately?** Run the automated setup script:

```bash
./quick-start-stable.sh
```

This script will:
- ✅ Check system requirements
- ✅ Install all dependencies
- ✅ Set up environment files
- ✅ Configure the database
- ✅ Build the frontend
- ✅ Start the application

---

## 🎯 What You're Getting

This is a **production-ready, fully functional** tattoo artist locator application that connects clients with tattoo artists based on location, style, and specialty.

### ✨ Key Features
- **🔐 Complete Authentication System** - JWT-based with role management
- **👥 Role-Based Access Control** - CLIENT, ARTIST, ADMIN roles
- **🎨 Artist Profiles** - Complete portfolio management with Google Maps
- **🏢 Admin Dashboard** - Full user management and content moderation
- **📱 Responsive Design** - Works perfectly on all devices
- **🗺️ Google Maps Integration** - Interactive location-based search
- **📊 Analytics Dashboard** - Performance metrics for artists
- **🔒 Enterprise Security** - Rate limiting, validation, audit trails

---

## 🛠️ Technology Stack

### Frontend
- **React 18** + **Vite** - Modern, fast development
- **Tailwind CSS** - Beautiful, responsive design
- **React Router** - Smooth navigation
- **React Hook Form** - Form handling and validation
- **Axios** - API communication
- **Google Maps API** - Location services

### Backend
- **Node.js** + **Express** - Robust API server
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Reliable data storage
- **JWT Authentication** - Secure user sessions
- **Rate Limiting** - Protection against abuse
- **Input Validation** - Security and data integrity

### Deployment
- **Render.com** - Single domain architecture
- **PostgreSQL Database** - Managed database service
- **Static File Serving** - Optimized frontend delivery

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL** - Local installation or cloud service
- **Git** - For version control

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd tattoo-app
```

### 2. Automated Setup (Recommended)
```bash
./quick-start-stable.sh
```

### 3. Manual Setup (Alternative)
```bash
# Install dependencies
npm run install:all

# Set up environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your configuration
# Then run:
npm run db:setup
npm run build
npm run dev
```

---

## ⚙️ Environment Configuration

### Backend (.env)
```bash
# Required
DATABASE_URL="postgresql://username:password@localhost:5432/tattoo_app"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"

# Optional
SENDGRID_API_KEY="your-sendgrid-api-key"
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
```

### Frontend (.env)
```bash
# Required
VITE_API_URL="http://localhost:3001"

# Optional
VITE_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
VITE_NODE_ENV="development"
```

---

## 🗄️ Database Setup

### Option 1: Local PostgreSQL
```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt-get install postgresql  # Ubuntu

# Create database
createdb tattoo_app

# Run migrations
cd backend
npx prisma migrate deploy
npx prisma db seed
```

### Option 2: Cloud Database
- **Render.com** - Free tier available
- **Supabase** - Generous free tier
- **Neon** - Serverless PostgreSQL
- **Railway** - Simple deployment

---

## 🚀 Running the Application

### Development Mode
```bash
npm run dev          # Frontend + Backend
npm run dev:backend  # Backend only
npm run dev:frontend # Frontend only
```

### Production Mode
```bash
npm run build        # Build frontend
npm start           # Start production server
```

### Available Scripts
```bash
npm run dev          # Development mode
npm run build        # Production build
npm run start        # Production start
npm run test         # Run tests
npm run db:setup     # Database setup
npm run db:seed      # Seed database
npm run clean        # Clean dependencies
```

---

## 🌐 Access Points

Once running, your application will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **API Documentation**: http://localhost:3001/api/health

---

## 🔐 Test Accounts

The system comes with pre-configured test accounts:

```
Admin User:
  Email: berteloot@gmail.com
  Password: admin123
  Role: ADMIN

Client User:
  Email: client@example.com
  Password: client123
  Role: CLIENT

Artist User:
  Email: artist@example.com
  Password: artist123
  Role: ARTIST

Pending Artist:
  Email: pending@example.com
  Password: pending123
  Role: ARTIST (pending verification)
```

---

## 📱 User Roles & Permissions

### 🔵 CLIENT Role (Default)
- Browse artists and studios
- View artist portfolios
- Leave reviews and ratings
- Edit own profile
- Save favorites

### 🎨 ARTIST Role
- All client permissions
- Create and manage artist profile
- Upload portfolio items
- Set location and specialties
- Access analytics dashboard
- Respond to reviews

### 🔴 ADMIN Role
- Full system control
- User management
- Artist verification
- Content moderation
- System analytics
- Audit trail access

---

## 🚀 Deployment

### Render.com (Recommended)
This application is configured for single-click deployment on Render.com:

1. **Fork/Clone** this repository
2. **Connect** to Render.com
3. **Deploy** using the `render.yaml` configuration
4. **Set environment variables** in Render dashboard
5. **Access** your live application

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# Or use PM2 for process management
pm2 start backend/src/server.js --name "tattoo-app"
```

---

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check your DATABASE_URL in backend/.env
# Ensure PostgreSQL is running
# Verify database exists
createdb tattoo_app
```

#### Frontend Build Failed
```bash
# Clear node_modules and reinstall
npm run clean
npm run install:all
```

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3001
# Kill the process or change PORT in .env
```

#### Authentication Issues
```bash
# Verify JWT_SECRET is set
# Check CORS_ORIGIN configuration
# Ensure database migrations are applied
```

### Getting Help
1. **Check logs** in the terminal
2. **Verify environment** variables
3. **Review** the error messages
4. **Check** the troubleshooting section in docs/

---

## 📚 Documentation

### Core Documentation
- **STABLE_VERSION_SUMMARY.md** - Complete feature overview
- **DEPLOYMENT_CHECKLIST.md** - Production deployment guide
- **docs/ENVIRONMENT_SETUP.md** - Environment configuration
- **docs/ADMIN_SYSTEM.md** - Admin system documentation
- **docs/ROLE_PERMISSIONS.md** - User roles and permissions

### API Documentation
- **Health Check**: `GET /api/health`
- **Authentication**: `POST /api/auth/*`
- **Artists**: `GET/POST/PUT /api/artists/*`
- **Admin**: `GET/PUT /api/admin/*`
- **Reviews**: `GET/POST/PUT /api/reviews/*`

---

## 🔮 What's Next?

### Immediate Next Steps
1. **Customize** the application for your needs
2. **Configure** email services (SendGrid)
3. **Set up** Google Maps API key
4. **Deploy** to production
5. **Monitor** performance and usage

### Future Enhancements
- Real-time messaging system
- Appointment booking
- Payment processing
- Advanced analytics
- Mobile app development
- Multi-language support

---

## 🎉 Success!

You now have a **production-ready, enterprise-grade** tattoo artist locator application running locally!

### What You've Accomplished
- ✅ **Full-stack application** with React frontend and Node.js backend
- ✅ **Complete authentication system** with role-based access control
- ✅ **Artist management system** with portfolio and analytics
- ✅ **Admin dashboard** for complete system control
- ✅ **Google Maps integration** for location-based services
- ✅ **Responsive design** that works on all devices
- ✅ **Security hardened** with rate limiting and validation
- ✅ **Production ready** for deployment

### Ready to Deploy?
Check out the **DEPLOYMENT_CHECKLIST.md** for a step-by-step guide to getting your application live on the internet!

---

**Happy coding! 🚀**

*For support, check the documentation or create an issue in the repository.*
