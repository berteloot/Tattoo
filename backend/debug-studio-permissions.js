const { PrismaClient } = require('@prisma/client');

async function debugStudioPermissions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Debugging Studio Permissions...\n');
    
    const studioId = '77d8db63-3248-4ee6-8255-f7fd9cd90eb8';
    const userId = 'cmdr9wn8b0000cfpyobqillp1'; // stan@altilead.com
    const artistId = 'cmdt3tutq00016mkf85lw12ar';
    
    // Check user details
    console.log('1. Checking user details...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        artistProfile: true
      }
    });
    console.log('User:', {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      artistProfileId: user?.artistProfile?.id
    });
    
    // Check studio details
    console.log('\n2. Checking studio details...');
    const studio = await prisma.studio.findUnique({
      where: { id: studioId }
    });
    console.log('Studio:', {
      id: studio?.id,
      title: studio?.title,
      claimedBy: studio?.claimedBy
    });
    
    // Check studio artists
    console.log('\n3. Checking studio artists...');
    const studioArtists = await prisma.studioArtist.findMany({
      where: { studioId: studioId }
    });
    console.log('Studio artists:', studioArtists);
    
    // Check if user is studio owner/manager
    console.log('\n4. Checking user studio permissions...');
    const userStudioMembership = await prisma.studioArtist.findFirst({
      where: {
        studioId: studioId,
        artistId: user?.artistProfile?.id,
        role: { in: ['OWNER', 'MANAGER'] }
      }
    });
    console.log('User studio membership:', userStudioMembership);
    
    // Check if target artist exists
    console.log('\n5. Checking target artist...');
    const targetArtist = await prisma.artistProfile.findUnique({
      where: { id: artistId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
    console.log('Target artist:', {
      id: targetArtist?.id,
      userEmail: targetArtist?.user?.email,
      userFirstName: targetArtist?.user?.firstName,
      userLastName: targetArtist?.user?.lastName
    });
    
    console.log('\n🎉 Debug completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugStudioPermissions();
