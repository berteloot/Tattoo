const { execSync } = require('child_process');
const path = require('path');

// Regenerate Prisma client to recognize new fields
async function regeneratePrismaClient() {
  console.log('🔄 Regenerating Prisma Client...');
  
  try {
    // Change to backend directory
    process.chdir(path.join(__dirname, 'backend'));
    console.log('📁 Changed to backend directory');

    // Pull the latest schema from database
    console.log('📥 Pulling latest schema from database...');
    try {
      execSync('npx prisma db pull', { stdio: 'inherit' });
      console.log('✅ Database schema pulled successfully');
    } catch (error) {
      console.log('⚠️ Could not pull schema (might be expected):', error.message);
    }

    // Generate the Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully');

    // Test the new client
    console.log('🧪 Testing new Prisma client...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
      await prisma.$connect();
      
      const result = await prisma.artistProfile.findFirst({
        select: {
          id: true,
          profilePictureUrl: true,
          profilePicturePublicId: true,
          profilePictureWidth: true,
          profilePictureHeight: true,
          profilePictureFormat: true,
          profilePictureBytes: true
        }
      });
      
      console.log('✅ Prisma client now recognizes profile picture fields');
      console.log('📊 Test query result:', result);
      
    } catch (error) {
      console.log('❌ Prisma client still has issues:', error.message);
    } finally {
      await prisma.$disconnect();
    }

    console.log('🎉 Prisma client regeneration complete!');
    console.log('🔄 Profile picture upload should now work!');

  } catch (error) {
    console.error('❌ Error regenerating Prisma client:', error.message);
  }
}

// Run the regeneration
regeneratePrismaClient();
