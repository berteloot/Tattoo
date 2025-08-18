# Tattooed World

A web application that connects clients with tattoo artists based on location, style, and specialty. Built with React, Node.js, and PostgreSQL.

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

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Google Maps API
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Server
PORT=3001
NODE_ENV=development

# Frontend
VITE_API_URL="http://localhost:3001"
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

## Deployment

### Render.com Setup

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
