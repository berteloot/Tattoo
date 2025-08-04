const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testUserObject() {
  try {
    console.log('🔍 Testing User Object Structure...\n');

    // Login as artist
    console.log('1. Logging in as artist...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'artist@example.com',
      password: 'artist123'
    });

    if (!loginResponse.data.success) {
      console.log('❌ Login failed:', loginResponse.data.error);
      return;
    }

    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };

    console.log('✅ Login successful\n');

    // Get user profile to see the structure
    console.log('2. Getting user profile...');
    const profileResponse = await axios.get(`${API_URL}/api/auth/me`, { headers });
    
    if (profileResponse.data.success) {
      const user = profileResponse.data.data.user;
      console.log('✅ User object structure:');
      console.log('   - ID:', user.id);
      console.log('   - Email:', user.email);
      console.log('   - Role:', user.role);
      console.log('   - Artist Profile ID:', user.artistProfile?.id);
      console.log('   - Artist Profile Status:', user.artistProfile?.verificationStatus);
      console.log('   - Full user object:', JSON.stringify(user, null, 2));
    } else {
      console.log('❌ Failed to get profile:', profileResponse.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testUserObject(); 