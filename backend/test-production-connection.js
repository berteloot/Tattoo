const { PrismaClient } = require('@prisma/client');

async function testProductionConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Production Database Connection...\n');
    
    // Test 1: Basic connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    
    // Test 2: Simple query
    console.log('2. Testing simple query...');
    const userCount = await prisma.user.count();
    console.log(`✅ User count: ${userCount}\n`);
    
    // Test 3: Gallery count
    console.log('3. Testing gallery count...');
    const galleryCount = await prisma.tattooGallery.count();
    console.log(`✅ Gallery count: ${galleryCount}\n`);
    
    // Test 4: Artist profiles count
    console.log('4. Testing artist profiles count...');
    const artistCount = await prisma.artistProfile.count();
    console.log(`✅ Artist profiles count: ${artistCount}\n`);
    
    // Test 5: Check if gallery items have artists
    console.log('5. Testing gallery with artists...');
    const galleryWithArtists = await prisma.tattooGallery.findMany({
      take: 1,
      select: {
        id: true,
        title: true,
        artistId: true,
        artist: {
          select: {
            id: true,
            studioName: true,
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
    
    if (galleryWithArtists.length > 0) {
      const item = galleryWithArtists[0];
      console.log(`✅ Gallery item found: "${item.title}" by ${item.artist?.user?.firstName} ${item.artist?.user?.lastName}\n`);
    } else {
      console.log('⚠️ No gallery items found\n');
    }
    
    console.log('🎉 Production database connection test successful!');
    
  } catch (error) {
    console.error('❌ Production database test failed:', error);
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

testProductionConnection();
