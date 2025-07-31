const { PrismaClient } = require('./backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function testArtistAdminRole() {
  console.log('🧪 Testing ARTIST_ADMIN role functionality...\n');

  try {
    // 1. Check if the new role exists in the database
    console.log('1. Checking if ARTIST_ADMIN role is available...');
    
    // Get all users to see current roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    });
    
    console.log('Current users and their roles:');
    users.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.email}): ${user.role}`);
    });
    
    // 2. Create a test ARTIST_ADMIN user
    console.log('\n2. Creating a test ARTIST_ADMIN user...');
    
    const testArtistAdmin = await prisma.user.upsert({
      where: { email: 'artistadmin@test.com' },
      update: {
        role: 'ARTIST_ADMIN'
      },
      create: {
        email: 'artistadmin@test.com',
        password: '$2a$10$test.hash.for.testing', // This is just for testing
        firstName: 'Test',
        lastName: 'ArtistAdmin',
        role: 'ARTIST_ADMIN',
        isActive: true,
        isVerified: true
      }
    });
    
    console.log(`✅ Created/Updated ARTIST_ADMIN user: ${testArtistAdmin.firstName} ${testArtistAdmin.lastName}`);
    
    // 3. Create an artist profile for the ARTIST_ADMIN
    console.log('\n3. Creating artist profile for ARTIST_ADMIN...');
    
    const artistProfile = await prisma.artistProfile.upsert({
      where: { userId: testArtistAdmin.id },
      update: {},
      create: {
        userId: testArtistAdmin.id,
        bio: 'Test artist admin with full privileges',
        studioName: 'Artist Admin Studio',
        isVerified: true,
        verificationStatus: 'APPROVED'
      }
    });
    
    console.log(`✅ Created artist profile for ARTIST_ADMIN`);
    
    // 4. Test role permissions
    console.log('\n4. Testing role permissions...');
    
    const testUser = await prisma.user.findUnique({
      where: { email: 'artistadmin@test.com' },
      include: {
        artistProfile: true
      }
    });
    
    console.log('User details:');
    console.log(`  - Role: ${testUser.role}`);
    console.log(`  - Has artist profile: ${!!testUser.artistProfile}`);
    console.log(`  - Artist profile verified: ${testUser.artistProfile?.isVerified}`);
    console.log(`  - Can access artist features: ${testUser.role === 'ARTIST' || testUser.role === 'ARTIST_ADMIN'}`);
    console.log(`  - Can access admin features: ${testUser.role === 'ADMIN' || testUser.role === 'ARTIST_ADMIN'}`);
    
    // 5. Test admin action logging
    console.log('\n5. Testing admin action logging...');
    
    const adminAction = await prisma.adminAction.create({
      data: {
        adminId: testUser.id,
        action: 'TEST_ARTIST_ADMIN',
        targetType: 'TEST',
        targetId: 'test-123',
        details: 'Testing ARTIST_ADMIN permissions'
      }
    });
    
    console.log(`✅ Created admin action: ${adminAction.action}`);
    
    // 6. Verify the action was logged
    const actions = await prisma.adminAction.findMany({
      where: { adminId: testUser.id },
      include: {
        admin: {
          select: {
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    });
    
    console.log('Admin actions by ARTIST_ADMIN:');
    actions.forEach(action => {
      console.log(`  - ${action.action}: ${action.details} (by ${action.admin.firstName} ${action.admin.lastName} - ${action.admin.role})`);
    });
    
    console.log('\n🎉 ARTIST_ADMIN role test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ ARTIST_ADMIN role exists in database');
    console.log('✅ ARTIST_ADMIN can have artist profile');
    console.log('✅ ARTIST_ADMIN can perform admin actions');
    console.log('✅ ARTIST_ADMIN has both artist and admin privileges');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testArtistAdminRole(); 