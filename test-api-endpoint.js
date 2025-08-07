const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPIEndpoint() {
  console.log('🧪 Testing /api/geocoding/studios endpoint directly...\n');
  
  try {
    // Test the exact query that the API uses
    const studios = await prisma.studio.findMany({
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
        longitude: true,
        website: true,
        phoneNumber: true,
        email: true,
        isVerified: true,
        isFeatured: true
      }
    });
    
    console.log(`📊 Found ${studios.length} studios with coordinates`);
    
    if (studios.length > 0) {
      console.log('\n📍 Studios found:');
      studios.forEach((studio, index) => {
        console.log(`   ${index + 1}. ${studio.title}`);
        console.log(`      Coordinates: ${studio.latitude}, ${studio.longitude}`);
        console.log(`      Address: ${studio.address}, ${studio.city}, ${studio.state}`);
        console.log('');
      });
      
      // Test GeoJSON conversion
      const geojson = {
        type: 'FeatureCollection',
        features: studios.map(studio => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [studio.longitude, studio.latitude]
          },
          properties: {
            id: studio.id,
            title: studio.title,
            address: studio.address,
            city: studio.city,
            state: studio.state,
            zipCode: studio.zipCode,
            country: studio.country,
            website: studio.website,
            phoneNumber: studio.phoneNumber,
            email: studio.email,
            isVerified: studio.isVerified,
            isFeatured: studio.isFeatured
          }
        }))
      };
      
      console.log('✅ GeoJSON conversion successful');
      console.log(`   Features: ${geojson.features.length}`);
      console.log(`   Sample coordinates: ${geojson.features[0].geometry.coordinates[1]}, ${geojson.features[0].geometry.coordinates[0]}`);
      
    } else {
      console.log('\n❌ No studios found with coordinates');
      
      // Check what studios exist
      const allStudios = await prisma.studio.findMany({
        where: { isActive: true },
        select: {
          id: true,
          title: true,
          latitude: true,
          longitude: true,
          isActive: true
        }
      });
      
      console.log(`\n📋 All active studios (${allStudios.length}):`);
      allStudios.forEach((studio, index) => {
        console.log(`   ${index + 1}. ${studio.title}`);
        console.log(`      Active: ${studio.isActive}`);
        console.log(`      Coordinates: ${studio.latitude}, ${studio.longitude}`);
        console.log('');
      });
      
      // Check for studios with null coordinates
      const studiosWithNullCoords = await prisma.studio.findMany({
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
          latitude: true,
          longitude: true
        }
      });
      
      console.log(`\n❌ Studios with null coordinates (${studiosWithNullCoords.length}):`);
      studiosWithNullCoords.forEach((studio, index) => {
        console.log(`   ${index + 1}. ${studio.title} - ${studio.latitude}, ${studio.longitude}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing API endpoint:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAPIEndpoint().catch(console.error); 