const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testGeocodingAPI() {
  console.log('🧪 Testing Geocoding API Endpoints...\n');
  
  try {
    // Test 1: Get studios with coordinates (GeoJSON format)
    console.log('1️⃣ Testing /api/geocoding/studios endpoint...');
    
    const studiosWithCoordinates = await prisma.studio.findMany({
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
    
    console.log(`   Found ${studiosWithCoordinates.length} studios with coordinates`);
    
    // Convert to GeoJSON format (like the API does)
    const geojsonFeatures = studiosWithCoordinates.map(studio => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [studio.longitude, studio.latitude] // GeoJSON uses [lng, lat]
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
    }));
    
    const geojsonResponse = {
      type: 'FeatureCollection',
      features: geojsonFeatures
    };
    
    console.log('   GeoJSON response structure:');
    console.log(`   - Type: ${geojsonResponse.type}`);
    console.log(`   - Features count: ${geojsonResponse.features.length}`);
    
    if (geojsonFeatures.length > 0) {
      console.log('   - Sample feature:');
      console.log(`     ID: ${geojsonFeatures[0].properties.id}`);
      console.log(`     Title: ${geojsonFeatures[0].properties.title}`);
      console.log(`     Coordinates: ${geojsonFeatures[0].geometry.coordinates[1]}, ${geojsonFeatures[0].geometry.coordinates[0]}`);
    }
    
    // Test 2: Get geocoding status
    console.log('\n2️⃣ Testing /api/geocoding/status endpoint...');
    
    const totalStudios = await prisma.studio.count({
      where: { isActive: true }
    });
    
    const geocodedStudios = await prisma.studio.count({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    const missingCoordinates = totalStudios - geocodedStudios;
    const percentageComplete = totalStudios > 0 ? (geocodedStudios / totalStudios) * 100 : 0;
    
    const statusResponse = {
      total_studios: totalStudios,
      geocoded_studios: geocodedStudios,
      missing_coordinates: missingCoordinates,
      percentage_complete: percentageComplete
    };
    
    console.log('   Status response:');
    console.log(`   - Total studios: ${statusResponse.total_studios}`);
    console.log(`   - Geocoded: ${statusResponse.geocoded_studios}`);
    console.log(`   - Missing: ${statusResponse.missing_coordinates}`);
    console.log(`   - Completion: ${statusResponse.percentage_complete.toFixed(2)}%`);
    
    // Test 3: Get studios needing geocoding
    console.log('\n3️⃣ Testing /api/geocoding/pending endpoint...');
    
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
        country: true
      }
    });
    
    console.log(`   Found ${studiosNeedingGeocoding.length} studios needing geocoding`);
    
    if (studiosNeedingGeocoding.length > 0) {
      console.log('   - Sample studio needing geocoding:');
      const sample = studiosNeedingGeocoding[0];
      const address = [sample.address, sample.city, sample.state, sample.zipCode, sample.country]
        .filter(Boolean)
        .join(', ');
      console.log(`     Title: ${sample.title}`);
      console.log(`     Address: ${address}`);
    }
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   ✅ Studios with coordinates: ${geocodedStudios}`);
    console.log(`   ❌ Studios needing geocoding: ${missingCoordinates}`);
    console.log(`   🗺️ Map should display: ${geocodedStudios} studios`);
    
    if (geocodedStudios > 0) {
      console.log('\n🎯 Map should work! Studios with coordinates:');
      studiosWithCoordinates.forEach((studio, index) => {
        console.log(`   ${index + 1}. ${studio.title} - ${studio.latitude}, ${studio.longitude}`);
      });
    } else {
      console.log('\n⚠️ No studios with coordinates found. Map will be empty.');
      console.log('   Run geocoding first: https://tattooed-world-backend.onrender.com/admin/geocoding');
    }
    
  } catch (error) {
    console.error('❌ Error testing geocoding API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testGeocodingAPI().catch(console.error); 