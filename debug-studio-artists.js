const axios = require('axios');

const API_BASE = 'https://tattooed-world-backend.onrender.com';

async function debugStudioArtists() {
  console.log('🔍 Debugging Studio Artists Endpoint...\n');
  
  try {
    // First, get a studio ID
    console.log('1. Getting studio ID...');
    const studiosResponse = await axios.get(`${API_BASE}/api/studios`);
    const studioId = studiosResponse.data.data.studios[0].id;
    console.log(`✅ Studio ID: ${studioId}`);
    
    // Test the studio artists endpoint
    console.log('\n2. Testing studio artists endpoint...');
    const artistsResponse = await axios.get(`${API_BASE}/api/studios/${studioId}/artists`);
    
    if (artistsResponse.data.success) {
      console.log('✅ Studio artists endpoint working!');
      console.log(`   Artists found: ${artistsResponse.data.data.length}`);
      if (artistsResponse.data.data.length > 0) {
        console.log('   Sample artist:', artistsResponse.data.data[0]);
      }
    } else {
      console.log('❌ Studio artists endpoint failed');
      console.log('   Error:', artistsResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
      
      // Try to get more details about the error
      if (error.response.data && error.response.data.error) {
        console.error('   Error details:', error.response.data.error);
      }
    }
  }
}

debugStudioArtists();
