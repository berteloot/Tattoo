const axios = require('axios');

// Test profile picture upload endpoint
async function testProfilePictureEndpoint() {
  console.log('🧪 Testing Profile Picture Upload Endpoint...');
  
  const baseURL = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    // Test if the endpoint is accessible (without auth)
    console.log('🔍 Testing endpoint accessibility...');
    
    try {
      const response = await axios.post(`${baseURL}/artists/profile-picture/upload`);
      console.log('❌ Endpoint accessible without auth (should require auth)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint properly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.error);
      }
    }

    // Test server health
    console.log('🏥 Testing server health...');
    
    const healthResponse = await axios.get(`${baseURL.replace('/api', '')}/health`);
    console.log('✅ Server health:', healthResponse.data);

    // Test if we can access any endpoint
    console.log('🎨 Testing artists endpoint...');
    
    try {
      const artistsResponse = await axios.get(`${baseURL}/artists?limit=1`);
      console.log('✅ Artists endpoint working');
    } catch (error) {
      console.log('❌ Artists endpoint failed:', error.response?.status, error.response?.data?.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testProfilePictureEndpoint();
