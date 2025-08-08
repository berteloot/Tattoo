const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com/api';

async function testLikeDebug() {
  try {
    console.log('🔍 Debugging like endpoint...\n');
    
    // Test 1: Get a gallery item ID
    console.log('📋 Test 1: Getting gallery item...');
    const galleryResponse = await axios.get(`${API_BASE_URL}/gallery?limit=1`);
    
    if (!galleryResponse.data.success || galleryResponse.data.data.items.length === 0) {
      console.log('❌ No gallery items found');
      return;
    }
    
    const itemId = galleryResponse.data.data.items[0].id;
    console.log(`✅ Using gallery item: ${itemId}`);
    
    // Test 2: Try to like without authentication (should fail with 401)
    console.log('\n📋 Test 2: Testing like without authentication...');
    try {
      await axios.post(`${API_BASE_URL}/gallery/${itemId}/like`);
      console.log('❌ Like succeeded without auth (security issue)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Like properly protected (401 Unauthorized)');
        console.log('   Error message:', error.response.data.error);
      } else if (error.response?.status === 500) {
        console.log('❌ Like endpoint server error (500)');
        console.log('   Error details:', error.response.data);
        console.log('   This indicates a backend issue - likely database schema problem');
      } else {
        console.log(`❌ Unexpected error: ${error.response?.status} ${error.message}`);
        console.log('   Error details:', error.response?.data);
      }
    }
    
    // Test 3: Check if the like endpoint is accessible at all
    console.log('\n📋 Test 3: Checking like endpoint accessibility...');
    try {
      const response = await axios.post(`${API_BASE_URL}/gallery/${itemId}/like`, {}, {
        validateStatus: function (status) {
          return true; // Accept all status codes
        }
      });
      console.log(`📋 Like endpoint response: ${response.status}`);
      console.log('   Response data:', response.data);
    } catch (error) {
      console.log(`📋 Like endpoint error: ${error.response?.status || 'Network error'}`);
      console.log('   Error details:', error.response?.data || error.message);
    }
    
    console.log('\n🔧 Possible issues:');
    console.log('   1. Database table "tattoo_gallery_likes" might not exist');
    console.log('   2. Prisma schema might not be in sync with database');
    console.log('   3. Database connection issue');
    console.log('   4. Unique constraint violation');
    
    console.log('\n💡 Next steps:');
    console.log('   1. Check if tattoo_gallery_likes table exists in database');
    console.log('   2. Run Prisma migrations if needed');
    console.log('   3. Check database connection');
    console.log('   4. Verify schema.prisma file');
    
  } catch (error) {
    console.error('❌ Error debugging like:', error.response?.data || error.message);
  }
}

testLikeDebug();
