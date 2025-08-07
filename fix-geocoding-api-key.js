const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function diagnoseAndFixGeocoding() {
  console.log('🔍 GEOCODING API KEY DIAGNOSIS\n');
  
  try {
    // Step 1: Test current geocoding service
    console.log('1️⃣ Testing current geocoding service...');
    const testAddress = '1541 Sherbrooke St W, Montreal, Quebec H3G 1L1';
    
    const geocodeResponse = await axios.post(`${API_BASE_URL}/api/geocoding/geocode`, {
      address: testAddress
    });
    
    console.log('📡 Geocoding response:');
    console.log(`   Success: ${geocodeResponse.data.success}`);
    console.log(`   Fallback: ${geocodeResponse.data.fallback || false}`);
    console.log(`   Cached: ${geocodeResponse.data.cached || false}`);
    
    if (geocodeResponse.data.location) {
      console.log(`   Location: ${geocodeResponse.data.location.lat}, ${geocodeResponse.data.location.lng}`);
      
      // Check if it's Montreal center
      const isMontrealCenter = geocodeResponse.data.location.lat === 45.5017 && 
                              geocodeResponse.data.location.lng === -73.5673;
      
      if (isMontrealCenter) {
        console.log('   ⚠️ Using Montreal center coordinates (fallback)');
      } else {
        console.log('   ✅ Using real coordinates!');
      }
    }
    
    // Step 2: Check cache stats
    console.log('\n2️⃣ Checking cache statistics...');
    try {
      const cacheResponse = await axios.get(`${API_BASE_URL}/api/geocoding/cache-stats`);
      console.log('📊 Cache stats:', cacheResponse.data);
    } catch (error) {
      console.log('❌ Could not fetch cache stats:', error.message);
    }
    
    // Step 3: Test with a more specific address
    console.log('\n3️⃣ Testing with specific Montreal address...');
    const specificAddress = '1541 Sherbrooke St W, Montreal, Quebec H3G 1L1, Canada';
    
    const specificResponse = await axios.post(`${API_BASE_URL}/api/geocoding/geocode`, {
      address: specificAddress
    });
    
    console.log('📡 Specific address response:');
    console.log(`   Success: ${specificResponse.data.success}`);
    console.log(`   Fallback: ${specificResponse.data.fallback || false}`);
    
    if (specificResponse.data.location) {
      console.log(`   Location: ${specificResponse.data.location.lat}, ${specificResponse.data.location.lng}`);
      
      const isMontrealCenter = specificResponse.data.location.lat === 45.5017 && 
                              specificResponse.data.location.lng === -73.5673;
      
      if (isMontrealCenter) {
        console.log('   ⚠️ Still using Montreal center coordinates');
      } else {
        console.log('   ✅ Got specific coordinates!');
      }
    }
    
    // Step 4: Provide recommendations
    console.log('\n📋 DIAGNOSIS SUMMARY');
    console.log('===================');
    
    if (geocodeResponse.data.fallback || specificResponse.data.fallback) {
      console.log('❌ ISSUE: API key is not working properly');
      console.log('');
      console.log('🔧 FIX REQUIRED:');
      console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
      console.log('2. Select your project');
      console.log('3. Go to "APIs & Services" > "Credentials"');
      console.log('4. Find your API key and click on it');
      console.log('5. Check these settings:');
      console.log('   ✅ API restrictions: "Geocoding API" should be enabled');
      console.log('   ✅ Application restrictions: Should allow your server IP');
      console.log('   ✅ Billing: Must be enabled for the project');
      console.log('');
      console.log('6. In Render.com dashboard:');
      console.log('   - Go to your service settings');
      console.log('   - Check environment variable: GOOGLE_GEOCODE_API_KEY');
      console.log('   - Make sure it matches your Google Cloud API key');
      console.log('');
      console.log('7. Test the fix:');
      console.log('   node fix-geocoding-api-key.js');
    } else {
      console.log('✅ GOOD NEWS: API key is working!');
      console.log('');
      console.log('🎯 Next steps:');
      console.log('1. Run the background processor:');
      console.log('   node background-geocoding-processor.js');
      console.log('');
      console.log('2. Check the map for updated studio locations');
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the diagnosis
diagnoseAndFixGeocoding(); 