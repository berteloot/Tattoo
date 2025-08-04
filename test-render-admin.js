const axios = require('axios');

const API_BASE = 'https://tattooed-world-backend.onrender.com/api';

async function testRenderAdmin() {
  console.log('🌐 Testing Admin Access on Render Production...\\n');

  try {
    // Step 1: Login as admin
    console.log('1. Logging in as admin on Render...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'berteloot@gmail.com',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Admin login failed on Render');
    }

    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Admin login successful on Render\\n');

    // Step 2: Check admin dashboard
    console.log('2. Testing admin dashboard on Render...');
    const dashboardResponse = await axios.get(`${API_BASE}/admin/dashboard`, { headers });
    
    if (dashboardResponse.data.success) {
      console.log('✅ Admin dashboard accessible on Render');
      console.log('Dashboard data:', dashboardResponse.data.data);
      console.log('');
    } else {
      console.log('❌ Admin dashboard failed on Render:', dashboardResponse.data);
    }

    // Step 3: Check users
    console.log('3. Testing admin users endpoint on Render...');
    const usersResponse = await axios.get(`${API_BASE}/admin/users`, { headers });
    
    if (usersResponse.data.success) {
      const users = usersResponse.data.data.users;
      console.log(`✅ Found ${users.length} users on Render`);
      
      // Show first few users
      users.slice(0, 5).forEach(user => {
        console.log(`- ${user.email} (${user.role}) - ${user.isActive ? 'Active' : 'Inactive'}`);
      });
      console.log('');
    } else {
      console.log('❌ Admin users endpoint failed on Render:', usersResponse.data);
    }

    console.log('\\n🎉 Render Production Admin Test Completed!');

  } catch (error) {
    console.error('❌ Test failed on Render:', error.response?.data || error.message);
  }
}

// Run the test
testRenderAdmin(); 