const axios = require('axios');

// Check production database for stan@altilead.com
async function checkProductionUser() {
  console.log('🔍 Checking Production Database for stan@altilead.com...\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // Test 1: Try to login to see if user exists
    console.log('1. Testing login for stan@altilead.com...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'stan@altilead.com',
        password: 'testpassword123'
      });
      console.log('❌ Login succeeded without verification - this is wrong!');
    } catch (error) {
      if (error.response?.status === 401 && error.response.data.requiresEmailVerification) {
        console.log('✅ Login blocked - email verification required');
        console.log('This confirms the user exists and needs verification');
      } else if (error.response?.status === 400 && error.response.data.error?.includes('Invalid credentials')) {
        console.log('✅ User exists but password is wrong');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }
    
    // Test 2: Try resend verification to see if user has a token
    console.log('\n2. Testing resend verification...');
    try {
      const resendResponse = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, {
        email: 'stan@altilead.com'
      });
      console.log('✅ Resend verification successful:');
      console.log('Response:', resendResponse.data);
    } catch (error) {
      console.log('❌ Resend verification failed:');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
    }
    
  } catch (error) {
    console.log('❌ API error:', error.message);
  }
}

// Run the check
checkProductionUser().catch(console.error); 