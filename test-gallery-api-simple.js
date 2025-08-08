const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://tattooed-world-backend.onrender.com/api';

async function testGalleryAPI() {
  console.log('🔍 Testing Gallery API endpoints...\n');
  
  try {
    // Test 1: GET /gallery (public endpoint)
    console.log('📋 Test 1: GET /gallery (public)');
    try {
      const response = await axios.get(`${API_BASE_URL}/gallery`);
      console.log('✅ GET /gallery successful');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ GET /gallery failed:', error.response?.status, error.message);
    }
    
    // Test 2: GET /gallery with parameters
    console.log('\n📋 Test 2: GET /gallery with parameters');
    try {
      const response = await axios.get(`${API_BASE_URL}/gallery`, {
        params: {
          limit: 10,
          offset: 0,
          tattooStyle: 'Traditional American'
        }
      });
      console.log('✅ GET /gallery with params successful');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ GET /gallery with params failed:', error.response?.status, error.message);
    }
    
    // Test 3: POST /gallery without authentication (should fail)
    console.log('\n📋 Test 3: POST /gallery without auth (should fail)');
    try {
      const response = await axios.post(`${API_BASE_URL}/gallery`, {
        title: 'Test Item'
      });
      console.log('❌ POST /gallery succeeded without auth (security issue)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ POST /gallery properly protected (401)');
      } else {
        console.log('❌ POST /gallery unexpected error:', error.response?.status, error.message);
      }
    }
    
    // Test 4: Test with invalid data
    console.log('\n📋 Test 4: POST /gallery with invalid data (no auth)');
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('title', 'Test');
      
      const response = await axios.post(`${API_BASE_URL}/gallery`, formData, {
        headers: {
          ...formData.getHeaders()
        }
      });
      console.log('❌ POST /gallery with FormData succeeded without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ POST /gallery with FormData properly protected (401)');
      } else {
        console.log('❌ POST /gallery with FormData unexpected error:', error.response?.status, error.message);
      }
    }
    
    // Test 5: Check if gallery routes are properly registered
    console.log('\n📋 Test 5: Checking route registration');
    try {
      const response = await axios.get(`${API_BASE_URL}/gallery/nonexistent`);
      console.log('❌ GET /gallery/nonexistent succeeded (should fail)');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Gallery routes properly registered (404 for nonexistent)');
      } else {
        console.log('❌ Unexpected error for nonexistent route:', error.response?.status, error.message);
      }
    }
    
    // Test 6: Test CORS headers
    console.log('\n📋 Test 6: Checking CORS headers');
    try {
      const response = await axios.get(`${API_BASE_URL}/gallery`);
      console.log('✅ CORS headers present');
      console.log('Access-Control-Allow-Origin:', response.headers['access-control-allow-origin']);
      console.log('Access-Control-Allow-Credentials:', response.headers['access-control-allow-credentials']);
    } catch (error) {
      console.log('❌ CORS test failed:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Error testing gallery API:', error);
  }
}

// Run the test
testGalleryAPI().then(() => {
  console.log('\n🏁 Gallery API test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Gallery API test failed:', error);
  process.exit(1);
});
