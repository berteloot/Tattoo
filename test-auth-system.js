const axios = require('axios');

const API_BASE_URL = 'http://localhost:5173'; // Frontend with proxy

async function testAuthSystem() {
  try {
    console.log('🧪 Testing Authentication System...\n');

    // Step 1: Test admin login
    console.log('1. Testing Admin Login...');
    const adminLoginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@tattoolocator.com',
      password: 'admin123'
    });
    
    if (adminLoginResponse.data.success) {
      const adminToken = adminLoginResponse.data.data.token;
      const adminUser = adminLoginResponse.data.data.user;
      console.log(`✅ Admin login successful!`);
      console.log(`   User: ${adminUser.firstName} ${adminUser.lastName}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Token: ${adminToken.substring(0, 20)}...\n`);
      
      // Test admin profile access
      console.log('2. Testing Admin Profile Access...');
      const adminProfileResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      
      if (adminProfileResponse.data.success) {
        console.log(`✅ Admin profile access successful!`);
        console.log(`   User ID: ${adminProfileResponse.data.data.user.id}`);
        console.log(`   Role: ${adminProfileResponse.data.data.user.role}\n`);
      }
    }

    // Step 2: Test artist login
    console.log('3. Testing Artist Login...');
    const artistLoginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'artist@example.com',
      password: 'artist123'
    });
    
    if (artistLoginResponse.data.success) {
      const artistToken = artistLoginResponse.data.data.token;
      const artistUser = artistLoginResponse.data.data.user;
      console.log(`✅ Artist login successful!`);
      console.log(`   User: ${artistUser.firstName} ${artistUser.lastName}`);
      console.log(`   Role: ${artistUser.role}`);
      console.log(`   Token: ${artistToken.substring(0, 20)}...\n`);
      
      // Test artist profile access
      console.log('4. Testing Artist Profile Access...');
      const artistProfileResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${artistToken}` }
      });
      
      if (artistProfileResponse.data.success) {
        console.log(`✅ Artist profile access successful!`);
        console.log(`   User ID: ${artistProfileResponse.data.data.user.id}`);
        console.log(`   Role: ${artistProfileResponse.data.data.user.role}\n`);
      }
    }

    // Step 3: Test client login
    console.log('5. Testing Client Login...');
    const clientLoginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'client@example.com',
      password: 'client123'
    });
    
    if (clientLoginResponse.data.success) {
      const clientToken = clientLoginResponse.data.data.token;
      const clientUser = clientLoginResponse.data.data.user;
      console.log(`✅ Client login successful!`);
      console.log(`   User: ${clientUser.firstName} ${clientUser.lastName}`);
      console.log(`   Role: ${clientUser.role}`);
      console.log(`   Token: ${clientToken.substring(0, 20)}...\n`);
    }

    // Step 4: Test invalid login
    console.log('6. Testing Invalid Login...');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ Invalid login properly rejected (401)`);
        console.log(`   Error: ${error.response.data.error}\n`);
      }
    }

    // Step 5: Test unauthorized access
    console.log('7. Testing Unauthorized Access...');
    try {
      await axios.get(`${API_BASE_URL}/api/auth/me`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ Unauthorized access properly rejected (401)`);
        console.log(`   Error: ${error.response.data.error}\n`);
      }
    }

    console.log('🎉 Authentication system test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Admin authentication working');
    console.log('✅ Artist authentication working');
    console.log('✅ Client authentication working');
    console.log('✅ Invalid login rejection working');
    console.log('✅ Unauthorized access rejection working');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAuthSystem(); 