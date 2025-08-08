const axios = require('axios');

async function testStudioLinkingWithAuth() {
  const API_BASE = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    console.log('🔍 Testing Studio Linking with Authentication...\n');
    
    // First, login to get a token
    console.log('1. Logging in to get auth token...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'berteloot@gmail.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received');
    
    // Test POST studio artists endpoint with auth
    console.log('\n2. Testing POST /studios/:id/artists (with auth)...');
    try {
      const postResponse = await axios.post(`${API_BASE}/studios/77d8db63-3248-4ee6-8255-f7fd9cd90eb8/artists`, {
        artistId: 'cmdt3tutq00016mkf85lw12ar',
        role: 'ARTIST'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ POST endpoint working:', postResponse.data);
    } catch (error) {
      console.log('❌ POST endpoint failed:');
      console.log('Status:', error.response?.status);
      console.log('Data:', error.response?.data);
      console.log('Message:', error.message);
    }
    
    console.log('\n🎉 Studio linking auth test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testStudioLinkingWithAuth();
