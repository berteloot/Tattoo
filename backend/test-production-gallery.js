const { PrismaClient } = require('@prisma/client');

async function testProductionGallery() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Production Gallery Endpoint...\n');
    
    // Test 1: Basic connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');
    
    // Test 2: Check if all required tables exist
    console.log('2. Checking all required tables...');
    
    const tables = [
      'tattoo_gallery',
      'tattoo_gallery_likes', 
      'tattoo_gallery_comments',
      'tattoo_gallery_views',
      'artist_profiles',
      'users'
    ];
    
    for (const table of tables) {
      try {
        const result = await prisma.$queryRaw`SELECT COUNT(*) as count FROM ${prisma.raw(table)}`;
        console.log(`✅ ${table} table exists`);
      } catch (error) {
        console.error(`❌ ${table} table missing:`, error.message);
      }
    }
    console.log('');
    
    // Test 3: Check artist_profiles columns
    console.log('3. Checking artist_profiles columns...');
    try {
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'artist_profiles' 
        AND column_name LIKE 'profilePicture%'
        ORDER BY column_name;
      `;
      console.log('✅ Profile picture columns found:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    } catch (error) {
      console.error('❌ Error checking columns:', error.message);
    }
    console.log('');
    
    // Test 4: Test basic gallery query
    console.log('4. Testing basic gallery query...');
    try {
      const galleryCount = await prisma.tattooGallery.count();
      console.log(`✅ Gallery count: ${galleryCount} items\n`);
    } catch (error) {
      console.error('❌ Gallery count failed:', error.message);
    }
    
    // Test 5: Test gallery with artist include
    console.log('5. Testing gallery with artist include...');
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
          }
        }
      });
      console.log(`✅ Gallery with artist include: ${galleryItems.length} items found\n`);
    } catch (error) {
      console.error('❌ Gallery with artist include failed:', error.message);
      console.error('Error details:', {
        name: error.name,
        code: error.code,
        meta: error.meta
      });
    }
    
    // Test 6: Test gallery with _count
    console.log('6. Testing gallery with _count...');
    try {
      const galleryItems = await prisma.tattooGallery.findMany({
        take: 1,
        include: {
          _count: {
            select: {
              views: true,
              likes: true,
              comments: true
            }
          }
        }
      });
      console.log(`✅ Gallery with _count: ${galleryItems.length} items found\n`);
    } catch (error) {
      console.error('❌ Gallery with _count failed:', error.message);
      console.error('Error details:', {
        name: error.name,
        code: error.code,
        meta: error.meta
      });
    }
    
    // Test 7: Test full gallery query (like the API endpoint)
    console.log('7. Testing full gallery query (API endpoint)...');
    try {
      const where = { isHidden: false };
      
      const galleryItems = await prisma.tattooGallery.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0
      });
      
      console.log(`✅ Full gallery query successful: ${galleryItems.length} items found\n`);
      
      // Test 8: Test user likes query
      console.log('8. Testing user likes query...');
      if (galleryItems.length > 0) {
        try {
          const userLikeItems = await prisma.tattooGalleryLike.findMany({
            where: {
              userId: 'test-user-id',
              galleryItemId: {
                in: galleryItems.map(item => item.id)
              }
            },
            select: {
              galleryItemId: true
            }
          });
          console.log(`✅ User likes query successful: ${userLikeItems.length} likes found\n`);
        } catch (error) {
          console.error('❌ User likes query failed:', error.message);
        }
      }
      
    } catch (error) {
      console.error('❌ Full gallery query failed:', error.message);
      console.error('Error details:', {
        name: error.name,
        code: error.code,
        meta: error.meta
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductionGallery();
