const axios = require('axios');

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

async function testEmailVerification() {
  console.log('🧪 Testing Email Verification System\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: 'test-verification@example.com',
      password: 'testpass123',
      role: 'CLIENT'
    });

    if (registerResponse.data.success) {
      console.log('✅ Registration successful');
      console.log('   - Message:', registerResponse.data.message);
      console.log('   - Requires email verification:', registerResponse.data.data.requiresEmailVerification);
    } else {
      console.log('❌ Registration failed:', registerResponse.data.error);
      return;
    }

    // Test 2: Try to login without email verification
    console.log('\n2. Testing login without email verification...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'test-verification@example.com',
        password: 'testpass123'
      });
      console.log('❌ Login should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 401 && error.response.data.requiresEmailVerification) {
        console.log('✅ Login correctly blocked - email verification required');
        console.log('   - Error:', error.response.data.error);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 3: Test resend verification
    console.log('\n3. Testing resend verification...');
    const resendResponse = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, {
      email: 'test-verification@example.com'
    });

    if (resendResponse.data.success) {
      console.log('✅ Resend verification successful');
      console.log('   - Message:', resendResponse.data.message);
    } else {
      console.log('❌ Resend verification failed:', resendResponse.data.error);
    }

    // Test 4: Test invalid verification token
    console.log('\n4. Testing invalid verification token...');
    try {
      const verifyResponse = await axios.post(`${API_BASE_URL}/api/auth/verify-email`, {
        token: 'invalid-token-123'
      });
      console.log('❌ Verification should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid token correctly rejected');
        console.log('   - Error:', error.response.data.error);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Email verification system tests completed!');
    console.log('\n📧 Check your email for verification links');
    console.log('   - Look for emails from: noreply@tattoolocator.com');
    console.log('   - Subject: "Verify Your Email - Tattooed World 🎨"');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testEmailVerification(); 