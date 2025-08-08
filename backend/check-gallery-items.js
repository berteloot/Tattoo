const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkGalleryItems() {
  try {
    console.log('🔍 Checking gallery items status...\n');
    
    // Get all gallery items
    const allItems = await prisma.tattooGallery.findMany({
      include: {
        artist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    console.log(`📊 Total gallery items: ${allItems.length}\n`);
    
    if (allItems.length === 0) {
      console.log('❌ No gallery items found in the database');
      return;
    }
    
    // Show details of each item
    allItems.forEach((item, index) => {
      console.log(`📋 Item ${index + 1}:`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Title: ${item.title}`);
      console.log(`   Artist: ${item.artist?.user?.firstName} ${item.artist?.user?.lastName} (${item.artist?.user?.email})`);
      console.log(`   isApproved: ${item.isApproved}`);
      console.log(`   isHidden: ${item.isHidden}`);
      console.log(`   clientConsent: ${item.clientConsent}`);
      console.log(`   Created: ${item.createdAt}`);
      console.log('');
    });
    
    // Count by status
    const approvedCount = allItems.filter(item => item.isApproved).length;
    const hiddenCount = allItems.filter(item => item.isHidden).length;
    const consentCount = allItems.filter(item => item.clientConsent).length;
    
    console.log('📈 Summary:');
    console.log(`   Approved: ${approvedCount}/${allItems.length}`);
    console.log(`   Hidden: ${hiddenCount}/${allItems.length}`);
    console.log(`   Client Consent: ${consentCount}/${allItems.length}`);
    
  } catch (error) {
    console.error('❌ Error checking gallery items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGalleryItems();
