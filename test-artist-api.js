const axios = require('axios');

// Test configuration
const API_BASE = 'https://tattooed-world-app.onrender.com/api';
const TEST_EMAIL = 'artist@example.com';
const TEST_PASSWORD = 'artist123';

console.log('🧪 Testing Artist API with new validation system...\n');

async function testArtistAPI() {
  try {
    // Step 1: Login to get token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.error);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Set up axios with auth header
    const api = axios.create({
      baseURL: API_BASE,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Step 2: Get current user profile
    console.log('\nStep 2: Getting user profile...');
    const profileResponse = await api.get('/auth/me');
    
    if (!profileResponse.data.success) {
      throw new Error('Failed to get profile: ' + profileResponse.data.error);
    }

    const user = profileResponse.data.data;
    console.log('✅ Profile retrieved successfully');
    console.log('User ID:', user.id);
    console.log('Artist Profile ID:', user.artistProfile?.id);

    // Step 3: Test profile update with valid data
    console.log('\nStep 3: Testing profile update with valid data...');
    const validUpdateData = {
      bio: 'I am the best tattoo artist in Montreal with over 10 years of experience',
      city: 'Montreal',
      specialtyIds: [],
      serviceIds: []
    };

    try {
      const updateResponse = await api.put(`/artists/${user.artistProfile.id}`, validUpdateData);
      
      if (updateResponse.data.success) {
        console.log('✅ Profile update successful with valid data');
        console.log('Updated bio:', updateResponse.data.data.artistProfile.bio);
      } else {
        console.log('❌ Profile update failed:', updateResponse.data.error);
      }
    } catch (error) {
      console.log('❌ Profile update error:', error.response?.data || error.message);
    }

    // Step 4: Test profile update with invalid data (short bio)
    console.log('\nStep 4: Testing profile update with invalid data (short bio)...');
    const invalidUpdateData = {
      bio: 'Short',
      city: 'Montreal'
    };

    try {
      const invalidUpdateResponse = await api.put(`/artists/${user.artistProfile.id}`, invalidUpdateData);
      console.log('❌ Should have failed but succeeded');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correctly rejected invalid data');
        console.log('Error message:', error.response.data.error);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Step 5: Test profile update with empty arrays
    console.log('\nStep 5: Testing profile update with empty arrays...');
    const emptyArraysData = {
      bio: 'Updated bio with enough characters to pass validation',
      city: 'Toronto',
      specialtyIds: [],
      serviceIds: []
    };

    try {
      const emptyArraysResponse = await api.put(`/artists/${user.artistProfile.id}`, emptyArraysData);
      
      if (emptyArraysResponse.data.success) {
        console.log('✅ Profile update successful with empty arrays');
        console.log('Updated city:', emptyArraysResponse.data.data.artistProfile.city);
      } else {
        console.log('❌ Profile update failed:', emptyArraysResponse.data.error);
      }
    } catch (error) {
      console.log('❌ Profile update error:', error.response?.data || error.message);
    }

    console.log('\n🎉 All API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testArtistAPI(); 