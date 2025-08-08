const axios = require('axios');

const API_BASE = 'https://tattooed-world-backend.onrender.com';

async function testRouteOrder() {
  console.log('🔍 Testing Route Order...\n');
  
  try {
    // Test 1: Check if the general :id route is working
    console.log('1. Testing general :id route...');
    const artistResponse = await axios.get(`${API_BASE}/api/artists`);
    const artistId = artistResponse.data.data.artists[0].id;
    
    try {
      const generalResponse = await axios.get(`${API_BASE}/api/artists/${artistId}`);
      console.log('✅ General :id route working');
    } catch (error) {
      console.log('❌ General :id route failed:', error.response?.status);
    }

    // Test 2: Check if there are any other routes that might interfere
    console.log('\n2. Testing different route patterns...');
    
    // Test with a route that should not exist
    try {
      const notFoundResponse = await axios.get(`${API_BASE}/api/artists/${artistId}/nonexistent`);
      console.log('⚠️ Unexpected route found');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ 404 for non-existent route (expected)');
      } else {
        console.log('❌ Unexpected response for non-existent route:', error.response?.status);
      }
    }

    // Test 3: Check if the contact route is being caught by the general :id route
    console.log('\n3. Testing if contact route is being caught by :id route...');
    try {
      const contactResponse = await axios.post(`${API_BASE}/api/artists/${artistId}/contact`, {
        subject: 'test',
        message: 'test',
        senderName: 'test',
        senderEmail: 'test@test.com'
      });
      console.log('✅ Contact route working!');
      console.log('   Response:', contactResponse.data);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Contact route returning 404 - likely caught by :id route');
        console.log('   This means the route order is still wrong');
      } else if (error.response?.status === 429) {
        console.log('✅ Contact route working (rate limited as expected)');
      } else {
        console.log('⚠️ Contact route error:', error.response?.status, error.response?.data?.error);
      }
    }

    console.log('\n🔧 Route Order Analysis:');
    console.log('   • If contact route returns 404, it means the :id route is catching it');
    console.log('   • The contact route must be defined BEFORE the :id route');
    console.log('   • Check the route order in the backend files');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRouteOrder();
