const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProductionDB() {
  console.log('🗄️ Checking production database status...\n');
  
  try {
    // Check total studios
    const totalStudios = await prisma.studio.count();
    console.log(`📊 Total studios in production: ${totalStudios}`);
    
    // Check active studios
    const activeStudios = await prisma.studio.count({
      where: { isActive: true }
    });
    console.log(`📊 Active studios in production: ${activeStudios}`);
    
    // Check studios with coordinates
    const studiosWithCoords = await prisma.studio.count({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    console.log(`📍 Studios with coordinates in production: ${studiosWithCoords}`);
    
    // Check studios without coordinates
    const studiosWithoutCoords = await prisma.studio.count({
      where: {
        isActive: true,
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    });
    console.log(`❌ Studios without coordinates in production: ${studiosWithoutCoords}`);
    
    // Show all studios
    const allStudios = await prisma.studio.findMany({
      select: {
        id: true,
        title: true,
        isActive: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        state: true
      }
    });
    
    console.log('\n📋 All studios in production:');
    allStudios.forEach((studio, index) => {
      console.log(`   ${index + 1}. ${studio.title}`);
      console.log(`      Active: ${studio.isActive}`);
      console.log(`      Coordinates: ${studio.latitude}, ${studio.longitude}`);
      console.log(`      Address: ${studio.address}, ${studio.city}, ${studio.state}`);
      console.log('');
    });
    
    // Check if geocode cache table exists
    const cacheExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'geocode_cache'
      ) as exists;
    `;
    
    console.log(`🗄️ Geocode cache table exists: ${cacheExists[0].exists ? '✅ YES' : '❌ NO'}`);
    
    if (cacheExists[0].exists) {
      const cacheCount = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM geocode_cache;
      `;
      console.log(`🗄️ Geocode cache entries: ${cacheCount[0].count}`);
    }
    
    // Recommendations
    console.log('\n🎯 Recommendations:');
    if (studiosWithCoords === 0) {
      console.log('   • No studios with coordinates found');
      console.log('   • Run geocoding: https://tattooed-world-backend.onrender.com/admin/geocoding');
    } else {
      console.log(`   • ${studiosWithCoords} studios should show on map`);
    }
    
    if (activeStudios === 0) {
      console.log('   • No active studios found');
      console.log('   • Check if studios have isActive = true');
    }
    
  } catch (error) {
    console.error('❌ Error checking production database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkProductionDB().catch(console.error); 