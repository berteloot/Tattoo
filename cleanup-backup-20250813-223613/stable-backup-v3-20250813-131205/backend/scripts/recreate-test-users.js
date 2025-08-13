const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function recreateTestUsers() {
  try {
    console.log('🔄 Recreating test users...');

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const artistPasswordHash = await bcrypt.hash('artist123', 10);
    const clientPasswordHash = await bcrypt.hash('client123', 10);

    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'berteloot@gmail.com' }
    });

    if (!existingAdmin) {
      console.log('👑 Creating admin user...');
      await prisma.user.create({
        data: {
          email: 'berteloot@gmail.com',
          password: adminPasswordHash,
          firstName: 'Stanislas',
          lastName: 'Berteloot',
          role: 'ADMIN',
          emailVerified: true,
          isActive: true
        }
      });
      console.log('✅ Admin user created');
    } else {
      console.log('👑 Admin user already exists');
      // Update password in case it changed
      await prisma.user.update({
        where: { email: 'berteloot@gmail.com' },
        data: { password: adminPasswordHash }
      });
      console.log('✅ Admin password updated');
    }

    // Check if artist user exists
    const existingArtist = await prisma.user.findUnique({
      where: { email: 'artist@example.com' }
    });

    if (!existingArtist) {
      console.log('🎨 Creating artist user...');
      const artistUser = await prisma.user.create({
        data: {
          email: 'artist@example.com',
          password: artistPasswordHash,
          firstName: 'Test',
          lastName: 'Artist',
          role: 'ARTIST',
          emailVerified: true,
          isActive: true
        }
      });

      // Create artist profile
      await prisma.artistProfile.create({
        data: {
          userId: artistUser.id,
          bio: 'Test artist account for development',
          studioName: 'Test Studio',
          isVerified: true,
          verificationStatus: 'APPROVED'
        }
      });
      console.log('✅ Artist user and profile created');
    } else {
      console.log('🎨 Artist user already exists');
      // Update password
      await prisma.user.update({
        where: { email: 'artist@example.com' },
        data: { password: artistPasswordHash }
      });
      console.log('✅ Artist password updated');
    }

    // Check if client user exists
    const existingClient = await prisma.user.findUnique({
      where: { email: 'client@example.com' }
    });

    if (!existingClient) {
      console.log('👤 Creating client user...');
      await prisma.user.create({
        data: {
          email: 'client@example.com',
          password: clientPasswordHash,
          firstName: 'Test',
          lastName: 'Client',
          role: 'CLIENT',
          emailVerified: true,
          isActive: true
        }
      });
      console.log('✅ Client user created');
    } else {
      console.log('👤 Client user already exists');
      // Update password
      await prisma.user.update({
        where: { email: 'client@example.com' },
        data: { password: clientPasswordHash }
      });
      console.log('✅ Client password updated');
    }

    console.log('🎉 Test users recreation completed!');

  } catch (error) {
    console.error('❌ Error recreating test users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  recreateTestUsers();
}

module.exports = recreateTestUsers;
