const { execSync } = require('child_process');

async function regeneratePrismaClient() {
  try {
    console.log('🔄 Regenerating Prisma Client...\n');
    
    // Generate Prisma client
    console.log('1. Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated\n');
    
    // Check if generation was successful
    console.log('2. Verifying Prisma client...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test the connection
    await prisma.$connect();
    console.log('✅ Prisma client connection successful\n');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database connection verified: ${userCount} users found\n`);
    
    await prisma.$disconnect();
    console.log('🎉 Prisma client regeneration successful!');
    
  } catch (error) {
    console.error('❌ Error regenerating Prisma client:', error);
    process.exit(1);
  }
}

regeneratePrismaClient(); 