const { PrismaClient } = require('@prisma/client');

// Check if Prisma client is in sync with database schema
async function checkPrismaSync() {
  console.log('🔍 Checking Prisma Client Sync...');
  
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('✅ Connected to database');

    // Try to query the profile picture fields
    console.log('🔍 Testing profile picture fields...');
    
    try {
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
      
      console.log('✅ Prisma client recognizes profile picture fields');
      console.log('📊 Sample data:', result);
      
    } catch (error) {
      console.log('❌ Prisma client does not recognize profile picture fields');
      console.log('🔧 Error:', error.message);
      console.log('🔄 Need to regenerate Prisma client');
    }

    // Check the actual database schema
    console.log('🔍 Checking database schema...');
    
    const schemaResult = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'artist_profiles' 
      AND column_name LIKE 'profile_picture%'
      ORDER BY column_name;
    `;
    
    console.log('📊 Database schema for profile picture fields:');
    schemaResult.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

  } catch (error) {
    console.error('❌ Error checking Prisma sync:', error.message);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the check
checkPrismaSync();
