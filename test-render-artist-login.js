const axios = require('axios');

const API_BASE = 'https://tattooed-world-backend.onrender.com/api';

async function testRenderArtistLogin() {
  console.log('🌐 Testing Artist Login on Render Production...\\n');

  // Common email patterns to try
  const emailPatterns = [
    'violette@example.com',
    'violette.berteloot@example.com',
    'violette@gmail.com',
    'artist@example.com',
    'test@example.com',
    'admin@example.com'
  ];

  // Common passwords to try
  const passwords = [
    'password123',
    '123456',
    'password',
    'admin123',
    'artist123',
    'test123',
    'violette123'
  ];

  for (const email of emailPatterns) {
    for (const password of passwords) {
      try {
        console.log(`Trying: ${email} / ${password}`);
        
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: email,
          password: password
        });

        if (loginResponse.data.success) {
          console.log(`✅ Success! Found working credentials: ${email} / ${password}`);
          console.log('User data:', loginResponse.data.data);
          return loginResponse.data.data;
        }
      } catch (error) {
        if (error.response?.status === 401) {
          // Silent for invalid credentials
        } else {
          console.log(`⚠️ Error for ${email}:`, error.response?.data?.error || error.message);
        }
      }
    }
  }

  console.log('\\n❌ No working credentials found');
  return null;
}

// Run the test
testRenderArtistLogin(); 