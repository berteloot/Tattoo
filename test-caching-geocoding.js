const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function testCachingGeocoding() {
  try {
    console.log('🧪 TESTING CACHING GEOCODING SYSTEM\n');
    
    // Test single address geocoding
    console.log('1. Testing single address geocoding...');
    const singleResponse = await axios.post(`${API_BASE_URL}/api/geocoding/geocode`, {
      address: '1234 Main St, Montreal, Quebec'
    });
    
    console.log('✅ Single geocoding result:', singleResponse.data);
    
    // Test the same address again (should be cached)
    console.log('\n2. Testing cached geocoding (same address)...');
    const cachedResponse = await axios.post(`${API_BASE_URL}/api/geocoding/geocode`, {
      address: '1234 Main St, Montreal, Quebec'
    });
    
    console.log('✅ Cached geocoding result:', cachedResponse.data);
    
    // Test batch geocoding with smaller batch
    console.log('\n3. Testing batch geocoding (5 addresses)...');
    const batchResponse = await axios.post(`${API_BASE_URL}/api/geocoding/batch-geocode`, {
      addresses: [
        '1234 Main St, Montreal, Quebec',
        '5678 Oak Ave, Montreal, Quebec',
        '910 Pine St, Montreal, Quebec',
        '1111 Maple Dr, Montreal, Quebec',
        '2222 Cedar Ln, Montreal, Quebec'
      ]
    });
    
    console.log('✅ Batch geocoding result:', batchResponse.data);
    
    // Test cache statistics
    console.log('\n4. Testing cache statistics...');
    const statsResponse = await axios.get(`${API_BASE_URL}/api/geocoding/cache-stats`);
    
    console.log('✅ Cache statistics:', statsResponse.data);
    
  } catch (error) {
    console.error('❌ Caching geocoding test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testCachingGeocoding(); 