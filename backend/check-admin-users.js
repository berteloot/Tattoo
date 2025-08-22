const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminUsers() {
  try {
    console.log('🔍 Checking for admin users in local database...\n');
    
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'ARTIST_ADMIN']
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });
    
    if (adminUsers.length > 0) {
      console.log(`✅ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach(user => {
        console.log(`- ${user.email} (${user.firstName} ${user.lastName}) - ${user.role}`);
      });
    } else {
      console.log('❌ No admin users found in local database');
      console.log('You need to create an admin user to verify artists');
    }
    
    // Also check for any users with artist profiles
    const artists = await prisma.user.findMany({
      where: {
        role: {
          in: ['ARTIST', 'ARTIST_ADMIN']
        }
      },
      include: {
        artistProfile: {
          select: {
            verificationStatus: true,
            isVerified: true
          }
        }
      }
    });
    
    if (artists.length > 0) {
      console.log(`\n🎨 Found ${artists.length} artist user(s):`);
      artists.forEach(user => {
        const status = user.artistProfile ? 
          `${user.artistProfile.verificationStatus} (${user.artistProfile.isVerified ? 'Verified' : 'Not Verified'})` : 
          'No Profile';
        console.log(`- ${user.email} - ${user.role} - ${status}`);
      });
    } else {
      console.log('\n❌ No artist users found in local database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminUsers();
