const { PrismaClient } = require('@prisma/client');

async function fixProductionDatabase() {
  console.log('🔧 Fixing Production Database...\n');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('Please set it to your production database URL:');
    console.log('export DATABASE_URL="your-production-database-url"');
    console.log('Then run: node fix-production-db.js');
    process.exit(1);
  }
  
  console.log('📊 Connecting to database:', process.env.DATABASE_URL.substring(0, 50) + '...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test 1: Check database connection
    console.log('\n1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    
    // Test 2: Check if profile picture columns exist
    console.log('2. Checking profile picture columns...');
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
    
    // Test 3: Test gallery query
    console.log('9. Testing gallery query...');
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
    
    // Test 4: Test artist query
    console.log('10. Testing artist query...');
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
    
    console.log('🎉 Production database fix completed successfully!');
    console.log('🔄 All API endpoints should now work correctly.');
    
  } catch (error) {
    console.error('❌ Production database fix failed:', error);
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

fixProductionDatabase();
