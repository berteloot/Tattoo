const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAuthDebug() {
  console.log('🔍 Testing authorization debug...\\n');

  try {
    // Step 1: Login as artist
    console.log('1. Logging in as artist...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'artist@example.com',
      password: 'artist123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Artist login failed');
    }

    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Artist login successful\\n');

    // Step 2: Test a simple endpoint that should work for artists
    console.log('2. Testing artist profile endpoint...');
    const profileResponse = await axios.get(`${API_BASE}/auth/me`, { headers });
    
    if (profileResponse.data.success) {
      const user = profileResponse.data.data;
      console.log('User role:', user.user?.role || user.role);
      console.log('User structure:', Object.keys(user));
      console.log('');
    }

    // Step 3: Test the my-favorites endpoint directly
    console.log('3. Testing my-favorites endpoint...');
    try {
      const favoritesResponse = await axios.get(`${API_BASE}/artists/my-favorites`, { headers });
      console.log('✅ Favorites endpoint response:', favoritesResponse.data);
    } catch (error) {
      console.log('❌ Favorites endpoint error:', error.response?.data);
      console.log('Status:', error.response?.status);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testAuthDebug(); 