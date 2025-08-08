const { PrismaClient } = require('@prisma/client');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://tattoo_app_user:password@localhost:5432/tattoo_app"
    }
  }
});

async function checkProductionStanGallery() {
  try {
    console.log('🔍 Checking Stan gallery on production...\n');
    
    // First, let's check all users to see if we can find Stan
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true
      }
    });
    
    console.log(`📊 Total users in production: ${allUsers.length}`);
    
    // Look for Stan or similar users
    const stanUser = allUsers.find(user => 
      user.email.includes('stan') || 
      user.firstName?.toLowerCase().includes('stan') ||
      user.lastName?.toLowerCase().includes('stan')
    );
    
    if (stanUser) {
      console.log(`👤 Found potential Stan user: ${stanUser.firstName} ${stanUser.lastName} (${stanUser.email})`);
    } else {
      console.log('❌ No user found with "stan" in name or email');
      console.log('\n📋 All users:');
      allUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
      });
      return;
    }
    
    // Get Stan's artist profile
    const artistProfile = await prisma.artistProfile.findUnique({
      where: {
        userId: stanUser.id
      }
    });
    
    if (!artistProfile) {
      console.log('❌ Stan does not have an artist profile');
      return;
    }
    
    console.log(`\n🎨 Stan's Artist Profile:`);
    console.log(`   ID: ${artistProfile.id}`);
    console.log(`   Verification Status: ${artistProfile.verificationStatus}`);
    console.log(`   Is Verified: ${artistProfile.isVerified}`);
    
    // Get Stan's gallery items
    const galleryItems = await prisma.tattooGallery.findMany({
      where: {
        artistId: artistProfile.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`\n📊 Stan's Gallery Items: ${galleryItems.length}`);
    
    if (galleryItems.length === 0) {
      console.log('❌ No gallery items found for Stan');
    } else {
      galleryItems.forEach((item, index) => {
        console.log(`\n📋 Item ${index + 1}:`);
        console.log(`   ID: ${item.id}`);
        console.log(`   Title: ${item.title}`);
        console.log(`   Style: ${item.tattooStyle}`);
        console.log(`   Location: ${item.bodyLocation}`);
        console.log(`   isApproved: ${item.isApproved}`);
        console.log(`   isHidden: ${item.isHidden}`);
        console.log(`   clientConsent: ${item.clientConsent}`);
        console.log(`   Created: ${item.createdAt}`);
        console.log(`   Image URL: ${item.imageUrl ? 'Yes' : 'No'}`);
      });
    }
    
    // Check total gallery items in production
    const totalGalleryItems = await prisma.tattooGallery.count();
    const approvedItems = await prisma.tattooGallery.count({
      where: {
        isApproved: true
      }
    });
    
    console.log(`\n🌐 Production Gallery Summary:`);
    console.log(`   Total gallery items: ${totalGalleryItems}`);
    console.log(`   Approved items: ${approvedItems}`);
    console.log(`   Stan's items: ${galleryItems.length}`);
    
  } catch (error) {
    console.error('❌ Error checking production Stan gallery:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionStanGallery();
