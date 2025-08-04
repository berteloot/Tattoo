const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:3001';

async function testStudiosRoute() {
  try {
    console.log('🧪 Testing Studios Route...\n');

    // Test basic studios fetch
    console.log('1. Testing basic studios fetch...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/studios`);
      if (response.data.success) {
        console.log('✅ Studios fetch successful');
        console.log(`📊 Found ${response.data.data.studios.length} studios`);
        console.log(`📊 Total: ${response.data.data.pagination.total} studios`);
      } else {
        console.log('❌ Studios fetch failed:', response.data.error);
      }
    } catch (error) {
      console.log('❌ Studios fetch failed:', error.response?.data?.error || error.message);
    }

    // Test with search filter
    console.log('\n2. Testing studios with search filter...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/studios?search=test`);
      if (response.data.success) {
        console.log('✅ Studios search successful');
        console.log(`📊 Found ${response.data.data.studios.length} studios matching "test"`);
      } else {
        console.log('❌ Studios search failed:', response.data.error);
      }
    } catch (error) {
      console.log('❌ Studios search failed:', error.response?.data?.error || error.message);
    }

    // Test with verified filter
    console.log('\n3. Testing studios with verified filter...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/studios?verified=true`);
      if (response.data.success) {
        console.log('✅ Verified studios fetch successful');
        console.log(`📊 Found ${response.data.data.studios.length} verified studios`);
      } else {
        console.log('❌ Verified studios fetch failed:', response.data.error);
      }
    } catch (error) {
      console.log('❌ Verified studios fetch failed:', error.response?.data?.error || error.message);
    }

    // Test with featured filter
    console.log('\n4. Testing studios with featured filter...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/studios?featured=true`);
      if (response.data.success) {
        console.log('✅ Featured studios fetch successful');
        console.log(`📊 Found ${response.data.data.studios.length} featured studios`);
      } else {
        console.log('❌ Featured studios fetch failed:', response.data.error);
      }
    } catch (error) {
      console.log('❌ Featured studios fetch failed:', error.response?.data?.error || error.message);
    }

    console.log('\n🎉 Studios Route Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testStudiosRoute(); 