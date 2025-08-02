const axios = require('axios');

// Test deployment status
async function testDeploymentStatus() {
  console.log('🔍 CHECKING DEPLOYMENT STATUS\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // Test basic API health
    console.log('1. Testing API health...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ API is running');
    
    // Test emergency endpoint
    console.log('\n2. Testing emergency endpoint...');
    const emergencyResponse = await axios.post(`${API_BASE_URL}/api/emergency/fix-verification`);
    console.log('✅ Emergency fix endpoint is available!');
    console.log('Response:', emergencyResponse.data);
    
    // Test admin login
    console.log('\n3. Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@tattoolocator.com',
      password: 'admin123'
    });
    console.log('✅ Admin login successful!');
    
    console.log('\n🎉 DEPLOYMENT COMPLETE! All systems are working.');
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('⏳ Deployment still in progress... Emergency endpoint not yet available');
    } else {
      console.log('❌ Error:', error.response?.data || error.message);
    }
  }
}

// Run the test
testDeploymentStatus().catch(console.error); 