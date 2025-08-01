const axios = require('axios');

// Test the emergency fix endpoint
async function testEmergencyFix() {
  console.log('🚨 TESTING EMERGENCY FIX ENDPOINT\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // Call the emergency fix endpoint (no authentication required)
    console.log('1. Calling emergency fix endpoint...');
    const fixResponse = await axios.post(`${API_BASE_URL}/api/emergency/fix-verification`);
    
    console.log('✅ Emergency fix successful!');
    console.log('Response:', fixResponse.data);
    
    // Test if admin account is now accessible
    console.log('\n2. Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@tattoolocator.com',
      password: 'admin123'
    });
    
    console.log('✅ Admin login successful!');
    console.log('Admin token received');
    
    // Test your accounts
    console.log('\n3. Testing your accounts...');
    
    const accounts = [
      { email: 'stan@altilead.com', password: 'testpassword123' },
      { email: 'berteloot@gmail.com', password: 'testpassword123' }
    ];
    
    for (const account of accounts) {
      try {
        const testResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email: account.email,
          password: account.password
        });
        console.log(`✅ ${account.email}: Login successful!`);
        console.log(`   Role: ${testResponse.data.data.user.role}`);
        console.log(`   Verified: ${testResponse.data.data.user.emailVerified}`);
      } catch (error) {
        if (error.response?.status === 400 && error.response.data.error?.includes('Invalid credentials')) {
          console.log(`⚠️ ${account.email}: Account exists but password is wrong`);
        } else {
          console.log(`❌ ${account.email}: ${error.response?.data?.error || 'Unknown error'}`);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Emergency fix test failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
}

// Run the test
testEmergencyFix().catch(console.error); 