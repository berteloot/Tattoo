const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@tattoolocator.com';
const ADMIN_PASSWORD = 'admin123';

async function testStudioCreation() {
  try {
    console.log('🧪 Testing Studio Creation Functionality...\n');

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

    // Step 2: Create a new studio
    console.log('2. Creating a new studio...');
    const studioData = {
      title: 'Test Studio Creation',
      website: 'https://teststudio.com',
      phoneNumber: '555-123-4567',
      email: 'test@teststudio.com',
      facebookUrl: 'https://facebook.com/teststudio',
      instagramUrl: 'https://instagram.com/teststudio',
      twitterUrl: 'https://twitter.com/teststudio',
      linkedinUrl: 'https://linkedin.com/teststudio',
      youtubeUrl: 'https://youtube.com/teststudio',
      address: '789 Test Street',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'USA',
      latitude: '40.7128',
      longitude: '-74.0060'
    };

    const createResponse = await axios.post(`${API_BASE_URL}/api/admin/studios`, studioData, {
      headers: authHeaders
    });

    if (createResponse.data.success) {
      console.log('✅ Studio creation successful');
      console.log(`📝 Response: ${createResponse.data.message}`);
      console.log(`📋 Studio ID: ${createResponse.data.data.id}`);
      console.log(`📋 Studio Title: ${createResponse.data.data.title}`);
      console.log(`📋 Verification Status: ${createResponse.data.data.verificationStatus}`);
    } else {
      console.log('❌ Studio creation failed:', createResponse.data.error);
    }

    // Step 3: Verify the studio was created
    console.log('\n3. Verifying studio was created...');
    const studiosResponse = await axios.get(`${API_BASE_URL}/api/admin/studios`, {
      headers: authHeaders
    });

    if (studiosResponse.data.success) {
      const studios = studiosResponse.data.data.studios;
      const createdStudio = studios.find(s => s.title === 'Test Studio Creation');
      
      if (createdStudio) {
        console.log('✅ Studio found in database');
        console.log(`📋 Studio: ${createdStudio.title}`);
        console.log(`📋 Status: ${createdStudio.verificationStatus}`);
        console.log(`📋 Active: ${createdStudio.isActive}`);
        console.log(`📋 Featured: ${createdStudio.isFeatured}`);
      } else {
        console.log('❌ Created studio not found in database');
      }
    } else {
      console.log('❌ Failed to fetch studios:', studiosResponse.data.error);
    }

    // Step 4: Test validation (missing required fields)
    console.log('\n4. Testing validation (missing required fields)...');
    const invalidData = {
      title: 'Invalid Studio',
      // Missing address, city, state
      website: 'https://invalid.com'
    };

    try {
      const invalidResponse = await axios.post(`${API_BASE_URL}/api/admin/studios`, invalidData, {
        headers: authHeaders
      });
      console.log('❌ Validation failed - should have rejected invalid data');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working correctly');
        console.log(`📝 Error: ${error.response.data.error}`);
      } else {
        console.log('❌ Unexpected error during validation test:', error.message);
      }
    }

    // Step 5: Test with minimal required data
    console.log('\n5. Testing with minimal required data...');
    const minimalData = {
      title: 'Minimal Studio',
      address: '123 Minimal St',
      city: 'Minimal City',
      state: 'MS'
    };

    const minimalResponse = await axios.post(`${API_BASE_URL}/api/admin/studios`, minimalData, {
      headers: authHeaders
    });

    if (minimalResponse.data.success) {
      console.log('✅ Minimal studio creation successful');
      console.log(`📝 Response: ${minimalResponse.data.message}`);
      console.log(`📋 Studio: ${minimalResponse.data.data.title}`);
    } else {
      console.log('❌ Minimal studio creation failed:', minimalResponse.data.error);
    }

    console.log('\n🎉 Studio Creation Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testStudioCreation(); 