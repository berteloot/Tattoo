const { PrismaClient } = require('@prisma/client');

// Use production database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://tattoo_app_user:password@localhost:5432/tattoo_app"
    }
  }
});

async function approveStanGalleryItems() {
  try {
    console.log('🚀 Approving Stan gallery items in production...\n');
    
    // Find Stan's artist profile
    const stanArtist = await prisma.artistProfile.findFirst({
      where: {
        user: {
          firstName: {
            contains: 'Stan'
          }
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    if (!stanArtist) {
      console.log('❌ Stan artist profile not found');
      return;
    }
    
    console.log(`👤 Found Stan: ${stanArtist.user.firstName} ${stanArtist.user.lastName}`);
    console.log(`🎨 Artist ID: ${stanArtist.id}`);
    
    // Get Stan's unapproved gallery items
    const unapprovedItems = await prisma.tattooGallery.findMany({
      where: {
        artistId: stanArtist.id,
        OR: [
          { isApproved: false },
          { clientConsent: false }
        ]
      }
    });
    
    console.log(`📊 Found ${unapprovedItems.length} unapproved gallery items`);
    
    if (unapprovedItems.length === 0) {
      console.log('✅ All of Stan\'s gallery items are already approved');
      return;
    }
    
    // Show current items
    unapprovedItems.forEach((item, index) => {
      console.log(`\n📋 Item ${index + 1}:`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Title: ${item.title}`);
      console.log(`   isApproved: ${item.isApproved}`);
      console.log(`   clientConsent: ${item.clientConsent}`);
    });
    
    // Approve all items
    const result = await prisma.tattooGallery.updateMany({
      where: {
        artistId: stanArtist.id,
        OR: [
          { isApproved: false },
          { clientConsent: false }
        ]
      },
      data: {
        isApproved: true,
        clientConsent: true
      }
    });
    
    console.log(`\n✅ Successfully approved ${result.count} gallery items`);
    
    // Verify the update
    const approvedItems = await prisma.tattooGallery.findMany({
      where: {
        artistId: stanArtist.id,
        isApproved: true,
        clientConsent: true
      }
    });
    
    console.log(`📊 Total approved items for Stan: ${approvedItems.length}`);
    
    // Check public gallery access
    const publicItems = await prisma.tattooGallery.findMany({
      where: {
        isApproved: true,
        isHidden: false,
        clientConsent: true
      }
    });
    
    console.log(`🌐 Total public gallery items: ${publicItems.length}`);
    
  } catch (error) {
    console.error('❌ Error approving Stan gallery items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveStanGalleryItems();
