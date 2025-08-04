const axios = require('axios');

const API_URL = 'https://tattooed-world-backend.onrender.com';

async function testEmailVerificationEndpoint() {
  try {
    console.log('🔍 Testing Email Verification Endpoint...\n');

    // Test 1: Check if the API endpoint is accessible
    console.log('1. Testing API endpoint accessibility...');
    try {
      const healthResponse = await axios.get(`${API_URL}/health`);
      console.log('✅ Health endpoint working:', healthResponse.data);
    } catch (error) {
      console.log('❌ Health endpoint failed:', error.response?.status);
    }

    // Test 2: Test the verify-email endpoint with invalid token
    console.log('\n2. Testing verify-email endpoint with invalid token...');
    try {
      const verifyResponse = await axios.post(`${API_URL}/api/auth/verify-email`, {
        token: 'invalid-token'
      });
      console.log('✅ Verify endpoint working:', verifyResponse.data);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Verify endpoint working (expected 400 for invalid token):', error.response.data);
      } else {
        console.log('❌ Verify endpoint failed:', error.response?.status, error.response?.data);
      }
    }

    // Test 3: Test frontend route accessibility
    console.log('\n3. Testing frontend route accessibility...');
    try {
      const frontendResponse = await axios.get(`${API_URL}/verify-email`);
      console.log('✅ Frontend route accessible (status:', frontendResponse.status, ')');
    } catch (error) {
      console.log('❌ Frontend route failed:', error.response?.status);
      if (error.response?.status === 404) {
        console.log('💡 This suggests the frontend is not being served correctly');
      }
    }

    // Test 4: Test the root path
    console.log('\n4. Testing root path...');
    try {
      const rootResponse = await axios.get(`${API_URL}/`);
      console.log('✅ Root path accessible (status:', rootResponse.status, ')');
    } catch (error) {
      console.log('❌ Root path failed:', error.response?.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEmailVerificationEndpoint(); 