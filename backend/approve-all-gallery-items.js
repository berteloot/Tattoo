const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function approveAllGalleryItems() {
  try {
    console.log('🚀 Approving all gallery items...\n');
    
    // Get count of unapproved items
    const unapprovedCount = await prisma.tattooGallery.count({
      where: {
        OR: [
          { isApproved: false },
          { clientConsent: false }
        ]
      }
    });
    
    console.log(`📊 Found ${unapprovedCount} items that need approval`);
    
    if (unapprovedCount === 0) {
      console.log('✅ All gallery items are already properly configured');
      return;
    }
    
    // Approve all gallery items
    const result = await prisma.tattooGallery.updateMany({
      where: {
        OR: [
          { isApproved: false },
          { clientConsent: false }
        ]
      },
      data: {
        isApproved: true,
        clientConsent: true,
        isHidden: false
      }
    });
    
    console.log(`✅ Successfully updated ${result.count} gallery items`);
    
    // Verify the update
    const totalItems = await prisma.tattooGallery.count();
    const approvedItems = await prisma.tattooGallery.count({
      where: {
        isApproved: true,
        clientConsent: true,
        isHidden: false
      }
    });
    
    console.log(`📊 Total gallery items: ${totalItems}`);
    console.log(`📊 Public gallery items: ${approvedItems}`);
    
  } catch (error) {
    console.error('❌ Error approving gallery items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveAllGalleryItems();
