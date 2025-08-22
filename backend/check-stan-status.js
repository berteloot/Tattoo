const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStanStatus() {
  try {
    console.log('🔍 Checking status of stan@altilead.com...\n');
    
    const user = await prisma.user.findUnique({
      where: { email: 'stan@altilead.com' },
      include: {
        artistProfile: {
          select: {
            id: true,
            verificationStatus: true,
            isVerified: true,
            studioName: true,
            bio: true
          }
        }
      }
    });
    
    if (user) {
      console.log('✅ Stan User Found:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Email Verified:', user.emailVerified);
      console.log('Is Active:', user.isActive);
      
      if (user.artistProfile) {
        console.log('\n🎨 Artist Profile:');
        console.log('Profile ID:', user.artistProfile.id);
        console.log('Verification Status:', user.artistProfile.verificationStatus);
        console.log('Is Verified:', user.artistProfile.isVerified);
        console.log('Studio Name:', user.artistProfile.studioName || 'Not set');
        console.log('Bio:', user.artistProfile.bio || 'Not set');
        
        if (user.artistProfile.verificationStatus !== 'APPROVED') {
          console.log('\n⚠️  ISSUE IDENTIFIED:');
          console.log('Artist profile is NOT verified. Status:', user.artistProfile.verificationStatus);
          console.log('This is why flash uploads are failing!');
        } else {
          console.log('\n✅ Artist profile is verified and ready for flash uploads!');
        }
      } else {
        console.log('\n❌ No artist profile found!');
        console.log('Stan needs to create an artist profile first.');
      }
    } else {
      console.log('❌ Stan user not found');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStanStatus();
