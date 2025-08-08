const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com/api';

async function testLikeWithAuth() {
  try {
    console.log('🔐 Testing like endpoint with authentication...\n');
    
    // Test 1: Get a gallery item ID
    console.log('📋 Test 1: Getting gallery item...');
    const galleryResponse = await axios.get(`${API_BASE_URL}/gallery?limit=1`);
    
    if (!galleryResponse.data.success || galleryResponse.data.data.items.length === 0) {
      console.log('❌ No gallery items found');
      return;
    }
    
    const itemId = galleryResponse.data.data.items[0].id;
    console.log(`✅ Using gallery item: ${itemId}`);
    
    // Test 2: Try to like without authentication (should fail)
    console.log('\n📋 Test 2: Testing like without authentication...');
    try {
      await axios.post(`${API_BASE_URL}/gallery/${itemId}/like`);
      console.log('❌ Like succeeded without auth (security issue)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Like properly protected (401 Unauthorized)');
        console.log('   Error message:', error.response.data.error);
      } else {
        console.log(`❌ Unexpected error: ${error.response?.status} ${error.message}`);
      }
    }
    
    // Test 3: Check if like endpoint exists and is accessible
    console.log('\n📋 Test 3: Checking like endpoint accessibility...');
    try {
      const response = await axios.post(`${API_BASE_URL}/gallery/${itemId}/like`, {}, {
        validateStatus: function (status) {
          return status < 500; // Accept 401, 403, etc. but not 500
        }
      });
      console.log(`✅ Like endpoint accessible (Status: ${response.status})`);
    } catch (error) {
      if (error.response?.status >= 500) {
        console.log(`❌ Like endpoint server error: ${error.response.status}`);
        console.log('   This indicates a backend issue');
      } else {
        console.log(`✅ Like endpoint working (Status: ${error.response?.status})`);
      }
    }
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Clear browser cache and refresh the page');
    console.log('   2. Check if you are logged in');
    console.log('   3. Try logging out and logging back in');
    console.log('   4. Check browser console for detailed error messages');
    console.log('   5. The like endpoint requires authentication');
    
  } catch (error) {
    console.error('❌ Error testing like with auth:', error.response?.data || error.message);
  }
}

testLikeWithAuth();
