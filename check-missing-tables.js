const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com/api';

async function checkMissingTables() {
  try {
    console.log('🔍 Checking for missing gallery tables...\n');
    
    // Test 1: Check if gallery list works
    console.log('📋 Test 1: Gallery list endpoint...');
    try {
      const galleryResponse = await axios.get(`${API_BASE_URL}/gallery?limit=1`);
      console.log(`✅ Gallery list: ${galleryResponse.status}`);
      console.log(`   Items: ${galleryResponse.data.data.items.length}`);
    } catch (error) {
      console.log(`❌ Gallery list: ${error.response?.status || 'Network error'}`);
    }
    
    // Test 2: Check if gallery detail works
    console.log('\n📋 Test 2: Gallery detail endpoint...');
    try {
      const detailResponse = await axios.get(`${API_BASE_URL}/gallery/cme2s2lii0001r0bhw571xmgs`);
      console.log(`✅ Gallery detail: ${detailResponse.status}`);
      if (detailResponse.data.success) {
        console.log(`   Title: ${detailResponse.data.data.title}`);
        console.log(`   _count:`, detailResponse.data.data._count);
        console.log(`   userLiked: ${detailResponse.data.data.userLiked}`);
      }
    } catch (error) {
      console.log(`❌ Gallery detail: ${error.response?.status || 'Network error'}`);
    }
    
    // Test 3: Check if like endpoint returns 500 with detailed error
    console.log('\n📋 Test 3: Like endpoint detailed error...');
    try {
      const likeResponse = await axios.post(`${API_BASE_URL}/gallery/cme2s2lii0001r0bhw571xmgs/like`, {}, {
        validateStatus: function (status) {
          return true; // Accept all status codes
        },
        timeout: 15000 // 15 second timeout
      });
      
      console.log(`📋 Like endpoint status: ${likeResponse.status}`);
      console.log(`📋 Like endpoint data:`, JSON.stringify(likeResponse.data, null, 2));
      
      if (likeResponse.status === 500) {
        console.log('❌ 500 error confirmed!');
        console.log('   This indicates a backend issue');
        console.log('   Possible causes:');
        console.log('   1. Missing tattoo_gallery_likes table');
        console.log('   2. Missing tattoo_gallery_comments table');
        console.log('   3. Missing tattoo_gallery_views table');
        console.log('   4. Database constraint issues');
        console.log('   5. Prisma client not synced');
        console.log('   6. Server deployment issue');
      }
      
    } catch (error) {
      console.log(`📋 Like endpoint error: ${error.message}`);
      if (error.response) {
        console.log(`📋 Error status: ${error.response.status}`);
        console.log(`📋 Error data:`, JSON.stringify(error.response.data, null, 2));
      }
    }
    
    // Test 4: Check if other endpoints work
    console.log('\n📋 Test 4: Other endpoints...');
    try {
      const artistsResponse = await axios.get(`${API_BASE_URL}/artists`);
      console.log(`✅ Artists endpoint: ${artistsResponse.status}`);
    } catch (error) {
      console.log(`❌ Artists endpoint: ${error.response?.status || 'Network error'}`);
    }
    
    console.log('\n🔧 Database Check Required:');
    console.log('   Run this SQL to check if all tables exist:');
    console.log('   SELECT table_name FROM information_schema.tables');
    console.log('   WHERE table_schema = \'public\'');
    console.log('   AND table_name LIKE \'tattoo_gallery%\';');
    
  } catch (error) {
    console.error('❌ Error checking tables:', error.response?.data || error.message);
  }
}

checkMissingTables();
