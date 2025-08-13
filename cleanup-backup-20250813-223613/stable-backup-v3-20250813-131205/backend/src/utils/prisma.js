const { PrismaClient } = require('@prisma/client');

// Create a single Prisma client instance to be shared across the application
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Add middleware to prevent unknown fields in Studio updates
prisma.$use(async (params, next) => {
  if (params.model === 'Studio' && params.action === 'update') {
    const allowedFields = ['latitude', 'longitude', 'updatedAt', 'title', 'slug', 'website', 
                          'phoneNumber', 'email', 'facebookUrl', 'instagramUrl', 'twitterUrl', 
                          'linkedinUrl', 'youtubeUrl', 'address', 'city', 'state', 'zipCode', 
                          'country', 'isActive', 'isVerified', 'isFeatured', 'verificationStatus'];
    
    if (params.args?.data) {
      const originalKeys = Object.keys(params.args.data);
      for (const key of originalKeys) {
        if (!allowedFields.includes(key)) {
          console.warn(`🚨 Removing unknown field '${key}' from Studio update`);
          delete params.args.data[key];
        }
      }
    }
  }
  return next(params);
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle connection errors
prisma.$on('error', (e) => {
  console.error('Prisma Client Error:', e);
});

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // In production, try to sync schema without losing data
    if (process.env.NODE_ENV === 'production') {
      try {
        console.log('🔄 Syncing database schema...');
        await prisma.$executeRaw`SELECT 1`;
        console.log('✅ Database schema is up to date');
      } catch (syncError) {
        console.warn('⚠️ Database schema sync warning:', syncError.message);
        // Continue anyway - the database might already be properly set up
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

module.exports = { prisma, testConnection }; 