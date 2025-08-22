const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testGalleryEndpoints() {
  try {
    console.log('🧪 Testing gallery endpoints for cross-artist filtering...');
    
    // Get a few artist IDs to test with
    const artists = await prisma.artistProfile.findMany({
      select: {
        id: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      take: 3
    });

    if (artists.length === 0) {
      console.log('❌ No artists found in database');
      return;
    }

    console.log('\n🎨 Found artists:');
    artists.forEach(artist => {
      console.log(`- ${artist.user.email} (${artist.user.firstName} ${artist.user.lastName}): ${artist.id}`);
    });

    // Test gallery endpoint for each artist
    for (const artist of artists) {
      console.log(`\n🔍 Testing gallery endpoint for ${artist.user.email}:`);
      
      // Simulate the gallery query that the frontend would make
      const galleryItems = await prisma.tattooGallery.findMany({
        where: {
          artistId: artist.id,
          isHidden: false
        },
        select: {
          id: true,
          title: true,
          artistId: true
        }
      });

      console.log(`  Gallery items: ${galleryItems.length}`);
      galleryItems.forEach(item => {
        console.log(`    - ${item.title} (ID: ${item.id}, Artist ID: ${item.artistId})`);
      });

      // Test flash endpoint for each artist
      console.log(`\n🔍 Testing flash endpoint for ${artist.user.email}:`);
      
      const flashItems = await prisma.flash.findMany({
        where: {
          artistId: artist.id
        },
        select: {
          id: true,
          title: true,
          artistId: true
        }
      });

      console.log(`  Flash items: ${flashItems.length}`);
      flashItems.forEach(item => {
        console.log(`    - ${item.title} (ID: ${item.id}, Artist ID: ${item.artistId})`);
      });
    }

    // Test the artist profile include query
    console.log('\n🔍 Testing artist profile include query:');
    const testArtist = artists[0];
    
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { id: testArtist.id },
      include: {
        flash: {
          where: { isAvailable: true },
          select: {
            id: true,
            title: true,
            artistId: true
          }
        },
        gallery: {
          where: { isHidden: false },
          select: {
            id: true,
            title: true,
            artistId: true
          }
        }
      }
    });

    console.log(`\nArtist profile for ${testArtist.user.email}:`);
    console.log(`  Flash items: ${artistProfile.flash.length}`);
    artistProfile.flash.forEach(item => {
      console.log(`    - ${item.title} (ID: ${item.id}, Artist ID: ${item.artistId})`);
    });

    console.log(`  Gallery items: ${artistProfile.gallery.length}`);
    artistProfile.gallery.forEach(item => {
      console.log(`    - ${item.title} (ID: ${item.id}, Artist ID: ${item.artistId})`);
    });

  } catch (error) {
    console.error('❌ Error testing gallery endpoints:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGalleryEndpoints();
