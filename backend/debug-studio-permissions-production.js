const { PrismaClient } = require('@prisma/client');

async function debugStudioPermissionsProduction() {
  // Use production database URL
  const productionPrisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://tattoo_app_user:password123@dpg-cp8v8v6ct0pc73c8v8v0-a.oregon-postgres.render.com/tattoo_app_db"
      }
    }
  });
  
  try {
    console.log('🔍 Debugging Studio Permissions (Production)...\n');
    
    const studioId = '77d8db63-3248-4ee6-8255-f7fd9cd90eb8';
    const userId = 'cmdr9wn8b0000cfpyobqillp1'; // stan@altilead.com
    const artistId = 'cmdt3tutq00016mkf85lw12ar';
    
    // Check user details
    console.log('1. Checking user details...');
    const user = await productionPrisma.user.findUnique({
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
    const studio = await productionPrisma.studio.findUnique({
      where: { id: studioId }
    });
    console.log('Studio:', {
      id: studio?.id,
      title: studio?.title,
      claimedBy: studio?.claimedBy
    });
    
    // Check studio artists
    console.log('\n3. Checking studio artists...');
    const studioArtists = await productionPrisma.studioArtist.findMany({
      where: { studioId: studioId }
    });
    console.log('Studio artists:', studioArtists);
    
    // Check if user is studio owner/manager
    console.log('\n4. Checking user studio permissions...');
    const userStudioMembership = await productionPrisma.studioArtist.findFirst({
      where: {
        studioId: studioId,
        artistId: user?.artistProfile?.id,
        role: { in: ['OWNER', 'MANAGER'] }
      }
    });
    console.log('User studio membership:', userStudioMembership);
    
    // Check if target artist exists
    console.log('\n5. Checking target artist...');
    const targetArtist = await productionPrisma.artistProfile.findUnique({
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
    await productionPrisma.$disconnect();
  }
}

debugStudioPermissionsProduction();
