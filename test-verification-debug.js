const axios = require('axios');

// Debug the verification issue
async function debugVerification() {
  console.log('🔍 Debugging Email Verification Issue...\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  const token = '47f618d4beefefb9698517fc532ff1ea14ebf1f4469ead9fa5b4106babf4d3e1';
  
  console.log('Token from logs:', token);
  
  try {
    // Test 1: Check if the token exists in the database
    console.log('\n1. Testing verification with token...');
    const verifyResponse = await axios.post(`${API_BASE_URL}/api/auth/verify-email`, {
      token: token
    });
    
    console.log('✅ Verification successful!');
    console.log('Response:', verifyResponse.data);
    
  } catch (error) {
    console.log('❌ Verification failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.status === 400) {
      console.log('\n🔧 400 Error Details:');
      console.log('Error message:', error.response.data.error);
      if (error.response.data.details) {
        console.log('Validation details:', error.response.data.details);
      }
    }
  }
  
  // Test 2: Try to find the user with this token
  console.log('\n2. Testing user lookup...');
  try {
    const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ User found:', userResponse.data);
  } catch (error) {
    console.log('❌ User lookup failed:', error.response?.data);
  }
}

// Run the debug
debugVerification().catch(console.error); 