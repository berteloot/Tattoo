const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkArtists() {
  try {
    console.log('🔍 Checking artists...\n');
    
    // Get all artists
    const artists = await prisma.artistProfile.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      }
    });
    
    console.log(`📊 Total artists: ${artists.length}\n`);
    
    if (artists.length === 0) {
      console.log('❌ No artists found in the database');
      return;
    }
    
    // Show details of each artist
    artists.forEach((artist, index) => {
      console.log(`👨‍🎨 Artist ${index + 1}:`);
      console.log(`   ID: ${artist.id}`);
      console.log(`   Name: ${artist.user?.firstName} ${artist.user?.lastName}`);
      console.log(`   Email: ${artist.user?.email}`);
      console.log(`   Role: ${artist.user?.role}`);
      console.log(`   Verification Status: ${artist.verificationStatus}`);
      console.log(`   Is Verified: ${artist.isVerified}`);
      console.log(`   Is Active: ${artist.isActive}`);
      console.log('');
    });
    
    // Count by status
    const verifiedCount = artists.filter(artist => artist.isVerified).length;
    const activeCount = artists.filter(artist => artist.isActive).length;
    const approvedCount = artists.filter(artist => artist.verificationStatus === 'APPROVED').length;
    
    console.log('📈 Summary:');
    console.log(`   Verified: ${verifiedCount}/${artists.length}`);
    console.log(`   Active: ${activeCount}/${artists.length}`);
    console.log(`   Approved: ${approvedCount}/${artists.length}`);
    
  } catch (error) {
    console.error('❌ Error checking artists:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkArtists();
