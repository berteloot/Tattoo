const axios = require('axios');

async function testAdminCredentials() {
  console.log('🔍 Testing admin credentials and user accounts...\n');
  
  try {
    // Test different possible admin credentials
    const testCredentials = [
      { email: 'berteloot@gmail.com', password: 'admin123' },
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'stan@berteloot.org', password: 'admin123' },
      { email: 'admin@tattooed-world.com', password: 'admin123' },
      { email: 'berteloot@gmail.com', password: 'password' },
      { email: 'berteloot@gmail.com', password: '123456' },
      { email: 'berteloot@gmail.com', password: 'admin' }
    ];
    
    console.log('1️⃣ Testing different admin credentials...');
    
    for (let i = 0; i < testCredentials.length; i++) {
      const creds = testCredentials[i];
      console.log(`\n📋 Testing: ${creds.email} / ${creds.password}`);
      
      try {
        const loginResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/auth/login', creds);
        
        if (loginResponse.data.success) {
          console.log('✅ SUCCESS! Found working credentials');
          console.log('User data:', {
            id: loginResponse.data.data.user.id,
            email: loginResponse.data.data.user.email,
            firstName: loginResponse.data.data.user.firstName,
            lastName: loginResponse.data.data.user.lastName,
            role: loginResponse.data.data.user.role
          });
          
          // Test if this user can access admin studios
          const token = loginResponse.data.data.token;
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };
          
          try {
            const adminResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios', { headers });
            console.log('✅ Admin studios access:', {
              status: adminResponse.status,
              total: adminResponse.data?.total || 0,
              studios: adminResponse.data?.data?.length || 0
            });
          } catch (adminError) {
            console.log('❌ Admin studios access failed:', adminError.response?.status, adminError.response?.data?.error);
          }
          
          return; // Found working credentials
        } else {
          console.log('❌ Login failed:', loginResponse.data.error);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('❌ Invalid credentials');
        } else {
          console.log('❌ Error:', error.response?.status, error.response?.data?.error);
        }
      }
    }
    
    console.log('\n❌ No working admin credentials found');
    
    // Try to register a new admin account
    console.log('\n2️⃣ Attempting to register a new admin account...');
    try {
      const registerResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/auth/register', {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@tattooed-world.com',
        password: 'admin123',
        role: 'ADMIN'
      });
      
      if (registerResponse.data.success) {
        console.log('✅ Successfully registered admin account');
        console.log('User data:', registerResponse.data.data.user);
      } else {
        console.log('❌ Registration failed:', registerResponse.data.error);
      }
    } catch (error) {
      console.log('❌ Registration error:', error.response?.status, error.response?.data?.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminCredentials(); 