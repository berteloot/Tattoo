const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function testFreshRegistration() {
  console.log('🧪 Testing Fresh Registration\n');

  // Generate a unique email
  const timestamp = Date.now();
  const freshEmail = `fresh-test-${timestamp}@example.com`;
  
  console.log(`📧 Using fresh email: ${freshEmail}\n`);

  try {
    // Step 1: Register new user
    console.log('1. Registering new user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      firstName: 'Fresh',
      lastName: 'User',
      email: freshEmail,
      password: 'testpass123',
      role: 'CLIENT'
    });

    if (registerResponse.data.success) {
      console.log('✅ Registration successful!');
      console.log('   - User ID:', registerResponse.data.data.user.id);
      console.log('   - Message:', registerResponse.data.message);
      console.log('   - Requires verification:', registerResponse.data.data.requiresEmailVerification);
    } else {
      console.log('❌ Registration failed:', registerResponse.data.error);
      return;
    }

    // Step 2: Try to login (should be blocked)
    console.log('\n2. Testing login (should be blocked)...');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: freshEmail,
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

    // Step 3: Test resend verification
    console.log('\n3. Testing resend verification...');
    const resendResponse = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, {
      email: freshEmail
    });

    if (resendResponse.data.success) {
      console.log('✅ Resend verification successful');
      console.log('   - Message:', resendResponse.data.message);
    } else {
      console.log('❌ Resend verification failed:', resendResponse.data.error);
    }

    console.log('\n🎉 Fresh registration test completed!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Check your email for verification link');
    console.log('   2. Click the verification link');
    console.log('   3. Try logging in after verification');
    console.log(`   4. Test email: ${freshEmail}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testFreshRegistration(); 