const { PrismaClient } = require('@prisma/client');

async function testGalleryEndpoint() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing Gallery Endpoint Logic...\n');
    
    // Simulate the exact gallery endpoint logic
    console.log('1. Setting up query parameters...');
    const artistId = undefined; // No artistId for public view
    const style = undefined;
    const location = undefined;
    const featured = undefined;
    const limit = 20;
    const offset = 0;
    
    console.log('2. Building where clause...');
    const where = {
      isHidden: false
    };
    
    // If artistId is provided (artist viewing their own gallery), show all their items
    // Otherwise, show all public items (no approval required)
    if (artistId) {
      where.artistId = artistId;
      console.log('   - Artist ID filter added');
    } else {
      console.log('   - No artist ID filter (public view)');
    }
    
    if (style) where.tattooStyle = style;
    if (location) where.bodyLocation = location;
    if (featured === 'true') where.isFeatured = true;
    
    console.log(`   - Final where clause:`, JSON.stringify(where, null, 2));
    
    console.log('\n3. Executing gallery query...');
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
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    console.log(`✅ Gallery query successful: ${galleryItems.length} items found\n`);
    
    console.log('4. Processing user likes...');
    // If user is authenticated, check which items they've liked
    let userLikes = new Set();
    const req = { user: null }; // Simulate no authenticated user
    
    if (req.user && req.user.id) {
      console.log('   - User is authenticated, checking likes...');
      const userLikeItems = await prisma.tattooGalleryLike.findMany({
        where: {
          userId: req.user.id,
          galleryItemId: {
            in: galleryItems.map(item => item.id)
          }
        },
        select: {
          galleryItemId: true
        }
      });
      userLikes = new Set(userLikeItems.map(like => like.galleryItemId));
      console.log(`   - User has liked ${userLikes.size} items`);
    } else {
      console.log('   - No authenticated user');
    }
    
    console.log('\n5. Adding userLiked property...');
    // Add userLiked property to each item
    const itemsWithUserLikes = galleryItems.map(item => ({
      ...item,
      userLiked: userLikes.has(item.id) || false
    }));
    
    console.log(`✅ Items processed: ${itemsWithUserLikes.length} items\n`);
    
    console.log('6. Getting total count...');
    const total = await prisma.tattooGallery.count({ where });
    console.log(`✅ Total count: ${total}\n`);
    
    console.log('7. Building response...');
    const response = {
      success: true,
      data: {
        items: itemsWithUserLikes,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    };
    
    console.log('✅ Response built successfully!');
    console.log(`   - Items: ${response.data.items.length}`);
    console.log(`   - Total: ${response.data.pagination.total}`);
    console.log(`   - Has more: ${response.data.pagination.hasMore}`);
    
    // Show first item details
    if (response.data.items.length > 0) {
      const firstItem = response.data.items[0];
      console.log(`\n📋 First item details:`);
      console.log(`   - ID: ${firstItem.id}`);
      console.log(`   - Title: ${firstItem.title}`);
      console.log(`   - Artist: ${firstItem.artist?.user?.firstName} ${firstItem.artist?.user?.lastName}`);
      console.log(`   - Likes: ${firstItem._count?.likes || 0}`);
      console.log(`   - User liked: ${firstItem.userLiked}`);
    }
    
    console.log('\n🎉 Gallery endpoint logic test successful!');
    
  } catch (error) {
    console.error('❌ Gallery endpoint test failed:', error);
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

testGalleryEndpoint();
