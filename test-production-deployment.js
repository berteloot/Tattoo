const axios = require('axios');

async function testProductionDeployment() {
  console.log('🔍 Testing production deployment status...\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get('https://tattooed-world-backend.onrender.com/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test 2: Public studios endpoint (should work now)
    console.log('\n2️⃣ Testing public studios endpoint...');
    const studiosResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/studios');
    console.log('✅ Public studios endpoint working:', {
      status: studiosResponse.status,
      dataLength: studiosResponse.data?.data?.length || 0,
      success: studiosResponse.data?.success
    });
    
    // Test 3: Admin studios endpoint (should work now)
    console.log('\n3️⃣ Testing admin studios endpoint (without auth)...');
    try {
      const adminResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios');
      console.log('❌ Admin endpoint should require auth but returned:', adminResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Admin endpoint correctly requires authentication');
      } else if (error.response?.status === 500) {
        console.log('❌ Admin endpoint still has 500 error - deployment not updated yet');
        console.log('Error details:', error.response?.data);
      } else {
        console.log('⚠️ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    console.log('\n🎯 Deployment Status Summary:');
    console.log('- Health endpoint: ✅ Working');
    console.log('- Public studios: ✅ Working');
    console.log('- Admin studios: ⏳ Check authentication requirement');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testProductionDeployment(); 