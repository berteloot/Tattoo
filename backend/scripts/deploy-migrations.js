const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deployMigrations() {
  try {
    console.log('🚀 Running deployment migrations...');
    
    // Run the existing migration scripts
    console.log('🔄 Fixing Flash table schema...');
    await require('./fix-flash-schema.js');
    
    console.log('🔄 Fixing Specialties table schema...');
    await require('./fix-specialties-schema.js');
    
    console.log('🔄 Fixing database schema...');
    await require('./fix-database-schema.js');
    
    console.log('🔄 Initializing database...');
    await require('./init-db.js');
    
    console.log('✅ All deployment migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Error running deployment migrations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run deployment migrations
deployMigrations();
