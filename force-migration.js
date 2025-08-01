const { PrismaClient } = require('./backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function forceMigration() {
  console.log('🔧 Force applying ARTIST_ADMIN migration to Render database...\n');

  try {
    // 1. Connect to database
    console.log('1. Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected successfully');

    // 2. Check current enum values
    console.log('\n2. Checking current UserRole enum values...');
    try {
      const result = await prisma.$queryRaw`
        SELECT unnest(enum_range(NULL::"UserRole")) as role_value;
      `;
      console.log('Current UserRole values:');
      result.forEach(row => {
        console.log(`  - ${row.role_value}`);
      });
    } catch (enumError) {
      console.log('❌ Could not check enum values:', enumError.message);
    }

    // 3. Try to add ARTIST_ADMIN enum value manually
    console.log('\n3. Adding ARTIST_ADMIN enum value...');
    try {
      await prisma.$executeRaw`ALTER TYPE "UserRole" ADD VALUE 'ARTIST_ADMIN';`;
      console.log('✅ ARTIST_ADMIN enum value added successfully!');
    } catch (addError) {
      if (addError.message.includes('already exists')) {
        console.log('ℹ️ ARTIST_ADMIN enum value already exists');
      } else {
        console.log('❌ Error adding ARTIST_ADMIN enum value:', addError.message);
      }
    }

    // 4. Verify the enum value was added
    console.log('\n4. Verifying ARTIST_ADMIN enum value...');
    try {
      const result = await prisma.$queryRaw`
        SELECT unnest(enum_range(NULL::"UserRole")) as role_value;
      `;
      console.log('Updated UserRole values:');
      result.forEach(row => {
        console.log(`  - ${row.role_value}`);
      });
      
      const hasArtistAdmin = result.some(row => row.role_value === 'ARTIST_ADMIN');
      if (hasArtistAdmin) {
        console.log('✅ ARTIST_ADMIN enum value is now available!');
      } else {
        console.log('❌ ARTIST_ADMIN enum value is still not available');
      }
    } catch (enumError) {
      console.log('❌ Could not verify enum values:', enumError.message);
    }

    // 5. Test creating a user with ARTIST_ADMIN role
    console.log('\n5. Testing ARTIST_ADMIN role creation...');
    try {
      const testUser = await prisma.user.create({
        data: {
          email: 'test-artist-admin-force@render.com',
          password: '$2a$10$test.hash.for.testing',
          firstName: 'Test',
          lastName: 'ArtistAdminForce',
          role: 'ARTIST_ADMIN',
          isActive: true,
          isVerified: true
        }
      });
      console.log('✅ ARTIST_ADMIN role creation successful!');
      console.log(`   Created user: ${testUser.firstName} ${testUser.lastName} with role: ${testUser.role}`);
      
      // Clean up
      await prisma.user.delete({
        where: { id: testUser.id }
      });
      console.log('   Test user cleaned up');
      
    } catch (roleError) {
      console.log('❌ ARTIST_ADMIN role creation failed:');
      console.log(`   Error: ${roleError.message}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forceMigration(); 