const axios = require('axios');

// Test configuration
const API_BASE = 'https://tattooed-world-backend.onrender.com/api';
const TEST_EMAIL = 'artist@example.com';
const TEST_PASSWORD = 'artist123';

console.log('🧪 Testing Flash Creation with Updated Field Mapping...\n');

async function testFlashCreation() {
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

    if (!user.artistProfile?.id) {
      console.log('❌ User does not have an artist profile. Cannot test flash creation.');
      return;
    }

    // Step 3: Test flash creation with complete data
    console.log('\nStep 3: Testing flash creation with complete data...');
    const flashData = {
      title: 'Test Flash Design',
      description: 'A beautiful test design for testing purposes',
      imageUrl: 'https://example.com/test-image.jpg',
      imagePublicId: 'test-public-id',
      imageWidth: 800,
      imageHeight: 600,
      imageFormat: 'jpg',
      imageBytes: 102400,
      basePrice: 150.00,
      complexity: 'MEDIUM',
      timeEstimate: 120,
      isRepeatable: true,
      sizePricing: {
        small: { price: 100, time: 60, size: '1-2 inches' },
        medium: { price: 150, time: 90, size: '3-4 inches' },
        large: { price: 200, time: 120, size: '5-6 inches' },
        xlarge: { price: 250, time: 150, size: '7+ inches' }
      },
      tags: ['test', 'design', 'tattoo'],
      isAvailable: true
    };

    try {
      const flashResponse = await api.post('/flash', flashData);
      
      if (flashResponse.data.success) {
        console.log('✅ Flash creation successful!');
        console.log('Flash ID:', flashResponse.data.data.flash.id);
        console.log('Title:', flashResponse.data.data.flash.title);
        console.log('Base Price:', flashResponse.data.data.flash.basePrice);
        console.log('Complexity:', flashResponse.data.data.flash.complexity);
        console.log('Time Estimate:', flashResponse.data.data.flash.timeEstimate);
        console.log('Is Repeatable:', flashResponse.data.data.flash.isRepeatable);
        console.log('Size Pricing:', flashResponse.data.data.flash.sizePricing);
        console.log('Tags:', flashResponse.data.data.flash.tags);
      } else {
        console.log('❌ Flash creation failed:', flashResponse.data.error);
      }
    } catch (error) {
      console.log('❌ Flash creation error:', error.response?.data || error.message);
    }

    // Step 4: Test flash creation with minimal data
    console.log('\nStep 4: Testing flash creation with minimal data...');
    const minimalFlashData = {
      title: 'Minimal Test Design',
      imageUrl: 'https://example.com/minimal-image.jpg',
      basePrice: 100.00
    };

    try {
      const minimalFlashResponse = await api.post('/flash', minimalFlashData);
      
      if (minimalFlashResponse.data.success) {
        console.log('✅ Minimal flash creation successful!');
        console.log('Flash ID:', minimalFlashResponse.data.data.flash.id);
        console.log('Title:', minimalFlashResponse.data.data.flash.title);
        console.log('Base Price:', minimalFlashResponse.data.data.flash.basePrice);
        console.log('Complexity (default):', minimalFlashResponse.data.data.flash.complexity);
        console.log('Time Estimate (default):', minimalFlashResponse.data.data.flash.timeEstimate);
        console.log('Is Repeatable (default):', minimalFlashResponse.data.data.flash.isRepeatable);
      } else {
        console.log('❌ Minimal flash creation failed:', minimalFlashResponse.data.error);
      }
    } catch (error) {
      console.log('❌ Minimal flash creation error:', error.response?.data || error.message);
    }

    console.log('\n🎉 Flash creation tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testFlashCreation(); 