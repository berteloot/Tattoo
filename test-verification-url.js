const axios = require('axios');

// Test the verification URL
async function testVerificationUrl() {
  console.log('🧪 Testing Verification URL...\n');
  
  const baseUrl = 'https://tattooed-world-backend.onrender.com';
  const verificationUrl = `${baseUrl}/verify-email?token=test-token-123`;
  
  console.log('Testing URL:', verificationUrl);
  
  try {
    // Test if the page loads
    const response = await axios.get(verificationUrl);
    console.log('✅ Verification page loads successfully!');
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers['content-type']);
    
    if (response.data.includes('Email Verification')) {
      console.log('✅ Page contains "Email Verification" content');
    } else {
      console.log('⚠️ Page content might be different than expected');
    }
    
  } catch (error) {
    console.log('❌ Error accessing verification page:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n🔧 404 Error - The route might not be configured correctly');
      console.log('Check if the frontend is properly serving the /verify-email route');
    }
  }
}

// Run the test
testVerificationUrl().catch(console.error); 