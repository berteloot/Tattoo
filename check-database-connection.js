const { PrismaClient } = require('@prisma/client');

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection and studios data...\n');
  
  const prisma = new PrismaClient();
  
  try {
    // Step 1: Test database connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Step 2: Check studios count
    console.log('\n2️⃣ Checking studios count...');
    const studiosCount = await prisma.studio.count();
    console.log(`Total studios in database: ${studiosCount}`);
    
    // Step 3: Check active studios
    console.log('\n3️⃣ Checking active studios...');
    const activeStudiosCount = await prisma.studio.count({
      where: { isActive: true }
    });
    console.log(`Active studios: ${activeStudiosCount}`);
    
    // Step 4: Check verified studios
    console.log('\n4️⃣ Checking verified studios...');
    const verifiedStudiosCount = await prisma.studio.count({
      where: { isVerified: true }
    });
    console.log(`Verified studios: ${verifiedStudiosCount}`);
    
    // Step 5: Get sample studios
    console.log('\n5️⃣ Getting sample studios...');
    const sampleStudios = await prisma.studio.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        isActive: true,
        isVerified: true,
        isFeatured: true,
        verificationStatus: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Sample studios:');
    sampleStudios.forEach((studio, index) => {
      console.log(`${index + 1}. ${studio.title} (ID: ${studio.id})`);
      console.log(`   Active: ${studio.isActive}, Verified: ${studio.isVerified}, Featured: ${studio.isFeatured}`);
      console.log(`   Status: ${studio.verificationStatus}, Created: ${studio.createdAt}`);
    });
    
    // Step 6: Check users
    console.log('\n6️⃣ Checking users...');
    const usersCount = await prisma.user.count();
    console.log(`Total users: ${usersCount}`);
    
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        isVerified: true
      }
    });
    
    console.log(`Admin users: ${adminUsers.length}`);
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.firstName} ${user.lastName})`);
      console.log(`   Active: ${user.isActive}, Verified: ${user.isVerified}`);
    });
    
    // Step 7: Test the exact query that the API uses
    console.log('\n7️⃣ Testing API query...');
    try {
      const apiStudios = await prisma.studio.findMany({
        where: { isActive: true },
        skip: 0,
        take: 20,
        orderBy: { title: 'asc' }
      });
      console.log(`API query returns: ${apiStudios.length} studios`);
      
      if (apiStudios.length > 0) {
        console.log('First studio from API query:', {
          id: apiStudios[0].id,
          title: apiStudios[0].title,
          isActive: apiStudios[0].isActive,
          isVerified: apiStudios[0].isVerified
        });
      }
    } catch (error) {
      console.log('❌ API query failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseConnection(); 