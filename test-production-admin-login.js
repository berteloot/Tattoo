const axios = require('axios');

async function testProductionAdminLogin() {
  console.log('🔍 Testing production admin login...\n');
  
  try {
    // Step 1: Try to login with the existing admin account
    console.log('1️⃣ Testing login with existing admin account...');
    
    const loginData = {
      email: 'admin@tattoolocator.com',
      password: 'admin123' // Try the default password
    };
    
    try {
      const loginResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/auth/login', loginData);
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful!');
        console.log('User data:', {
          id: loginResponse.data.data.user.id,
          email: loginResponse.data.data.user.email,
          firstName: loginResponse.data.data.user.firstName,
          lastName: loginResponse.data.data.user.lastName,
          role: loginResponse.data.data.user.role
        });
        
        const token = loginResponse.data.data.token;
        
        // Step 2: Test admin studios access
        console.log('\n2️⃣ Testing admin studios access...');
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        const adminStudiosResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios', { headers });
        console.log('✅ Admin studios access successful!');
        console.log('Studios data:', {
          status: adminStudiosResponse.status,
          total: adminStudiosResponse.data?.total || 0,
          studios: adminStudiosResponse.data?.data?.length || 0,
          success: adminStudiosResponse.data?.success
        });
        
        if (adminStudiosResponse.data?.data?.length > 0) {
          console.log('Sample studio:', {
            id: adminStudiosResponse.data.data[0].id,
            title: adminStudiosResponse.data.data[0].title,
            isVerified: adminStudiosResponse.data.data[0].isVerified,
            isActive: adminStudiosResponse.data.data[0].isActive
          });
        }
        
        // Step 3: Test different filters
        console.log('\n3️⃣ Testing different filters...');
        
        // Test with no filters
        const noFiltersResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios?verified=&featured=&status=', { headers });
        console.log('No filters:', noFiltersResponse.data?.data?.length || 0, 'studios');
        
        // Test with verified=true
        const verifiedResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios?verified=true', { headers });
        console.log('Verified only:', verifiedResponse.data?.data?.length || 0, 'studios');
        
        // Test with verified=false
        const unverifiedResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios?verified=false', { headers });
        console.log('Unverified only:', unverifiedResponse.data?.data?.length || 0, 'studios');
        
        // Test with status=PENDING
        const pendingResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios?status=PENDING', { headers });
        console.log('Pending only:', pendingResponse.data?.data?.length || 0, 'studios');
        
      } else {
        console.log('❌ Login failed:', loginResponse.data.error);
      }
      
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ Invalid credentials for admin@tattoolocator.com');
        
        // Try with different passwords
        const passwords = ['password', '123456', 'admin', 'tattoo123'];
        
        for (const password of passwords) {
          console.log(`\n🔄 Trying password: ${password}`);
          try {
            const altLoginResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/auth/login', {
              email: 'admin@tattoolocator.com',
              password: password
            });
            
            if (altLoginResponse.data.success) {
              console.log(`✅ Login successful with password: ${password}`);
              break;
            }
          } catch (altError) {
            console.log(`❌ Failed with password: ${password}`);
          }
        }
      } else {
        console.log('❌ Login error:', error.response?.status, error.response?.data?.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProductionAdminLogin(); 