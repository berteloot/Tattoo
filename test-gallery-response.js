const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://tattooed-world-backend.onrender.com/api';

async function testGalleryResponse() {
  console.log('🔍 Testing Gallery Response Structure...\n');
  
  try {
    // Test 1: GET /gallery without parameters
    console.log('📋 Test 1: GET /gallery (no params)');
    try {
      const response = await axios.get(`${API_BASE_URL}/gallery`);
      console.log('✅ GET /gallery successful');
      console.log('Response structure:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ GET /gallery failed:', error.response?.status, error.message);
    }
    
    // Test 2: GET /gallery with artistId parameter
    console.log('\n📋 Test 2: GET /gallery with artistId');
    try {
      const response = await axios.get(`${API_BASE_URL}/gallery`, {
        params: { artistId: 'test-artist-id' }
      });
      console.log('✅ GET /gallery with artistId successful');
      console.log('Response structure:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ GET /gallery with artistId failed:', error.response?.status, error.message);
    }
    
    // Test 3: GET /gallery with different parameters
    console.log('\n📋 Test 3: GET /gallery with various params');
    try {
      const response = await axios.get(`${API_BASE_URL}/gallery`, {
        params: { 
          limit: 10,
          offset: 0,
          tattooStyle: 'Traditional American'
        }
      });
      console.log('✅ GET /gallery with various params successful');
      console.log('Response structure:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('❌ GET /gallery with various params failed:', error.response?.status, error.message);
    }
    
  } catch (error) {
    console.error('💥 Error testing gallery response:', error);
  }
}

// Run the test
testGalleryResponse().then(() => {
  console.log('\n🏁 Gallery response test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Gallery response test failed:', error);
  process.exit(1);
});
