const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStanGallery() {
  try {
    console.log('🔍 Checking gallery for stan@altilead.com...\n');
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        email: 'stan@altilead.com'
      },
      include: {
        artistProfile: {
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
        }
      }
    });
    
    if (!user) {
      console.log('❌ User stan@altilead.com not found');
      return;
    }
    
    console.log(`👤 User found: ${user.firstName} ${user.lastName}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🎭 Role: ${user.role}`);
    
    if (!user.artistProfile) {
      console.log('❌ User does not have an artist profile');
      return;
    }
    
    console.log(`\n🎨 Artist Profile:`);
    console.log(`   ID: ${user.artistProfile.id}`);
    console.log(`   Verification Status: ${user.artistProfile.verificationStatus}`);
    console.log(`   Is Verified: ${user.artistProfile.isVerified}`);
    console.log(`   Is Active: ${user.artistProfile.isActive}`);
    
    // Get gallery items for this artist
    const galleryItems = await prisma.tattooGallery.findMany({
      where: {
        artistId: user.artistProfile.id
      },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`\n📊 Gallery Items: ${galleryItems.length}`);
    
    if (galleryItems.length === 0) {
      console.log('❌ No gallery items found for this artist');
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
    
    // Check public gallery access
    console.log(`\n🌐 Public Gallery Access:`);
    const publicItems = await prisma.tattooGallery.findMany({
      where: {
        isApproved: true,
        isHidden: false,
        clientConsent: true
      }
    });
    
    console.log(`   Total public items: ${publicItems.length}`);
    
    const stanPublicItems = publicItems.filter(item => item.artistId === user.artistProfile.id);
    console.log(`   Stan's public items: ${stanPublicItems.length}`);
    
  } catch (error) {
    console.error('❌ Error checking Stan gallery:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStanGallery();
