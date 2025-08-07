const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function testRealGeocoding() {
  try {
    console.log('🧪 TESTING REAL GEOCODING WITH GOOGLE API\n');
    
    // Test with a real Montreal address
    const testAddresses = [
      '1234 Saint Catherine St, Montreal, Quebec',
      '5678 Sherbrooke St W, Montreal, Quebec',
      '910 Rue Saint Denis, Montreal, Quebec'
    ];
    
    for (const address of testAddresses) {
      console.log(`🌍 Testing: ${address}`);
      
      const response = await axios.post(`${API_BASE_URL}/api/geocoding/geocode`, {
        address: address
      });
      
      const result = response.data;
      console.log(`✅ Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      
      if (result.success) {
        console.log(`📍 Location: ${result.location.lat}, ${result.location.lng}`);
        console.log(`💾 Cached: ${result.cached}`);
        console.log(`🔄 Fallback: ${result.fallback || false}`);
        console.log(`📋 Source: ${result.source || 'unknown'}`);
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
      
      console.log('---');
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testRealGeocoding(); 