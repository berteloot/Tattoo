const axios = require('axios');

// Test the quick fix endpoint
async function testQuickFixEndpoint() {
  console.log('🧪 TESTING QUICK FIX ENDPOINT\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // First, login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@tattoolocator.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    
    // Call the quick fix endpoint
    console.log('\n2. Calling quick fix endpoint...');
    const fixResponse = await axios.post(`${API_BASE_URL}/api/admin/quick-fix-verification`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Quick fix successful!');
    console.log('Response:', fixResponse.data);
    
    // Test if your accounts are now accessible
    console.log('\n3. Testing your accounts...');
    
    const accounts = ['stan@altilead.com', 'berteloot@gmail.com'];
    
    for (const email of accounts) {
      try {
        const testResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email: email,
          password: 'testpassword123'
        });
        console.log(`✅ ${email}: Login successful!`);
      } catch (error) {
        if (error.response?.status === 400 && error.response.data.error?.includes('Invalid credentials')) {
          console.log(`⚠️ ${email}: Account exists but password is wrong`);
        } else {
          console.log(`❌ ${email}: ${error.response?.data?.error || 'Unknown error'}`);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
}

// Run the test
testQuickFixEndpoint().catch(console.error); 