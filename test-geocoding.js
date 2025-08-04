const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testGeocoding() {
  try {
    console.log('🧪 TESTING GEOCODING SERVICE\n');
    
    // Test single address geocoding
    console.log('1. Testing single address geocoding...');
    const singleResponse = await axios.post(`${API_BASE_URL}/api/geocoding/geocode`, {
      address: '1234 Main St, Montreal, Quebec'
    });
    
    console.log('✅ Single geocoding result:', singleResponse.data);
    
    // Test batch geocoding
    console.log('\n2. Testing batch geocoding...');
    const batchResponse = await axios.post(`${API_BASE_URL}/api/geocoding/batch-geocode`, {
      addresses: [
        '1234 Main St, Montreal, Quebec',
        '5678 Oak Ave, Montreal, Quebec',
        '910 Pine St, Montreal, Quebec'
      ]
    });
    
    console.log('✅ Batch geocoding result:', batchResponse.data);
    
    // Test with production URL
    console.log('\n3. Testing production geocoding...');
    const prodResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/geocoding/geocode', {
      address: '1234 Main St, Montreal, Quebec'
    });
    
    console.log('✅ Production geocoding result:', prodResponse.data);
    
  } catch (error) {
    console.error('❌ Geocoding test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testGeocoding(); 