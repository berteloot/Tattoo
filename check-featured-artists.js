const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFeaturedArtists() {
  try {
    const featuredArtists = await prisma.artistProfile.findMany({
      where: { isFeatured: true },
      include: { 
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log('Featured artists:', JSON.stringify(featuredArtists, null, 2));
    console.log(`Total featured artists: ${featuredArtists.length}`);

    // Also check all artists to see the current state
    const allArtists = await prisma.artistProfile.findMany({
      include: { 
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    console.log('\nAll artists with featured status:');
    allArtists.forEach(artist => {
      console.log(`${artist.user.firstName} ${artist.user.lastName} (${artist.user.email}) - Featured: ${artist.isFeatured}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeaturedArtists(); 