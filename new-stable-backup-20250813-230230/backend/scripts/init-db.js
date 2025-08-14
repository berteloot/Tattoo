const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initializeDatabase() {
  console.log('🔄 Starting database initialization...');
  
  try {
    // Test database connection
    console.log('🔄 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Run migrations
    console.log('🔄 Running database migrations...');
    const { execSync } = require('child_process');
    try {
      execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Database migrations completed');
    } catch (migrationError) {
      console.log('⚠️ Migration error (might be already up to date):', migrationError.message);
      
      // If migrations fail, try to baseline the database
      if (migrationError.message.includes('not empty') || migrationError.message.includes('baseline')) {
        console.log('🔄 Attempting to baseline existing production database...');
        try {
          execSync('npx prisma migrate resolve --applied 20250809213600_baseline_production_schema', { 
            stdio: 'inherit',
            cwd: process.cwd()
          });
          console.log('✅ Database baselined successfully');
        } catch (baselineError) {
          console.log('⚠️ Baseline error (continuing anyway):', baselineError.message);
        }
      }
    }

    // Check if admin user exists
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@tattoolocator.com' }
    });

    if (!adminExists) {
      console.log('🔄 Creating admin user...');
      const adminPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@tattoolocator.com',
          password: adminPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true,
          isVerified: true,
          phone: '+1234567890'
        }
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Fix production database issues
    console.log('🔄 Checking for production database fixes...');
    try {
      // Check if calendlyUrl column exists
      const result = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'artist_profiles' 
        AND column_name = 'calendlyUrl'
      `;
      
      if (result.length === 0) {
        console.log('❌ calendlyUrl column is missing. Adding it...');
        
        // Add the missing column
        await prisma.$executeRaw`
          ALTER TABLE "artist_profiles" ADD COLUMN "calendlyUrl" TEXT
        `;
        
        console.log('✅ calendlyUrl column added successfully!');
      } else {
        console.log('✅ calendlyUrl column already exists.');
      }
    } catch (fixError) {
      console.log('⚠️ Database fix error (might be already fixed):', fixError.message);
    }

    // Fix Flash table schema
    console.log('🔄 Fixing Flash table schema...');
    try {
      const flashFixes = [
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imagePublicId" TEXT;`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageWidth" INTEGER;`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageHeight" INTEGER;`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageFormat" TEXT;`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageBytes" INTEGER;`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "basePrice" DOUBLE PRECISION;`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "complexity" TEXT DEFAULT 'MEDIUM';`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "timeEstimate" INTEGER;`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isRepeatable" BOOLEAN DEFAULT true;`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "sizePricing" JSONB;`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isAvailable" BOOLEAN DEFAULT true;`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN DEFAULT true;`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN DEFAULT false;`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';`,
        `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
      ];
      
      for (const query of flashFixes) {
        try {
          await prisma.$executeRawUnsafe(query);
        } catch (error) {
          // Ignore errors - columns might already exist
        }
      }
      console.log('✅ Flash table schema fixed');
    } catch (fixError) {
      console.log('⚠️ Flash schema fix error:', fixError.message);
    }

    // Fix Specialties table schema
    console.log('🔄 Fixing Specialties table schema...');
    try {
      const specialtyFixes = [
        `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Traditional & Regional';`,
        `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "description" TEXT;`,
        `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`,
        `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`,
        `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
      ];
      
      for (const query of specialtyFixes) {
        try {
          await prisma.$executeRawUnsafe(query);
        } catch (error) {
          // Ignore errors - columns might already exist
        }
      }
      console.log('✅ Specialties table schema fixed');
    } catch (fixError) {
      console.log('⚠️ Specialties schema fix error:', fixError.message);
    }

    // Fix Favorites table schema
    console.log('🔄 Fixing Favorites table schema...');
    try {
      // Create favorites table if it doesn't exist
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "favorites" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "artistId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
        );
      `);

      // Add foreign key constraints if they don't exist
      const foreignKeyFixes = [
        `ALTER TABLE "favorites" ADD CONSTRAINT IF NOT EXISTS "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
        `ALTER TABLE "favorites" ADD CONSTRAINT IF NOT EXISTS "favorites_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;`
      ];
      
      for (const query of foreignKeyFixes) {
        try {
          await prisma.$executeRawUnsafe(query);
        } catch (error) {
          // Ignore errors - constraints might already exist
        }
      }

      // Add unique constraint if it doesn't exist
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "favorites" ADD CONSTRAINT IF NOT EXISTS "unique_user_artist_favorite" UNIQUE ("userId", "artistId");
        `);
      } catch (error) {
        // Ignore errors - constraint might already exist
      }

      // Add indexes if they don't exist
      const indexFixes = [
        `CREATE INDEX IF NOT EXISTS "idx_favorites_user_id" ON "favorites"("userId");`,
        `CREATE INDEX IF NOT EXISTS "idx_favorites_artist_id" ON "favorites"("artistId");`,
        `CREATE INDEX IF NOT EXISTS "idx_favorites_created_at" ON "favorites"("createdAt");`
      ];
      
      for (const query of indexFixes) {
        try {
          await prisma.$executeRawUnsafe(query);
        } catch (error) {
          // Ignore errors - indexes might already exist
        }
      }

      console.log('✅ Favorites table schema fixed');
    } catch (fixError) {
      console.log('⚠️ Favorites schema fix error:', fixError.message);
    }

    // Check if we need to seed the database
    const userCount = await prisma.user.count();
    if (userCount < 5) {
      console.log('🔄 Seeding database with sample data...');
      const { execSync } = require('child_process');
      try {
        execSync('node prisma/seed.js', { 
          stdio: 'inherit',
          cwd: process.cwd()
        });
        console.log('✅ Database seeding completed');
      } catch (seedError) {
        console.log('⚠️ Seeding error (might be already seeded):', seedError.message);
      }
    } else {
      console.log('✅ Database already has sufficient data');
    }

    console.log('🎉 Database initialization completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then((success) => {
      if (success) {
        console.log('✅ Database initialization successful');
        process.exit(0);
      } else {
        console.error('❌ Database initialization failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error during initialization:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase }; 