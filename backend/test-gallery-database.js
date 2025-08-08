const { PrismaClient } = require('@prisma/client');

async function testGalleryDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Gallery Database Connection...\n');
    
    // Test 1: Check if we can connect to the database
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    
    // Test 2: Check if tattoo_gallery table exists
    console.log('2. Checking tattoo_gallery table...');
    const galleryCount = await prisma.tattooGallery.count();
    console.log(`✅ tattoo_gallery table exists with ${galleryCount} items\n`);
    
    // Test 3: Check if tattoo_gallery_likes table exists
    console.log('3. Checking tattoo_gallery_likes table...');
    const likesCount = await prisma.tattooGalleryLike.count();
    console.log(`✅ tattoo_gallery_likes table exists with ${likesCount} items\n`);
    
    // Test 4: Check if tattoo_gallery_comments table exists
    console.log('4. Checking tattoo_gallery_comments table...');
    const commentsCount = await prisma.tattooGalleryComment.count();
    console.log(`✅ tattoo_gallery_comments table exists with ${commentsCount} items\n`);
    
    // Test 5: Check if tattoo_gallery_views table exists
    console.log('5. Checking tattoo_gallery_views table...');
    const viewsCount = await prisma.tattooGalleryView.count();
    console.log(`✅ tattoo_gallery_views table exists with ${viewsCount} items\n`);
    
    // Test 6: Try to fetch gallery items with include
    console.log('6. Testing gallery fetch with includes...');
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
    console.log(`✅ Gallery fetch successful: ${galleryItems.length} items found\n`);
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
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

testGalleryDatabase();
