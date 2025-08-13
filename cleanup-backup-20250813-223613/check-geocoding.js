const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkGeocoding() {
  try {
    console.log('🔍 Checking geocoding status...\n');
    
    // Check total studios
    const totalStudios = await prisma.studio.count();
    console.log(`📊 Total studios: ${totalStudios}`);
    
    // Check studios with coordinates
    const studiosWithCoords = await prisma.studio.count({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    console.log(`📍 Studios with coordinates: ${studiosWithCoords}`);
    
    // Check studios needing geocoding
    const studiosNeedingGeocoding = await prisma.studio.count({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    });
    console.log(`❌ Studios needing geocoding: ${studiosNeedingGeocoding}`);
    
    // Check geocode cache
    const cachedAddresses = await prisma.geocodeCache.count();
    console.log(`💾 Cached addresses: ${cachedAddresses}`);
    
    // Show some examples of studios needing geocoding
    const examples = await prisma.studio.findMany({
      where: {
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
        country: true
      },
      take: 5
    });
    
    console.log('\n📋 Examples of studios needing geocoding:');
    examples.forEach(studio => {
      const address = [studio.address, studio.city, studio.state, studio.zipCode, studio.country]
        .filter(Boolean)
        .join(', ');
      console.log(`  • ${studio.title}: ${address}`);
    });
    
    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGeocoding();
