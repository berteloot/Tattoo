const axios = require('axios');

// Reset stan's password via API
async function resetStanPassword() {
  console.log('🔧 RESETTING STAN PASSWORD VIA API\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // Reset password for stan@altilead.com
    console.log('1. Resetting password for stan@altilead.com...');
    const resetResponse = await axios.post(`${API_BASE_URL}/api/emergency/reset-password`, {
      email: 'stan@altilead.com',
      newPassword: 'stan123456'
    });
    
    console.log('✅ Password reset successful!');
    console.log('Response:', resetResponse.data);
    
    // Test login with new password
    console.log('\n2. Testing login with new password...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'stan@altilead.com',
      password: 'stan123456'
    });
    
    console.log('✅ Login successful with new password!');
    console.log('User data:', {
      id: loginResponse.data.data.user.id,
      email: loginResponse.data.data.user.email,
      role: loginResponse.data.data.user.role,
      emailVerified: loginResponse.data.data.user.emailVerified
    });
    
    console.log('\n🎉 STAN ACCOUNT IS NOW ACCESSIBLE!');
    console.log('Email: stan@altilead.com');
    console.log('Password: stan123456');
    
  } catch (error) {
    console.log('❌ Password reset failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
}

// Run the reset
resetStanPassword().catch(console.error); 