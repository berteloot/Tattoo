const axios = require('axios');

// Access production database via API
async function accessProductionDB() {
  console.log('🔍 ACCESSING PRODUCTION DATABASE VIA API\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  // Test accounts
  const accounts = ['stan@altilead.com', 'berteloot@gmail.com'];
  
  for (const email of accounts) {
    console.log(`\n🔍 Checking production account: ${email}`);
    
    try {
      // Try to login to see if account exists
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: email,
        password: 'testpassword123' // Try common password
      });
      
      console.log('✅ Account exists and login successful!');
      console.log('Response:', loginResponse.data);
      
    } catch (error) {
      if (error.response?.status === 401 && error.response.data.requiresEmailVerification) {
        console.log('✅ Account exists but needs email verification');
        console.log('Response:', error.response.data);
        
        // Try resend verification
        try {
          const resendResponse = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, {
            email: email
          });
          console.log('✅ Resend verification successful');
          console.log('Check your email for verification link');
        } catch (resendError) {
          console.log('❌ Resend verification failed:', resendError.response?.data);
        }
        
      } else if (error.response?.status === 400 && error.response.data.error?.includes('Invalid credentials')) {
        console.log('✅ Account exists but password is wrong');
        console.log('You need to reset the password');
        
      } else {
        console.log('❌ Account check failed:', error.response?.data);
      }
    }
  }
}

// Run the check
accessProductionDB().catch(console.error); 