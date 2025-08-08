const axios = require('axios');

// Test profile picture upload endpoint
async function testProfilePictureEndpoint() {
  console.log('🔍 Testing Profile Picture Upload Endpoint...');
  
  const baseURL = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    // Test without authentication first
    console.log('🔒 Testing endpoint without authentication...');
    
    try {
      const response = await axios.post(`${baseURL}/artists/profile-picture/upload`, {});
      console.log('✅ Endpoint accessible without auth (unexpected)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint properly protected (401 Unauthorized)');
      } else if (error.response?.status === 403) {
        console.log('✅ Endpoint properly protected (403 Forbidden)');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }

    // Test with invalid token
    console.log('🔒 Testing endpoint with invalid token...');
    
    try {
      const response = await axios.post(`${baseURL}/artists/profile-picture/upload`, {}, {
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('✅ Endpoint accessible with invalid token (unexpected)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint properly rejects invalid token (401 Unauthorized)');
      } else if (error.response?.status === 403) {
        console.log('✅ Endpoint properly rejects invalid token (403 Forbidden)');
      } else {
        console.log('❌ Unexpected error with invalid token:', error.response?.status, error.response?.data);
      }
    }

    // Test the endpoint structure
    console.log('🔍 Testing endpoint structure...');
    
    try {
      const response = await axios.get(`${baseURL}/artists`);
      console.log('✅ Artists endpoint accessible');
      console.log('📊 Artists count:', response.data.data?.pagination?.total || 'unknown');
    } catch (error) {
      console.log('❌ Artists endpoint failed:', error.response?.status, error.response?.data?.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProfilePictureEndpoint();
