const { PrismaClient } = require('@prisma/client');

async function addProfilePictureFields() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Adding missing profile picture fields to production database...\n');
    
    // Add the missing columns to artist_profiles table
    console.log('1. Adding profilePictureUrl column...');
    await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureUrl" TEXT;`;
    console.log('✅ profilePictureUrl column added\n');
    
    console.log('2. Adding profilePicturePublicId column...');
    await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePicturePublicId" TEXT;`;
    console.log('✅ profilePicturePublicId column added\n');
    
    console.log('3. Adding profilePictureWidth column...');
    await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureWidth" INTEGER;`;
    console.log('✅ profilePictureWidth column added\n');
    
    console.log('4. Adding profilePictureHeight column...');
    await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureHeight" INTEGER;`;
    console.log('✅ profilePictureHeight column added\n');
    
    console.log('5. Adding profilePictureFormat column...');
    await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureFormat" TEXT;`;
    console.log('✅ profilePictureFormat column added\n');
    
    console.log('6. Adding profilePictureBytes column...');
    await prisma.$executeRaw`ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "profilePictureBytes" INTEGER;`;
    console.log('✅ profilePictureBytes column added\n');
    
    console.log('🎉 All profile picture fields added successfully!');
    
    // Test the gallery fetch again
    console.log('\n7. Testing gallery fetch after fix...');
    const galleryItems = await prisma.tattooGallery.findMany({
      take: 1,
      include: {
        artist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            views: true,
            likes: true,
            comments: true
          }
        }
      }
    });
    console.log(`✅ Gallery fetch successful: ${galleryItems.length} items found\n`);
    
  } catch (error) {
    console.error('❌ Error adding profile picture fields:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

addProfilePictureFields();
