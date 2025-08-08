const axios = require('axios');

async function testStudioLinking() {
  const API_BASE = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    console.log('🔍 Testing Studio Linking Endpoints...\n');
    
    // Test 1: GET studio artists endpoint
    console.log('1. Testing GET /studios/:id/artists...');
    try {
      const getResponse = await axios.get(`${API_BASE}/studios/77d8db63-3248-4ee6-8255-f7fd9cd90eb8/artists`);
      console.log('✅ GET endpoint working:', getResponse.data);
    } catch (error) {
      console.log('❌ GET endpoint failed:', error.response?.data || error.message);
    }
    
    // Test 2: POST studio artists endpoint (without auth)
    console.log('\n2. Testing POST /studios/:id/artists (no auth)...');
    try {
      const postResponse = await axios.post(`${API_BASE}/studios/77d8db63-3248-4ee6-8255-f7fd9cd90eb8/artists`, {
        artistId: 'test-artist-id',
        role: 'ARTIST'
      });
      console.log('✅ POST endpoint working:', postResponse.data);
    } catch (error) {
      console.log('❌ POST endpoint failed:', error.response?.data || error.message);
    }
    
    // Test 3: Check if studio exists
    console.log('\n3. Testing studio existence...');
    try {
      const studioResponse = await axios.get(`${API_BASE}/studios/77d8db63-3248-4ee6-8255-f7fd9cd90eb8`);
      console.log('✅ Studio exists:', studioResponse.data);
    } catch (error) {
      console.log('❌ Studio not found:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 Studio linking endpoint tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testStudioLinking();
