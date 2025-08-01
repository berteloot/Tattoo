const axios = require('axios');

// Check production status and apply quick fix
async function checkProductionStatus() {
  console.log('🔍 CHECKING PRODUCTION STATUS\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // First, try to login as admin
    console.log('1. Testing admin login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@tattoolocator.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    
    // Call the quick fix endpoint
    console.log('\n2. Applying quick fix to production...');
    const fixResponse = await axios.post(`${API_BASE_URL}/api/admin/quick-fix-verification`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Quick fix applied successfully!');
    console.log('Response:', fixResponse.data);
    
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
        } else if (error.response?.status === 400 && error.response.data.error?.includes('verify your email')) {
          console.log(`❌ ${account.email}: Still needs email verification`);
        } else {
          console.log(`❌ ${account.email}: ${error.response?.data?.error || 'Unknown error'}`);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Production check failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.status === 401 && error.response.data.error?.includes('verify your email')) {
      console.log('\n🚨 ADMIN ACCOUNT NEEDS VERIFICATION!');
      console.log('The quick fix endpoint cannot be accessed because admin account needs verification.');
      console.log('This confirms that the email verification system is blocking access.');
    }
  }
}

// Run the check
checkProductionStatus().catch(console.error); 