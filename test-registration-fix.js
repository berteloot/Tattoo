const axios = require('axios');

const API_URL = 'https://tattooed-world-backend.onrender.com/api';

async function testRegistration() {
  try {
    console.log('🧪 Testing registration functionality...');
    
    const testUser = {
      firstName: 'Test',
      lastName: 'Client',
      email: `testclient${Date.now()}@example.com`,
      password: 'testpass123',
      role: 'CLIENT'
    };

    console.log('📝 Attempting to register test user:', testUser.email);
    
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    
    if (response.status === 201) {
      console.log('✅ Registration successful!');
      console.log('📧 Response:', response.data);
      
      if (response.data.requiresEmailVerification) {
        console.log('📧 Email verification required - this is expected behavior');
      }
      
      return true;
    } else {
      console.log('❌ Registration failed with status:', response.status);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Registration test failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

// Run the test
testRegistration().then(success => {
  if (success) {
    console.log('🎉 Registration functionality is working correctly!');
  } else {
    console.log('💥 Registration functionality has issues');
  }
  process.exit(success ? 0 : 1);
}); 