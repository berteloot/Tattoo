const { PrismaClient } = require('@prisma/client');

// This script fixes the production database by adding the missing calendlyUrl column
// Run this script when connected to the production database

const prisma = new PrismaClient();

async function fixProductionDatabase() {
  try {
    console.log('🔧 Fixing production database...');
    
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
    
    // Verify the fix
    const verifyResult = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'artist_profiles' 
      AND column_name = 'calendlyUrl'
    `;
    
    console.log('🔍 Verification result:', verifyResult);
    
    // Test a simple query to make sure everything works
    const testQuery = await prisma.artistProfile.findMany({
      take: 1,
      select: {
        id: true,
        calendlyUrl: true
      }
    });
    
    console.log('✅ Test query successful:', testQuery);
    console.log('🎉 Production database fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing production database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixProductionDatabase()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 