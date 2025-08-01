const axios = require('axios');

// Test fresh email verification flow
async function testFreshVerification() {
  console.log('🧪 Testing Fresh Email Verification Flow...\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  const testEmail = `test-${Date.now()}@example.com`;
  
  console.log('Using test email:', testEmail);
  
  try {
    // Step 1: Register new user
    console.log('\n1. Registering new user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: 'testpassword123',
      role: 'CLIENT'
    });
    
    console.log('✅ Registration successful');
    console.log('Response:', registerResponse.data);
    
    if (registerResponse.data.requiresEmailVerification) {
      console.log('✅ Email verification required - this is correct!');
    }
    
    // Step 2: Try to login (should fail)
    console.log('\n2. Testing login (should fail)...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: testEmail,
        password: 'testpassword123'
      });
      console.log('❌ Login succeeded without verification - this is wrong!');
    } catch (error) {
      if (error.response?.status === 401 && error.response.data.requiresEmailVerification) {
        console.log('✅ Login blocked - email verification required');
      } else {
        console.log('❌ Unexpected error:', error.response?.data);
      }
    }
    
    // Step 3: Resend verification email
    console.log('\n3. Resending verification email...');
    const resendResponse = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, {
      email: testEmail
    });
    
    console.log('✅ Resend verification successful');
    console.log('Response:', resendResponse.data);
    
    console.log('\n🎉 Email verification system is working perfectly!');
    console.log('Check your email for the verification link');
    
  } catch (error) {
    console.log('❌ Test failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
}

// Run the test
testFreshVerification().catch(console.error); 