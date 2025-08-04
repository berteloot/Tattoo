const { PrismaClient } = require('./backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function createArtistProfile() {
  try {
    console.log('🔍 Creating artist profile for testing...\n');

    // Find the artist user
    const artist = await prisma.user.findFirst({
      where: {
        email: 'artist@example.com',
        role: 'ARTIST'
      }
    });

    if (!artist) {
      console.log('❌ Artist user not found');
      return;
    }

    console.log(`✅ Found artist: ${artist.firstName} ${artist.lastName}`);

    // Check if artist profile already exists
    const existingProfile = await prisma.artistProfile.findUnique({
      where: {
        userId: artist.id
      }
    });

    if (existingProfile) {
      console.log('✅ Artist profile already exists');
      console.log(`   - Profile ID: ${existingProfile.id}`);
      console.log(`   - Studio: ${existingProfile.studioName}`);
      return;
    }

    // Create artist profile
    const profile = await prisma.artistProfile.create({
      data: {
        userId: artist.id,
        studioName: 'Test Studio',
        bio: 'This is a test artist profile for testing the email feature.',
        city: 'Test City',
        state: 'Test State',
        hourlyRate: 150,
        minPrice: 50,
        maxPrice: 500,
        website: 'https://teststudio.com',
        instagram: 'teststudio',
        facebook: 'teststudio',
        isVerified: true,
        verificationStatus: 'APPROVED',
        featured: false
      }
    });

    console.log('✅ Artist profile created successfully');
    console.log(`   - Profile ID: ${profile.id}`);
    console.log(`   - Studio: ${profile.studioName}`);
    console.log(`   - Status: ${profile.verificationStatus}`);

    // Add some specialties
    const specialties = await prisma.specialty.findMany({
      take: 3
    });

    if (specialties.length > 0) {
      await prisma.artistProfile.update({
        where: { id: profile.id },
        data: {
          specialties: {
            connect: specialties.map(s => ({ id: s.id }))
          }
        }
      });
      console.log(`   - Added ${specialties.length} specialties`);
    }

    console.log('\n🎯 Artist profile is now ready for testing the email feature!');

  } catch (error) {
    console.error('❌ Error creating artist profile:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createArtistProfile(); 