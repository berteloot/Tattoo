const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function checkStudiosGeocodingStatus() {
  try {
    console.log('🔍 CHECKING STUDIOS GEOCODING STATUS\n');

    // Step 1: Fetch all studios
    console.log('1️⃣ Fetching all studios...');
    const response = await axios.get(`${API_BASE_URL}/api/studios?limit=1000`);

    if (!response.data.success) {
      throw new Error('Failed to fetch studios');
    }

    const studios = response.data.data.studios || [];
    console.log(`📊 Found ${studios.length} total studios\n`);

    // Step 2: Analyze geocoding status
    const geocodingStats = {
      total: studios.length,
      withCoordinates: 0,
      withoutCoordinates: 0,
      withFallbackCoordinates: 0,
      withRealCoordinates: 0,
      studiosWithCoords: [],
      studiosWithoutCoords: [],
      studiosWithFallback: []
    };

    studios.forEach(studio => {
      const hasCoordinates = studio.latitude && studio.longitude;
      const hasFallbackCoords = studio.latitude === 45.5017 && studio.longitude === -73.5673;
      
      if (hasCoordinates) {
        geocodingStats.withCoordinates++;
        geocodingStats.studiosWithCoords.push(studio);
        
        if (hasFallbackCoords) {
          geocodingStats.withFallbackCoordinates++;
          geocodingStats.studiosWithFallback.push(studio);
        } else {
          geocodingStats.withRealCoordinates++;
        }
      } else {
        geocodingStats.withoutCoordinates++;
        geocodingStats.studiosWithoutCoords.push(studio);
      }
    });

    // Step 3: Display statistics
    console.log('📈 GEOCODING STATISTICS');
    console.log('=======================');
    console.log(`Total studios: ${geocodingStats.total}`);
    console.log(`With coordinates: ${geocodingStats.withCoordinates}`);
    console.log(`Without coordinates: ${geocodingStats.withoutCoordinates}`);
    console.log(`With real coordinates: ${geocodingStats.withRealCoordinates}`);
    console.log(`With fallback coordinates: ${geocodingStats.withFallbackCoordinates}`);
    console.log('');

    // Step 4: Show studios with real coordinates
    if (geocodingStats.withRealCoordinates > 0) {
      console.log('✅ STUDIOS WITH REAL COORDINATES');
      console.log('================================');
      geocodingStats.studiosWithCoords.forEach(studio => {
        if (!(studio.latitude === 45.5017 && studio.longitude === -73.5673)) {
          console.log(`📍 ${studio.title}`);
          console.log(`   Address: ${studio.address}, ${studio.city}, ${studio.state} ${studio.zipCode}`);
          console.log(`   Coordinates: ${studio.latitude}, ${studio.longitude}`);
          console.log('');
        }
      });
    }

    // Step 5: Show studios with fallback coordinates
    if (geocodingStats.withFallbackCoordinates > 0) {
      console.log('⚠️ STUDIOS WITH FALLBACK COORDINATES');
      console.log('====================================');
      geocodingStats.studiosWithFallback.forEach(studio => {
        console.log(`📍 ${studio.title}`);
        console.log(`   Address: ${studio.address}, ${studio.city}, ${studio.state} ${studio.zipCode}`);
        console.log(`   Coordinates: ${studio.latitude}, ${studio.longitude} (Montreal center)`);
        console.log('');
      });
    }

    // Step 6: Show studios without coordinates
    if (geocodingStats.withoutCoordinates > 0) {
      console.log('❌ STUDIOS WITHOUT COORDINATES');
      console.log('==============================');
      geocodingStats.studiosWithoutCoords.forEach(studio => {
        console.log(`📍 ${studio.title}`);
        console.log(`   Address: ${studio.address}, ${studio.city}, ${studio.state} ${studio.zipCode}`);
        console.log(`   Status: No coordinates`);
        console.log('');
      });
    }

    // Step 7: Check automated geocoding system status
    console.log('🤖 AUTOMATED GEOCODING SYSTEM STATUS');
    console.log('====================================');
    try {
      const geocodingStatusResponse = await axios.get(`${API_BASE_URL}/api/admin/geocoding/status`, {
        headers: {
          'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'your-admin-token-here'}`
        }
      });

      if (geocodingStatusResponse.data.success) {
        const status = geocodingStatusResponse.data.data;
        console.log(`Processing: ${status.isProcessing ? 'Yes' : 'No'}`);
        console.log(`Pending studios: ${status.pendingCount}`);
        console.log(`Queue status: ${status.pendingCount > 0 ? 'Active' : 'Empty'}`);
      } else {
        console.log('❌ Could not fetch geocoding system status');
      }
    } catch (error) {
      console.log('❌ Could not fetch geocoding system status:', error.message);
    }

    // Step 8: Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('==================');
    
    if (geocodingStats.withoutCoordinates > 0) {
      console.log(`• ${geocodingStats.withoutCoordinates} studios need geocoding`);
      console.log('• Run: node conservative-geocoding-processor.js');
    }
    
    if (geocodingStats.withFallbackCoordinates > 0) {
      console.log(`• ${geocodingStats.withFallbackCoordinates} studios have fallback coordinates`);
      console.log('• Check GOOGLE_GEOCODE_API_KEY configuration');
      console.log('• Verify addresses include postal codes');
    }
    
    if (geocodingStats.withRealCoordinates > 0) {
      console.log(`• ${geocodingStats.withRealCoordinates} studios have real coordinates`);
      console.log('• These should appear on the map');
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Check the map to see which studios are displayed');
    console.log('2. If only one studio shows, check the map component logic');
    console.log('3. Verify that studios with coordinates are being fetched correctly');
    console.log('4. Check browser console for any JavaScript errors');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the script
checkStudiosGeocodingStatus(); 