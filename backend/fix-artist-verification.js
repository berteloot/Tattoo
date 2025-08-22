const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixArtistVerification() {
  try {
    console.log('🔧 Fixing Artist Verification Issues\n');
    
    // Check current admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'ARTIST_ADMIN']
        }
      },
      select: {
        id: true,
        email: true,
        role: true
      }
    });
    
    console.log(`Found ${adminUsers.length} admin user(s):`);
    adminUsers.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
    
    // Check pending artist verifications
    const pendingArtists = await prisma.artistProfile.findMany({
      where: {
        verificationStatus: 'PENDING'
      },
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });
    
    if (pendingArtists.length > 0) {
      console.log(`\n⏳ Found ${pendingArtists.length} pending artist verification(s):`);
      pendingArtists.forEach(artist => {
        console.log(`- ${artist.user.email} (${artist.user.role}) - Profile ID: ${artist.id}`);
      });
      
      // Auto-approve the first pending artist for testing
      if (pendingArtists.length > 0) {
        const firstArtist = pendingArtists[0];
        console.log(`\n🔓 Auto-approving first pending artist: ${firstArtist.user.email}`);
        
        await prisma.artistProfile.update({
          where: { id: firstArtist.id },
          data: {
            verificationStatus: 'APPROVED',
            isVerified: true,
            verifiedAt: new Date(),
            verifiedBy: adminUsers[0]?.id || 'system'
          }
        });
        
        console.log('✅ Artist approved successfully!');
        console.log('This artist can now upload flash items.');
      }
    } else {
      console.log('\n✅ No pending artist verifications found');
    }
    
    // Create a test admin account if none exists
    if (adminUsers.length === 0) {
      console.log('\n🔧 Creating test admin account...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@test.com',
          password: hashedPassword,
          firstName: 'Test',
          lastName: 'Admin',
          role: 'ADMIN',
          emailVerified: true,
          isActive: true
        }
      });
      
      console.log('✅ Test admin account created:');
      console.log('Email: admin@test.com');
      console.log('Password: admin123');
      console.log('Role: ADMIN');
    }
    
    // Show final status
    console.log('\n📊 Final Status:');
    const finalArtists = await prisma.artistProfile.findMany({
      include: {
        user: {
          select: {
            email: true,
            role: true
          }
        }
      }
    });
    
    finalArtists.forEach(artist => {
      const status = artist.verificationStatus === 'APPROVED' ? '✅' : '⏳';
      console.log(`${status} ${artist.user.email} - ${artist.verificationStatus}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixArtistVerification();
