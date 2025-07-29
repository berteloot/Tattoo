const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    console.log('🔄 Initializing database...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if database has data
    const userCount = await prisma.user.count();
    console.log(`📊 Found ${userCount} users in database`);
    
    if (userCount === 0) {
      console.log('🌱 Database is empty, running seed...');
      // Run seed if database is empty
      const { execSync } = require('child_process');
      execSync('node prisma/seed.js', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully');
    } else {
      console.log('✅ Database already has data, skipping seed');
    }
    
    console.log('🎉 Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase }; 