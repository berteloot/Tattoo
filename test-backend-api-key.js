const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function testBackendAPIKey() {
  console.log('🔍 TESTING BACKEND API KEY DIRECTLY\n');

  try {
    // Test 1: Check if the backend geocoding service is working
    console.log('1️⃣ Testing backend geocoding service...');
    const testAddress = '7250 Clark St #105, Montreal, Quebec H2R 2Y3, Canada';
    
    const response = await axios.post(`${API_BASE_URL}/api/geocoding/geocode`, {
      address: testAddress
    });

    console.log('📡 Backend geocoding response:');
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Fallback: ${response.data.fallback || false}`);
    console.log(`   Cached: ${response.data.cached || false}`);
    
    if (response.data.location) {
      console.log(`   Location: ${response.data.location.lat}, ${response.data.location.lng}`);
      
      const isMontrealCenter = response.data.location.lat === 45.5017 && 
                              response.data.location.lng === -73.5673;
      
      if (isMontrealCenter) {
        console.log('   ⚠️ Using Montreal center coordinates (fallback)');
      } else {
        console.log('   ✅ Using real coordinates!');
      }
    }

    // Test 2: Check cache stats
    console.log('\n2️⃣ Checking cache statistics...');
    try {
      const cacheResponse = await axios.get(`${API_BASE_URL}/api/geocoding/cache-stats`);
      console.log('📊 Cache stats:', JSON.stringify(cacheResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Could not fetch cache stats:', error.message);
    }

    // Test 3: Test with a different address
    console.log('\n3️⃣ Testing with a different address...');
    const testAddress2 = '1541 Sherbrooke St W, Montreal, Quebec H3G 1L7, Canada';
    
    const response2 = await axios.post(`${API_BASE_URL}/api/geocoding/geocode`, {
      address: testAddress2
    });

    console.log('📡 Second address response:');
    console.log(`   Success: ${response2.data.success}`);
    console.log(`   Fallback: ${response2.data.fallback || false}`);
    
    if (response2.data.location) {
      console.log(`   Location: ${response2.data.location.lat}, ${response2.data.location.lng}`);
      
      const isMontrealCenter = response2.data.location.lat === 45.5017 && 
                              response2.data.location.lng === -73.5673;
      
      if (isMontrealCenter) {
        console.log('   ⚠️ Still using Montreal center coordinates');
      } else {
        console.log('   ✅ Got different coordinates!');
      }
    }

    // Test 4: Check environment variables
    console.log('\n4️⃣ Checking environment variables...');
    console.log('   Note: Backend environment variables are not accessible from frontend');
    console.log('   The issue is likely that GOOGLE_GEOCODE_API_KEY is not set in Render.com');
    console.log('   or the API key is invalid/restricted');

    // Test 5: Recommendations
    console.log('\n📋 DIAGNOSIS SUMMARY');
    console.log('===================');
    
    if (response.data.fallback || response2.data.fallback) {
      console.log('❌ ISSUE: Backend API key is not working');
      console.log('');
      console.log('🔧 FIX REQUIRED:');
      console.log('1. Go to Render.com dashboard');
      console.log('2. Select your service');
      console.log('3. Go to Environment tab');
      console.log('4. Check if GOOGLE_GEOCODE_API_KEY is set');
      console.log('5. If not set, add it with the same value as VITE_GOOGLE_MAPS_API_KEY');
      console.log('6. If set, verify it matches your Google Cloud API key');
      console.log('7. Redeploy your service');
      console.log('');
      console.log('💡 ALTERNATIVE SOLUTION:');
      console.log('Since the frontend API key works, you can:');
      console.log('1. Use the same API key for both frontend and backend');
      console.log('2. Or create a new API key specifically for backend geocoding');
      console.log('3. Make sure the API key has Geocoding API enabled');
    } else {
      console.log('✅ GOOD NEWS: Backend API key is working!');
      console.log('');
      console.log('🎯 Next steps:');
      console.log('1. Run the geocoding processor again');
      console.log('2. Check the map for updated studio locations');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testBackendAPIKey(); 