const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testEmailEndpoint() {
  try {
    console.log('🔍 Testing Email Endpoint Directly...\n');

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

    // Test the email endpoint directly
    console.log('2. Testing email-favorites endpoint...');
    try {
      const emailResponse = await axios.post(`${API_URL}/api/artists/email-favorites`, {
        subject: 'Test Subject',
        message: 'Test Message',
        sendToAll: true
      }, { headers });
      
      console.log('✅ Email endpoint working');
      console.log('Response:', emailResponse.data);
    } catch (emailError) {
      console.log('❌ Email endpoint error:');
      console.log('Status:', emailError.response?.status);
      console.log('Data:', emailError.response?.data);
      console.log('URL:', emailError.config?.url);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testEmailEndpoint(); 