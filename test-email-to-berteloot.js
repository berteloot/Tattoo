const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function testEmailToBerteloot() {
  console.log('🧪 Testing Email to berteloot@gmail.com\n');

  try {
    // Step 1: Try to register with berteloot@gmail.com
    console.log('1. Attempting registration with berteloot@gmail.com...');
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        firstName: 'Stan',
        lastName: 'Berteloot',
        email: 'berteloot@gmail.com',
        password: 'testpass123',
        role: 'CLIENT'
      });

      if (registerResponse.data.success) {
        console.log('✅ Registration successful');
        console.log('   - User ID:', registerResponse.data.data.user.id);
        console.log('   - Message:', registerResponse.data.message);
        console.log('   - Email should be sent to: berteloot@gmail.com');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ User already exists (expected)');
        console.log('   - Email: berteloot@gmail.com');
        console.log('   - Error:', error.response.data.error);
        console.log('   - Proceeding to send verification email...');
      } else {
        console.log('❌ Registration failed:', error.response?.data?.error || error.message);
        // Don't return, continue with the test
      }
    }

    // Step 2: Send resend verification email
    console.log('\n2. Sending resend verification email...');
    const resendResponse = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, {
      email: 'berteloot@gmail.com'
    });

    if (resendResponse.data.success) {
      console.log('✅ Resend verification successful');
      console.log('   - Message:', resendResponse.data.message);
      console.log('   - Email sent to: berteloot@gmail.com');
    } else {
      console.log('❌ Resend verification failed:', resendResponse.data.error);
    }

    // Step 3: Test login to confirm user status
    console.log('\n3. Testing login status...');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'berteloot@gmail.com',
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

    console.log('\n📧 Email Details:');
    console.log('   - To: berteloot@gmail.com');
    console.log('   - From: stan@altilead.com');
    console.log('   - Subject: "Verify Your Email - Tattooed World 🎨"');
    console.log('   - Contains: Verification link to activate account');

    console.log('\n📋 Next Steps:');
    console.log('   1. Check berteloot@gmail.com inbox');
    console.log('   2. Check spam folder');
    console.log('   3. Click verification link in email');
    console.log('   4. Try logging in after verification');

    console.log('\n🔍 If no email received:');
    console.log('   1. Check SendGrid dashboard for delivery status');
    console.log('   2. Verify SendGrid API key in Render');
    console.log('   3. Check domain authentication in SendGrid');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testEmailToBerteloot(); 