const axios = require('axios');

const API_BASE = 'https://tattooed-world-backend.onrender.com';

async function testStudioDetailPage() {
  console.log('🧪 Testing Studio Detail Page Fix...\n');
  
  try {
    // First, get a list of studios to find a valid ID
    console.log('1. Fetching studios list...');
    const studiosResponse = await axios.get(`${API_BASE}/api/studios`);
    
    if (!studiosResponse.data.success || !studiosResponse.data.data.studios.length) {
      console.log('❌ No studios found to test with');
      return;
    }
    
    const studioId = studiosResponse.data.data.studios[0].id;
    console.log(`✅ Found studio ID: ${studioId}`);
    
    // Test the studio detail endpoint
    console.log('\n2. Testing studio detail endpoint...');
    const detailResponse = await axios.get(`${API_BASE}/api/studios/${studioId}`);
    
    if (detailResponse.data.success) {
      console.log('✅ Studio detail endpoint working correctly');
      console.log(`   Studio: ${detailResponse.data.data.title || 'Untitled'}`);
    } else {
      console.log('❌ Studio detail endpoint failed');
      console.log('   Error:', detailResponse.data.error);
    }
    
    // Test the studio artists endpoint
    console.log('\n3. Testing studio artists endpoint...');
    const artistsResponse = await axios.get(`${API_BASE}/api/studios/${studioId}/artists`);
    
    if (artistsResponse.data.success) {
      console.log('✅ Studio artists endpoint working correctly');
      console.log(`   Artists found: ${artistsResponse.data.data.length}`);
    } else {
      console.log('❌ Studio artists endpoint failed');
      console.log('   Error:', artistsResponse.data.error);
    }
    
    console.log('\n🎉 Studio detail page fix verification complete!');
    console.log('   The frontend should now work correctly when clicking "View Details"');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testStudioDetailPage();
