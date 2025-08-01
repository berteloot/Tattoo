const axios = require('axios');

// Test the frontend API configuration
async function testFrontendAPI() {
  try {
    console.log('🔍 Testing Frontend API Configuration...\n');

    // Test 1: Check if the API base URL is accessible
    console.log('1. Testing API base URL...');
    try {
      const response = await axios.get('http://localhost:3001/api/specialties');
      console.log('✅ API base URL is accessible');
      console.log(`   - Status: ${response.status}`);
      console.log(`   - Specialties count: ${response.data.data.specialties.length}`);
    } catch (error) {
      console.log('❌ API base URL is not accessible');
      console.log(`   - Error: ${error.message}`);
    }
    console.log('');

    // Test 2: Test with proxy configuration (like frontend)
    console.log('2. Testing with proxy-like configuration...');
    try {
      const response = await axios.get('http://localhost:5173/api/specialties');
      console.log('✅ Proxy configuration works');
      console.log(`   - Status: ${response.status}`);
    } catch (error) {
      console.log('❌ Proxy configuration failed');
      console.log(`   - Error: ${error.message}`);
    }
    console.log('');

    // Test 3: Test authentication flow
    console.log('3. Testing authentication flow...');
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'artist@example.com',
        password: 'artist123'
      });

      if (loginResponse.data.success) {
        const token = loginResponse.data.data.token;
        console.log('✅ Login successful');

        // Test authenticated request
        const userResponse = await axios.get('http://localhost:3001/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (userResponse.data.success) {
          console.log('✅ Authenticated request successful');
          console.log(`   - User: ${userResponse.data.data.user.firstName} ${userResponse.data.data.user.lastName}`);
          console.log(`   - Role: ${userResponse.data.data.user.role}`);
        } else {
          console.log('❌ Authenticated request failed');
        }
      } else {
        console.log('❌ Login failed');
      }
    } catch (error) {
      console.log('❌ Authentication test failed');
      console.log(`   - Error: ${error.message}`);
    }
    console.log('');

    // Test 4: Test artist profile endpoints
    console.log('4. Testing artist profile endpoints...');
    try {
      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'artist@example.com',
        password: 'artist123'
      });

      if (loginResponse.data.success) {
        const token = loginResponse.data.data.token;
        const user = loginResponse.data.data.user;

        if (user.artistProfile) {
          console.log('✅ User has artist profile');
          
          // Test getting artist profile
          const profileResponse = await axios.get(`http://localhost:3001/api/artists/${user.artistProfile.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (profileResponse.data.success) {
            console.log('✅ Artist profile retrieval successful');
          } else {
            console.log('❌ Artist profile retrieval failed');
          }
        } else {
          console.log('⚠️  User does not have artist profile');
        }
      }
    } catch (error) {
      console.log('❌ Artist profile test failed');
      console.log(`   - Error: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testFrontendAPI(); 