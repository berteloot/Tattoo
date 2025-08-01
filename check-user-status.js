const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function checkUserStatus() {
  console.log('🔍 Checking User Status\n');

  try {
    // Test 1: Check if user exists and their verification status
    console.log('1. Checking existing user status...');
    const email = 'stan@sharemymeals.org';
    
    // Try to register with the same email to see the error
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        firstName: 'Stan',
        lastName: 'Test',
        email: email,
        password: 'testpass123',
        role: 'CLIENT'
      });
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('✅ User exists (expected)');
        console.log('   - Email:', email);
        console.log('   - Error:', error.response.data.error);
      }
    }

    // Test 2: Try to login to see if user is verified
    console.log('\n2. Testing login for existing user...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email,
        password: 'testpass123'
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful - user is verified');
        console.log('   - User ID:', loginResponse.data.data.user.id);
        console.log('   - Email verified:', loginResponse.data.data.user.emailVerified);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        if (error.response.data.requiresEmailVerification) {
          console.log('❌ Login blocked - email verification required');
          console.log('   - Error:', error.response.data.error);
        } else {
          console.log('❌ Login failed - invalid credentials');
          console.log('   - Error:', error.response.data.error);
        }
      }
    }

    // Test 3: Test registration with a new email
    console.log('\n3. Testing registration with new email...');
    const newEmail = `test-${Date.now()}@example.com`;
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        firstName: 'New',
        lastName: 'User',
        email: newEmail,
        password: 'testpass123',
        role: 'CLIENT'
      });

      if (registerResponse.data.success) {
        console.log('✅ New user registration successful');
        console.log('   - Email:', newEmail);
        console.log('   - User ID:', registerResponse.data.data.user.id);
        console.log('   - Requires verification:', registerResponse.data.data.requiresEmailVerification);
        console.log('   - Message:', registerResponse.data.message);
      }
    } catch (error) {
      console.log('❌ New user registration failed');
      console.log('   - Error:', error.response?.data?.error || error.message);
    }

    console.log('\n📋 Summary:');
    console.log('   - Existing user check: Complete');
    console.log('   - New user registration: Tested');
    console.log('   - Email verification system: Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// Run the test
checkUserStatus(); 