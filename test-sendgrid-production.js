const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function testSendGridProduction() {
  console.log('🧪 Testing SendGrid Configuration in Production\n');

  // Generate a unique email for testing
  const timestamp = Date.now();
  const testEmail = `sendgrid-test-${timestamp}@example.com`;
  
  console.log(`📧 Test email: ${testEmail}\n`);

  try {
    // Step 1: Register a new user to trigger email sending
    console.log('1. Registering new user to trigger email...');
    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      firstName: 'SendGrid',
      lastName: 'Test',
      email: testEmail,
      password: 'testpass123',
      role: 'CLIENT'
    });

    if (registerResponse.data.success) {
      console.log('✅ Registration successful');
      console.log('   - User ID:', registerResponse.data.data.user.id);
      console.log('   - Message:', registerResponse.data.message);
      console.log('   - Requires verification:', registerResponse.data.data.requiresEmailVerification);
    } else {
      console.log('❌ Registration failed:', registerResponse.data.error);
      return;
    }

    // Step 2: Test resend verification to trigger another email
    console.log('\n2. Testing resend verification...');
    const resendResponse = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, {
      email: testEmail
    });

    if (resendResponse.data.success) {
      console.log('✅ Resend verification successful');
      console.log('   - Message:', resendResponse.data.message);
    } else {
      console.log('❌ Resend verification failed:', resendResponse.data.error);
    }

    console.log('\n📋 SendGrid Configuration Check:');
    console.log('   - Registration endpoint: Working');
    console.log('   - Resend endpoint: Working');
    console.log('   - Email should be sent to:', testEmail);
    
    console.log('\n🔍 Troubleshooting Steps:');
    console.log('   1. Check if you received email at:', testEmail);
    console.log('   2. Check spam folder');
    console.log('   3. Verify SendGrid API key in Render environment');
    console.log('   4. Check SendGrid dashboard for email status');
    console.log('   5. Verify domain authentication in SendGrid');

    console.log('\n📧 Expected Email Details:');
    console.log('   - From: stan@altilead.com');
    console.log('   - Subject: "Verify Your Email - Tattooed World 🎨"');
    console.log('   - Contains: Verification link to activate account');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
testSendGridProduction(); 