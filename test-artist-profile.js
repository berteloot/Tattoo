const axios = require('axios');

// Test configuration
const API_URL = 'http://localhost:3001/api';
const TEST_EMAIL = 'artist@example.com';
const TEST_PASSWORD = 'artist123';

async function testArtistProfileCreation() {
  try {
    console.log('🔍 Testing Artist Profile Creation...\n');

    // Step 1: Login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.error);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Get user profile to check current state
    console.log('2. Getting current user profile...');
    const userResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (userResponse.data.success) {
      const user = userResponse.data.data.user;
      console.log('✅ User profile retrieved');
      console.log(`   - User ID: ${user.id}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Has Artist Profile: ${!!user.artistProfile}`);
      if (user.artistProfile) {
        console.log(`   - Artist Profile ID: ${user.artistProfile.id}`);
      }
    }
    console.log('');

    // Step 3: Check if artist profile already exists
    if (userResponse.data.data.user.artistProfile) {
      console.log('⚠️  Artist profile already exists, testing update instead...');
      
      const updateData = {
        bio: 'Updated bio for testing',
        studioName: 'Updated Test Studio',
        specialtyIds: [],
        serviceIds: []
      };

      const updateResponse = await axios.put(
        `${API_URL}/artists/${userResponse.data.data.user.artistProfile.id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (updateResponse.data.success) {
        console.log('✅ Profile update successful');
        console.log('   Response:', JSON.stringify(updateResponse.data, null, 2));
      } else {
        console.log('❌ Profile update failed');
        console.log('   Error:', updateResponse.data.error);
      }
    } else {
      // Step 4: Create new artist profile
      console.log('3. Creating new artist profile...');
      const profileData = {
        bio: 'Test bio for new artist profile',
        studioName: 'Test Studio',
        website: 'https://teststudio.com',
        instagram: 'testartist',
        calendlyUrl: 'https://calendly.com/testartist/consultation',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'Test Country',
        hourlyRate: '150',
        minPrice: '50',
        maxPrice: '500',
        specialtyIds: [],
        serviceIds: []
      };

      const createResponse = await axios.post(
        `${API_URL}/artists`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (createResponse.data.success) {
        console.log('✅ Profile creation successful');
        console.log('   Response:', JSON.stringify(createResponse.data, null, 2));
      } else {
        console.log('❌ Profile creation failed');
        console.log('   Error:', createResponse.data.error);
        if (createResponse.data.details) {
          console.log('   Details:', JSON.stringify(createResponse.data.details, null, 2));
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testArtistProfileCreation(); 