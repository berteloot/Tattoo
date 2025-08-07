const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMapStudios() {
  console.log('🗺️ Checking studio status for map display...\n');
  
  try {
    // 1. Check total studios
    const totalStudios = await prisma.studio.count({
      where: { isActive: true }
    });
    
    console.log(`📊 Total active studios: ${totalStudios}`);
    
    // 2. Check geocoded studios
    const geocodedStudios = await prisma.studio.count({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    console.log(`📍 Studios with coordinates: ${geocodedStudios}`);
    
    // 3. Check studios without coordinates
    const missingCoordinates = await prisma.studio.count({
      where: {
        isActive: true,
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    });
    
    console.log(`❌ Studios missing coordinates: ${missingCoordinates}`);
    
    // 4. Show studios that need geocoding
    if (missingCoordinates > 0) {
      console.log('\n📍 Studios needing geocoding:');
      const studiosNeedingGeocoding = await prisma.studio.findMany({
        where: {
          isActive: true,
          OR: [
            { latitude: null },
            { longitude: null }
          ]
        },
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          latitude: true,
          longitude: true
        }
      });
      
      studiosNeedingGeocoding.forEach((studio, index) => {
        const address = [studio.address, studio.city, studio.state, studio.zipCode, studio.country]
          .filter(Boolean)
          .join(', ');
        console.log(`   ${index + 1}. ${studio.title}`);
        console.log(`      Address: ${address}`);
        console.log(`      Coordinates: ${studio.latitude}, ${studio.longitude}`);
        console.log('');
      });
    }
    
    // 5. Show studios that are geocoded
    if (geocodedStudios > 0) {
      console.log('\n✅ Geocoded studios (should show on map):');
      const geocodedStudiosList = await prisma.studio.findMany({
        where: {
          isActive: true,
          latitude: { not: null },
          longitude: { not: null }
        },
        select: {
          id: true,
          title: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          country: true,
          latitude: true,
          longitude: true
        }
      });
      
      geocodedStudiosList.forEach((studio, index) => {
        const address = [studio.address, studio.city, studio.state, studio.zipCode, studio.country]
          .filter(Boolean)
          .join(', ');
        console.log(`   ${index + 1}. ${studio.title}`);
        console.log(`      Address: ${address}`);
        console.log(`      Coordinates: ${studio.latitude}, ${studio.longitude}`);
        console.log('');
      });
    }
    
    // 6. Check if geocode cache table exists
    const cacheExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'geocode_cache'
      ) as exists;
    `;
    
    console.log(`🗄️ Geocode cache table exists: ${cacheExists[0].exists ? '✅ YES' : '❌ NO'}`);
    
    // 7. Check map API endpoint
    console.log('\n🔗 Map API Endpoints:');
    console.log('   • Studios with coordinates: GET /api/geocoding/studios');
    console.log('   • Studios needing geocoding: GET /api/geocoding/pending');
    console.log('   • Geocoding status: GET /api/geocoding/status');
    
    // 8. Recommendations
    console.log('\n🎯 Recommendations:');
    if (missingCoordinates > 0) {
      console.log(`   • ${missingCoordinates} studios need geocoding`);
      console.log('   • Go to: https://tattooed-world-backend.onrender.com/admin/geocoding');
      console.log('   • Click "Start Geocoding" to process them');
    } else if (geocodedStudios > 0) {
      console.log('   • All studios are geocoded');
      console.log('   • Check if the map component is loading correctly');
      console.log('   • Verify the API endpoint is returning data');
    } else {
      console.log('   • No studios found in database');
      console.log('   • Add some studios first via admin panel');
    }
    
  } catch (error) {
    console.error('❌ Error checking studios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkMapStudios().catch(console.error); 