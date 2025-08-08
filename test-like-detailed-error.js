const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com/api';

async function testLikeDetailedError() {
  try {
    console.log('🔍 Detailed Like Error Analysis...\n');
    
    // Test 1: Get gallery items
    console.log('📋 Test 1: Getting gallery items...');
    const galleryResponse = await axios.get(`${API_BASE_URL}/gallery?limit=1`);
    
    if (!galleryResponse.data.success || galleryResponse.data.data.items.length === 0) {
      console.log('❌ No gallery items found');
      return;
    }
    
    const itemId = galleryResponse.data.data.items[0].id;
    console.log(`✅ Using gallery item: ${itemId}`);
    
    // Test 2: Test like endpoint with detailed error capture
    console.log('\n📋 Test 2: Testing like endpoint with detailed error...');
    try {
      const response = await axios.post(`${API_BASE_URL}/gallery/${itemId}/like`, {}, {
        validateStatus: function (status) {
          return true; // Accept all status codes
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log(`📋 Response status: ${response.status}`);
      console.log(`📋 Response data:`, JSON.stringify(response.data, null, 2));
      
      if (response.status === 500) {
        console.log('❌ 500 error detected!');
        console.log('   This suggests a backend issue');
        console.log('   Possible causes:');
        console.log('   1. Missing database tables');
        console.log('   2. Database connection issue');
        console.log('   3. Prisma client issue');
        console.log('   4. Server deployment issue');
      } else if (response.status === 401) {
        console.log('✅ 401 error - authentication required (expected)');
      } else {
        console.log(`📋 Unexpected status: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`📋 Network error: ${error.message}`);
      if (error.response) {
        console.log(`📋 Error status: ${error.response.status}`);
        console.log(`📋 Error data:`, JSON.stringify(error.response.data, null, 2));
      }
    }
    
    // Test 3: Check if other gallery endpoints work
    console.log('\n📋 Test 3: Testing other gallery endpoints...');
    try {
      const detailResponse = await axios.get(`${API_BASE_URL}/gallery/${itemId}`);
      console.log(`✅ Gallery detail endpoint: ${detailResponse.status}`);
    } catch (error) {
      console.log(`❌ Gallery detail endpoint: ${error.response?.status || 'Network error'}`);
    }
    
    // Test 4: Check server health
    console.log('\n📋 Test 4: Checking server health...');
    try {
      const healthResponse = await axios.get(`${API_BASE_URL}/gallery`);
      console.log(`✅ Gallery list endpoint: ${healthResponse.status}`);
      console.log(`   Items returned: ${healthResponse.data.data.items.length}`);
    } catch (error) {
      console.log(`❌ Gallery list endpoint: ${error.response?.status || 'Network error'}`);
    }
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Check if all gallery tables exist in database');
    console.log('   2. Verify Prisma schema is in sync');
    console.log('   3. Check server logs for detailed error');
    console.log('   4. Clear browser cache and try again');
    console.log('   5. Check if user is properly authenticated');
    
  } catch (error) {
    console.error('❌ Error in detailed test:', error.response?.data || error.message);
  }
}

testLikeDetailedError();
