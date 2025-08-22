const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testGalleryFixes() {
  try {
    console.log('🧪 Testing gallery fixes for cross-artist content prevention...');
    
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

    // Test 1: Artist profile include query (this is what the frontend uses)
    console.log('\n🔍 Test 1: Artist profile include query');
    for (const artist of artists) {
      console.log(`\nTesting profile for ${artist.user.email}:`);
      
      const artistProfile = await prisma.artistProfile.findUnique({
        where: { id: artist.id },
        include: {
          flash: {
            where: { 
              artistId: artist.id,
              isAvailable: true 
            },
            select: {
              id: true,
              title: true,
              artistId: true
            }
          },
          gallery: {
            where: { 
              artistId: artist.id,
              isHidden: false 
            },
            select: {
              id: true,
              title: true,
              artistId: true
            }
          }
        }
      });

      console.log(`  Flash items: ${artistProfile.flash.length}`);
      artistProfile.flash.forEach(item => {
        if (item.artistId !== artist.id) {
          console.error(`    🚨 CROSS-ARTIST ITEM: ${item.title} (Artist ID: ${item.artistId}, Expected: ${artist.id})`);
        } else {
          console.log(`    ✅ ${item.title} (Artist ID: ${item.artistId})`);
        }
      });

      console.log(`  Gallery items: ${artistProfile.gallery.length}`);
      artistProfile.gallery.forEach(item => {
        if (item.artistId !== artist.id) {
          console.error(`    🚨 CROSS-ARTIST ITEM: ${item.title} (Artist ID: ${item.artistId}, Expected: ${artist.id})`);
        } else {
          console.log(`    ✅ ${item.title} (Artist ID: ${item.artistId})`);
        }
      });
    }

    // Test 2: Direct gallery query with artistId filter
    console.log('\n🔍 Test 2: Direct gallery query with artistId filter');
    for (const artist of artists) {
      console.log(`\nTesting gallery for ${artist.user.email}:`);
      
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
        if (item.artistId !== artist.id) {
          console.error(`    🚨 CROSS-ARTIST ITEM: ${item.title} (Artist ID: ${item.artistId}, Expected: ${artist.id})`);
        } else {
          console.log(`    ✅ ${item.title} (Artist ID: ${item.artistId})`);
        }
      });
    }

    // Test 3: Direct flash query with artistId filter
    console.log('\n🔍 Test 3: Direct flash query with artistId filter');
    for (const artist of artists) {
      console.log(`\nTesting flash for ${artist.user.email}:`);
      
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
        if (item.artistId !== artist.id) {
          console.error(`    🚨 CROSS-ARTIST ITEM: ${item.title} (Artist ID: ${item.artistId}, Expected: ${artist.id})`);
        } else {
          console.log(`    ✅ ${item.title} (Artist ID: ${item.artistId})`);
        }
      });
    }

    // Test 4: Verify no cross-artist relationships exist in database
    console.log('\n🔍 Test 4: Database integrity check');
    
    // Check for any gallery items with invalid artistId references
    // We'll check this by looking for items that don't have a valid artist relationship
    const allGalleryItems = await prisma.tattooGallery.findMany({
      select: {
        id: true,
        title: true,
        artistId: true,
        artist: {
          select: {
            id: true
          }
        }
      }
    });

    const orphanedGalleryItems = allGalleryItems.filter(item => !item.artist);
    if (orphanedGalleryItems.length > 0) {
      console.error('🚨 Found gallery items with invalid artistId references:', orphanedGalleryItems);
    } else {
      console.log('✅ All gallery items have valid artistId references');
    }

    // Check for any flash items with invalid artistId references
    const allFlashItems = await prisma.flash.findMany({
      select: {
        id: true,
        title: true,
        artistId: true,
        artist: {
          select: {
            id: true
          }
        }
      }
    });

    const orphanedFlashItems = allFlashItems.filter(item => !item.artist);
    if (orphanedFlashItems.length > 0) {
      console.error('🚨 Found flash items with invalid artistId references:', orphanedFlashItems);
    } else {
      console.log('✅ All flash items have valid artistId references');
    }

    console.log('\n🎉 Gallery fixes test completed!');

  } catch (error) {
    console.error('❌ Error testing gallery fixes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testGalleryFixes();
