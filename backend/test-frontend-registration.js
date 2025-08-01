const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';

async function testFrontendRegistration() {
  console.log('🧪 Testing Frontend Registration Flow\n');

  try {
    // Test 1: Register a new user via API
    console.log('1. Testing registration via API...');
    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      firstName: 'Frontend',
      lastName: 'Test',
      email: 'frontend-test@example.com',
      password: 'testpass123',
      role: 'CLIENT'
    });

    if (registerResponse.data.success) {
      console.log('✅ Registration successful');
      console.log('   - Message:', registerResponse.data.message);
      console.log('   - Requires email verification:', registerResponse.data.data.requiresEmailVerification);
      console.log('   - User ID:', registerResponse.data.data.user.id);
    } else {
      console.log('❌ Registration failed:', registerResponse.data.error);
      return;
    }

    // Test 2: Try to login without verification
    console.log('\n2. Testing login without verification...');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'frontend-test@example.com',
        password: 'testpass123'
      });
      console.log('❌ Login should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 401 && error.response.data.requiresEmailVerification) {
        console.log('✅ Login correctly blocked - email verification required');
        console.log('   - Error message:', error.response.data.error);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 3: Test resend verification endpoint
    console.log('\n3. Testing resend verification...');
    const resendResponse = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, {
      email: 'frontend-test@example.com'
    });

    if (resendResponse.data.success) {
      console.log('✅ Resend verification successful');
      console.log('   - Message:', resendResponse.data.message);
    } else {
      console.log('❌ Resend verification failed:', resendResponse.data.error);
    }

    console.log('\n🎉 Frontend registration flow test completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Open browser to:', FRONTEND_URL);
    console.log('   2. Try registering a new user');
    console.log('   3. Check that you get redirected to login');
    console.log('   4. Try logging in with unverified account');
    console.log('   5. Check error message about email verification');
    console.log('   6. Use resend verification link if needed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testFrontendRegistration(); 