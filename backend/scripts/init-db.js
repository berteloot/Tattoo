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