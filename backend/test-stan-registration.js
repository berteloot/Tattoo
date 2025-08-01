const axios = require('axios');

// Test registration for stan@altilead.com
async function testStanRegistration() {
  console.log('🧪 Testing Registration for stan@altilead.com...\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // Test 1: Register stan@altilead.com
    console.log('1. Registering stan@altilead.com...');
    const registerResponse = await axios.post(`${API_BASE_URL}/api/auth/register`, {
      firstName: 'Stan',
      lastName: 'Berteloot',
      email: 'stan@altilead.com',
      password: 'testpassword123',
      role: 'CLIENT'
    });
    
    console.log('✅ Registration response:');
    console.log('Status:', registerResponse.status);
    console.log('Data:', registerResponse.data);
    
    if (registerResponse.data.requiresEmailVerification) {
      console.log('✅ Email verification required - this is correct!');
    } else {
      console.log('❌ Email verification not required - this is wrong!');
    }
    
    // Test 2: Check if user exists in database
    console.log('\n2. Checking if user was created...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'stan@altilead.com',
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
    
  } catch (error) {
    console.log('❌ Registration failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.data?.error?.includes('already exists')) {
      console.log('\n🔧 User already exists - this might be the issue!');
      console.log('The user exists but might not have a verification token');
    }
  }
}

// Run the test
testStanRegistration().catch(console.error); 