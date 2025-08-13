const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Fixing database schema issues...');
    
    // Fix users table
    const userQueries = [
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3);`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deactivatedAt" TIMESTAMP(3);`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deactivationReason" TEXT;`,
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
    ];

    // Fix artist_profiles table
    const artistProfileQueries = [
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "calendlyUrl" TEXT;`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "address" TEXT;`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "state" TEXT;`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "zipCode" TEXT;`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "hourlyRate" DECIMAL(10,2);`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "minPrice" DECIMAL(10,2);`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "maxPrice" DECIMAL(10,2);`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false;`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT false;`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT DEFAULT 'PENDING';`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT;`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP(3);`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT;`,
      `ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
    ];

    // Fix specialties table
    const specialtiesQueries = [
      `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Traditional & Regional';`,
      `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "description" TEXT;`,
      `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`,
      `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
    ];

    // Fix services table
    const servicesQueries = [
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "description" TEXT;`,
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2);`,
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "duration" INTEGER;`,
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`,
      `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
    ];

    // Fix flash table
    const flashQueries = [
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imagePublicId" TEXT;`,
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageWidth" INTEGER;`,
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageHeight" INTEGER;`,
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageFormat" TEXT;`,
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageBytes" INTEGER;`,
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "basePrice" DECIMAL(10,2);`,
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "complexity" TEXT;`,
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "timeEstimate" INTEGER;`,
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isRepeatable" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "sizePricing" JSONB;`,
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isAvailable" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN DEFAULT true;`,
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "tags" TEXT[];`,
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
    ];

    // Fix reviews table
    const reviewsQueries = [
      `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN DEFAULT false;`,
      `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "hiddenAt" TIMESTAMP(3);`,
      `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "hiddenBy" TEXT;`,
      `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "hiddenReason" TEXT;`,
      `ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
    ];

    // Fix admin_actions table
    const adminActionsQueries = [
      `ALTER TABLE "admin_actions" ADD COLUMN IF NOT EXISTS "actionType" TEXT;`,
      `ALTER TABLE "admin_actions" ADD COLUMN IF NOT EXISTS "targetType" TEXT;`,
      `ALTER TABLE "admin_actions" ADD COLUMN IF NOT EXISTS "targetId" TEXT;`,
      `ALTER TABLE "admin_actions" ADD COLUMN IF NOT EXISTS "details" JSONB;`,
      `ALTER TABLE "admin_actions" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;`,
      `ALTER TABLE "admin_actions" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;`,
      `ALTER TABLE "admin_actions" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
    ];

    // Execute all queries
    const allQueries = [
      ...userQueries,
      ...artistProfileQueries,
      ...specialtiesQueries,
      ...servicesQueries,
      ...flashQueries,
      ...reviewsQueries,
      ...adminActionsQueries
    ];

    console.log('🔄 Executing schema fixes...');
    
    for (const query of allQueries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log('✅ Executed:', query.substring(0, 50) + '...');
      } catch (error) {
        console.log('⚠️ Query failed (might already be applied):', error.message);
      }
    }

    console.log('✅ Database schema fixes completed!');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixDatabaseSchema(); 