const axios = require('axios');

async function createAdminAccount() {
  console.log('🔍 Creating admin account...\n');
  
  try {
    // Step 1: Check if we can access the database directly via API
    console.log('1️⃣ Checking if any users exist...');
    
    // Try to register a new admin account with proper password hashing
    console.log('\n2️⃣ Creating admin account with proper password...');
    
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@tattooed-world.com',
      password: 'admin123',
      role: 'ADMIN'
    };
    
    try {
      const registerResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/auth/register', adminData);
      
      if (registerResponse.data.success) {
        console.log('✅ Successfully created admin account!');
        console.log('User data:', {
          id: registerResponse.data.data.user.id,
          email: registerResponse.data.data.user.email,
          firstName: registerResponse.data.data.user.firstName,
          lastName: registerResponse.data.data.user.lastName,
          role: registerResponse.data.data.user.role
        });
        
        // Test login with the new account
        console.log('\n3️⃣ Testing login with new admin account...');
        const loginResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/auth/login', {
          email: adminData.email,
          password: adminData.password
        });
        
        if (loginResponse.data.success) {
          console.log('✅ Login successful!');
          const token = loginResponse.data.data.token;
          
          // Test admin studios access
          console.log('\n4️⃣ Testing admin studios access...');
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
            console.log('Sample studio:', adminStudiosResponse.data.data[0]);
          }
          
        } else {
          console.log('❌ Login failed:', loginResponse.data.error);
        }
        
      } else {
        console.log('❌ Registration failed:', registerResponse.data.error);
      }
      
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('❌ Registration failed - validation error:', error.response.data.error);
        
        // Try with different email
        console.log('\n🔄 Trying with different email...');
        const altAdminData = {
          ...adminData,
          email: 'admin@example.com'
        };
        
        try {
          const altRegisterResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/auth/register', altAdminData);
          
          if (altRegisterResponse.data.success) {
            console.log('✅ Successfully created admin account with alternate email!');
            console.log('Email:', altAdminData.email);
            console.log('Password:', altAdminData.password);
          } else {
            console.log('❌ Alternate registration failed:', altRegisterResponse.data.error);
          }
        } catch (altError) {
          console.log('❌ Alternate registration error:', altError.response?.status, altError.response?.data?.error);
        }
      } else {
        console.log('❌ Registration error:', error.response?.status, error.response?.data?.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

createAdminAccount(); 