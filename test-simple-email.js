const axios = require('axios');

const API_URL = 'http://localhost:3001';

async function testSimpleEmail() {
  try {
    console.log('🔍 Testing Simple Email Endpoint...\n');

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

    // Test with minimal data
    console.log('2. Testing email-favorites with minimal data...');
    try {
      const emailResponse = await axios.post(`${API_URL}/api/artists/email-favorites`, {
        subject: 'Test',
        message: 'Test',
        sendToAll: true
      }, { headers });
      
      console.log('✅ Email endpoint working');
      console.log('Response:', emailResponse.data);
    } catch (emailError) {
      console.log('❌ Email endpoint error:');
      console.log('Status:', emailError.response?.status);
      console.log('Data:', emailError.response?.data);
      
      // Check if it's a validation error
      if (emailError.response?.status === 400) {
        console.log('This is a validation error, not authorization');
      } else if (emailError.response?.status === 403) {
        console.log('This is an authorization error');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testSimpleEmail(); 