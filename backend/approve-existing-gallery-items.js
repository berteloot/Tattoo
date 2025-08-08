const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function approveExistingGalleryItems() {
  try {
    console.log('🔄 Approving existing gallery items...');
    
    // Get count of unapproved items
    const unapprovedCount = await prisma.tattooGallery.count({
      where: {
        isApproved: false
      }
    });
    
    console.log(`📊 Found ${unapprovedCount} unapproved gallery items`);
    
    if (unapprovedCount === 0) {
      console.log('✅ All gallery items are already approved');
      return;
    }
    
    // Approve all existing gallery items
    const result = await prisma.tattooGallery.updateMany({
      where: {
        isApproved: false
      },
      data: {
        isApproved: true,
        clientConsent: true
      }
    });
    
    console.log(`✅ Successfully approved ${result.count} gallery items`);
    
    // Verify the update
    const approvedCount = await prisma.tattooGallery.count({
      where: {
        isApproved: true
      }
    });
    
    console.log(`📊 Total approved gallery items: ${approvedCount}`);
    
  } catch (error) {
    console.error('❌ Error approving gallery items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveExistingGalleryItems();
