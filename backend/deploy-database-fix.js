const { PrismaClient } = require('@prisma/client');

async function deployDatabaseFix() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🚀 Deploying Database Fix to Production...\n');
    
    // Test 1: Check current database state
    console.log('1. Checking current database state...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    
    // Test 2: Check if profile picture columns exist
    console.log('2. Checking profile picture columns...');
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'artist_profiles' 
        AND column_name LIKE 'profilePicture%'
        ORDER BY column_name;
      `;
      
      if (columns.length === 0) {
        console.log('❌ Profile picture columns missing - adding them...\n');
        
        // Add the missing columns
        console.log('3. Adding profilePictureUrl column...');
        await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureUrl" TEXT;`;
        console.log('✅ profilePictureUrl column added\n');
        
        console.log('4. Adding profilePicturePublicId column...');
        await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePicturePublicId" TEXT;`;
        console.log('✅ profilePicturePublicId column added\n');
        
        console.log('5. Adding profilePictureWidth column...');
        await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureWidth" INTEGER;`;
        console.log('✅ profilePictureWidth column added\n');
        
        console.log('6. Adding profilePictureHeight column...');
        await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureHeight" INTEGER;`;
        console.log('✅ profilePictureHeight column added\n');
        
        console.log('7. Adding profilePictureFormat column...');
        await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureFormat" TEXT;`;
        console.log('✅ profilePictureFormat column added\n');
        
        console.log('8. Adding profilePictureBytes column...');
        await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureBytes" INTEGER;`;
        console.log('✅ profilePictureBytes column added\n');
        
      } else {
        console.log('✅ Profile picture columns already exist:');
        columns.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type}`);
        });
        console.log('');
      }
      
    } catch (error) {
      console.error('❌ Error checking/adding columns:', error);
      throw error;
    }
    
    // Test 3: Test gallery query
    console.log('9. Testing gallery query...');
    try {
      const galleryItems = await prisma.tattooGallery.findMany({
        take: 1,
        include: {
          artist: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          },
          _count: {
            select: {
              views: true,
              likes: true,
              comments: true
            }
          }
        }
      });
      console.log(`✅ Gallery query successful: ${galleryItems.length} items found\n`);
    } catch (error) {
      console.error('❌ Gallery query failed:', error);
      throw error;
    }
    
    // Test 4: Test artist query
    console.log('10. Testing artist query...');
    try {
      const artist = await prisma.artistProfile.findFirst({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      });
      console.log(`✅ Artist query successful: ${artist ? 'Artist found' : 'No artist found'}\n`);
    } catch (error) {
      console.error('❌ Artist query failed:', error);
      throw error;
    }
    
    console.log('🎉 Database fix deployed successfully!');
    console.log('🔄 Production server should now work correctly.');
    
  } catch (error) {
    console.error('❌ Database fix deployment failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

deployDatabaseFix();
