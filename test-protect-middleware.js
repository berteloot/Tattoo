const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testProtectMiddleware() {
  try {
    console.log('🔍 Testing Protect Middleware...\n');

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

    // Test a simple protected route first
    console.log('2. Testing simple protected route...');
    try {
      const profileResponse = await axios.get(`${API_URL}/api/auth/me`, { headers });
      console.log('✅ Profile route working');
    } catch (error) {
      console.log('❌ Profile route failed:', error.response?.data);
    }

    // Test the my-favorites route (which works)
    console.log('3. Testing my-favorites route...');
    try {
      const favoritesResponse = await axios.get(`${API_URL}/api/artists/my-favorites`, { headers });
      console.log('✅ My-favorites route working');
    } catch (error) {
      console.log('❌ My-favorites route failed:', error.response?.data);
    }

    // Test the email-favorites route (which doesn't work)
    console.log('4. Testing email-favorites route...');
    try {
      const emailResponse = await axios.post(`${API_URL}/api/artists/email-favorites`, {
        subject: 'Test',
        message: 'Test',
        sendToAll: true
      }, { headers });
      console.log('✅ Email-favorites route working');
    } catch (error) {
      console.log('❌ Email-favorites route failed:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testProtectMiddleware(); 