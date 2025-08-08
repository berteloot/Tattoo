const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com/api';

async function testLikeWithRealAuth() {
  try {
    console.log('🔐 Testing like endpoint with real authentication...\n');
    
    // Test 1: Get gallery items
    console.log('📋 Test 1: Getting gallery items...');
    const galleryResponse = await axios.get(`${API_BASE_URL}/gallery?limit=1`);
    
    if (!galleryResponse.data.success || galleryResponse.data.data.items.length === 0) {
      console.log('❌ No gallery items found');
      return;
    }
    
    const itemId = galleryResponse.data.data.items[0].id;
    console.log(`✅ Using gallery item: ${itemId}`);
    
    // Test 2: Try to login to get a real token
    console.log('\n📋 Test 2: Attempting login...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: 'stan@altilead.com',
        password: 'admin123'
      });
      
      if (loginResponse.data.success) {
        const token = loginResponse.data.token;
        console.log('✅ Login successful, got token');
        
        // Test 3: Test like with real authentication
        console.log('\n📋 Test 3: Testing like with authentication...');
        try {
          const likeResponse = await axios.post(`${API_BASE_URL}/gallery/${itemId}/like`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            validateStatus: function (status) {
              return true; // Accept all status codes
            }
          });
          
          console.log(`📋 Like response status: ${likeResponse.status}`);
          console.log(`📋 Like response data:`, JSON.stringify(likeResponse.data, null, 2));
          
          if (likeResponse.status === 500) {
            console.log('❌ 500 error with authentication!');
            console.log('   This confirms a backend issue');
            console.log('   Possible causes:');
            console.log('   1. Database constraint issue');
            console.log('   2. Prisma client issue');
            console.log('   3. Missing table or column');
            console.log('   4. Server configuration issue');
          } else if (likeResponse.status === 200) {
            console.log('✅ Like successful!');
          } else {
            console.log(`📋 Unexpected status: ${likeResponse.status}`);
          }
          
        } catch (error) {
          console.log(`📋 Like request error: ${error.message}`);
          if (error.response) {
            console.log(`📋 Error status: ${error.response.status}`);
            console.log(`📋 Error data:`, JSON.stringify(error.response.data, null, 2));
          }
        }
        
      } else {
        console.log('❌ Login failed:', loginResponse.data.error);
      }
      
    } catch (error) {
      console.log('❌ Login error:', error.response?.data || error.message);
    }
    
    console.log('\n🔧 Next steps:');
    console.log('   1. Check server logs for detailed error');
    console.log('   2. Verify all gallery tables exist');
    console.log('   3. Check Prisma schema sync');
    console.log('   4. Verify database connection');
    
  } catch (error) {
    console.error('❌ Error in auth test:', error.response?.data || error.message);
  }
}

testLikeWithRealAuth();
