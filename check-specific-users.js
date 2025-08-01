const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function checkSpecificUsers() {
  console.log('🔍 Checking Specific Users\n');

  const emailsToCheck = [
    'stan@altilead.com',
    'berteloot@gmail.com'
  ];

  for (const email of emailsToCheck) {
    console.log(`\n📧 Checking: ${email}`);
    
    // Try to login to see what happens
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email,
        password: 'testpass123' // Using a test password
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful - user exists and is verified');
        console.log('   - User ID:', loginResponse.data.data.user.id);
        console.log('   - Email verified:', loginResponse.data.data.user.emailVerified);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        if (error.response.data.requiresEmailVerification) {
          console.log('❌ Login blocked - email verification required');
          console.log('   - Error:', error.response.data.error);
          console.log('   - User exists but needs verification');
        } else {
          console.log('❌ Login failed - invalid credentials or user not found');
          console.log('   - Error:', error.response.data.error);
        }
      } else if (error.response?.status === 404) {
        console.log('❌ User not found');
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
  }

  console.log('\n📋 Summary:');
  console.log('   - Check if these users exist in your database');
  console.log('   - If they exist but aren\'t verified, check your email');
  console.log('   - If they don\'t exist, register them first');
}

// Run the check
checkSpecificUsers(); 