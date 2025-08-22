const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkGalleryData() {
  try {
    console.log('🔍 Checking gallery data for cross-artist issues...');
    
    // Check all gallery items with their artist info
    const galleryItems = await prisma.tattooGallery.findMany({
      select: {
        id: true,
        title: true,
        artistId: true,
        artist: {
          select: {
            id: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        artistId: 'asc'
      }
    });

    console.log(`\n📊 Found ${galleryItems.length} gallery items`);
    
    // Group by artist to see distribution
    const artistGroups = {};
    galleryItems.forEach(item => {
      const artistEmail = item.artist?.user?.email || 'Unknown';
      if (!artistGroups[artistEmail]) {
        artistGroups[artistEmail] = [];
      }
      artistGroups[artistEmail].push({
        id: item.id,
        title: item.title
      });
    });

    console.log('\n🎨 Gallery items by artist:');
    Object.entries(artistGroups).forEach(([email, items]) => {
      console.log(`\n${email}: ${items.length} items`);
      items.forEach(item => {
        console.log(`  - ${item.title} (ID: ${item.id})`);
      });
    });

    // Check for any items with missing artist relationships
    const orphanedItems = galleryItems.filter(item => !item.artist);
    if (orphanedItems.length > 0) {
      console.log('\n⚠️  Orphaned gallery items (no artist):', orphanedItems);
    }

    // Check flash items too
    console.log('\n🔍 Checking flash items...');
    const flashItems = await prisma.flash.findMany({
      select: {
        id: true,
        title: true,
        artistId: true,
        artist: {
          select: {
            id: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: {
        artistId: 'asc'
      }
    });

    console.log(`\n📊 Found ${flashItems.length} flash items`);
    
    // Group flash by artist
    const flashArtistGroups = {};
    flashItems.forEach(item => {
      const artistEmail = item.artist?.user?.email || 'Unknown';
      if (!flashArtistGroups[artistEmail]) {
        flashArtistGroups[artistEmail] = [];
      }
      flashArtistGroups[artistEmail].push({
        id: item.id,
        title: item.title
      });
    });

    console.log('\n🎨 Flash items by artist:');
    Object.entries(flashArtistGroups).forEach(([email, items]) => {
      console.log(`\n${email}: ${items.length} items`);
      items.forEach(item => {
        console.log(`  - ${item.title} (ID: ${item.id})`);
      });
    });

    // Check for any items with missing artist relationships
    const orphanedFlash = flashItems.filter(item => !item.artist);
    if (orphanedFlash.length > 0) {
      console.log('\n⚠️  Orphaned flash items (no artist):', orphanedFlash);
    }

  } catch (error) {
    console.error('❌ Error checking gallery data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGalleryData();
