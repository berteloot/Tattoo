const axios = require('axios');

// Reset password for stan@altilead.com in production
async function resetStanPasswordProduction() {
  console.log('🔧 RESETTING PASSWORD FOR stan@altilead.com IN PRODUCTION\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // Step 1: Try to send password reset email
    console.log('1. Sending password reset email...');
    
    // Note: This assumes you have a password reset endpoint
    // If not, we'll need to create one or use a different approach
    
    const resetResponse = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
      email: 'stan@altilead.com'
    });
    
    console.log('✅ Password reset email sent');
    console.log('Response:', resetResponse.data);
    
  } catch (error) {
    console.log('❌ Password reset failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.status === 404) {
      console.log('\n🔧 Password reset endpoint not available');
      console.log('Alternative solution: Create a new account or contact support');
    }
  }
}

// Run the reset
resetStanPasswordProduction().catch(console.error); 