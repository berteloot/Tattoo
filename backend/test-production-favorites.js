const axios = require('axios');

const PRODUCTION_URL = 'https://tattooed-world-backend.onrender.com';

async function testProductionFavorites() {
  try {
    console.log('🧪 Testing production favorites API...');
    
    // Test the favorites check endpoint
    const response = await axios.get(`${PRODUCTION_URL}/api/favorites/check/test-artist-id`, {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ Response:', response.data);
    
  } catch (error) {
    console.log('❌ Error details:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testProductionFavorites(); 