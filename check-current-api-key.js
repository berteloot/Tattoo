const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function checkCurrentAPIKey() {
  console.log('🔍 CHECKING CURRENT API KEY CONFIGURATION\n');
  
  try {
    // Test the geocoding service to see what's happening
    console.log('1️⃣ Testing geocoding service...');
    const response = await axios.post(`${API_BASE_URL}/api/geocoding/geocode`, {
      address: '1541 Sherbrooke St W, Montreal, Quebec H3G 1L1'
    });
    
    console.log('📡 Response details:');
    console.log(`   Success: ${response.data.success}`);
    console.log(`   Fallback: ${response.data.fallback || false}`);
    console.log(`   Cached: ${response.data.cached || false}`);
    
    if (response.data.fallback) {
      console.log('\n❌ ISSUE: Using fallback coordinates');
      console.log('   This means GOOGLE_GEOCODE_API_KEY is either:');
      console.log('   - Not set in Render.com environment variables');
      console.log('   - Invalid or expired');
      console.log('   - Not properly configured in Google Cloud Console');
    }
    
    // Check cache stats to see if there are any successful geocoding attempts
    console.log('\n2️⃣ Checking cache statistics...');
    const cacheResponse = await axios.get(`${API_BASE_URL}/api/geocoding/cache-stats`);
    console.log('📊 Cache stats:', JSON.stringify(cacheResponse.data, null, 2));
    
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Go to your Render.com dashboard');
    console.log('2. Select your service');
    console.log('3. Go to Environment tab');
    console.log('4. Check if GOOGLE_GEOCODE_API_KEY is set');
    console.log('5. If not set or incorrect, add/update it');
    console.log('6. Redeploy your service');
    console.log('7. Test again with: node fix-geocoding-api-key.js');
    
  } catch (error) {
    console.error('❌ Error checking API key:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

checkCurrentAPIKey(); 