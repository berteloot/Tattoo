const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@tattoolocator.com';
const ADMIN_PASSWORD = 'admin123';

async function testStudioFetchDebug() {
  try {
    console.log('🧪 Testing Studio Fetch Debug...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error('Admin login failed');
    }

    const token = loginResponse.data.data.token;
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('✅ Admin login successful\n');

    // Step 2: Test basic studio fetch without filters
    console.log('2. Testing basic studio fetch...');
    try {
      const basicResponse = await axios.get(`${API_BASE_URL}/api/admin/studios`, {
        headers: authHeaders
      });
      console.log('✅ Basic fetch successful');
      console.log(`📊 Found ${basicResponse.data.data.studios.length} studios`);
    } catch (error) {
      console.log('❌ Basic fetch failed:', error.response?.data?.error || error.message);
    }

    // Step 3: Test with verified filter
    console.log('\n3. Testing with verified filter...');
    try {
      const verifiedResponse = await axios.get(`${API_BASE_URL}/api/admin/studios?verified=true`, {
        headers: authHeaders
      });
      console.log('✅ Verified filter successful');
      console.log(`📊 Found ${verifiedResponse.data.data.studios.length} verified studios`);
    } catch (error) {
      console.log('❌ Verified filter failed:', error.response?.data?.error || error.message);
    }

    // Step 4: Test with status filter
    console.log('\n4. Testing with status filter...');
    try {
      const statusResponse = await axios.get(`${API_BASE_URL}/api/admin/studios?status=APPROVED`, {
        headers: authHeaders
      });
      console.log('✅ Status filter successful');
      console.log(`📊 Found ${statusResponse.data.data.studios.length} approved studios`);
    } catch (error) {
      console.log('❌ Status filter failed:', error.response?.data?.error || error.message);
    }

    // Step 5: Test with multiple filters (the one that's failing)
    console.log('\n5. Testing with multiple filters...');
    try {
      const multiResponse = await axios.get(`${API_BASE_URL}/api/admin/studios?page=1&limit=20&search=&verified=true&featured=&status=APPROVED`, {
        headers: authHeaders
      });
      console.log('✅ Multiple filters successful');
      console.log(`📊 Found ${multiResponse.data.data.studios.length} studios`);
    } catch (error) {
      console.log('❌ Multiple filters failed:', error.response?.data?.error || error.message);
      if (error.response?.data) {
        console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
      }
    }

    console.log('\n🎉 Studio Fetch Debug Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testStudioFetchDebug(); 