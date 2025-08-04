const axios = require('axios');

// Test configuration
const API_BASE = 'https://tattooed-world-backend.onrender.com/api';
const TEST_EMAIL = 'artist@example.com';
const TEST_PASSWORD = 'artist123';

console.log('🧪 Debugging Flash Creation Validation...\n');

async function debugFlashCreation() {
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

    // Step 3: Test with minimal data (what frontend might be sending)
    console.log('\nStep 3: Testing with minimal data...');
    const minimalData = {
      title: 'Test Flash',
      description: '',
      imageUrl: 'https://example.com/test.jpg',
      imagePublicId: 'test-id',
      imageWidth: 800,
      imageHeight: 600,
      imageFormat: 'jpg',
      imageBytes: 102400,
      basePrice: '', // Empty string - this might be the issue
      complexity: 'MEDIUM',
      timeEstimate: 120,
      isRepeatable: true,
      sizePricing: {
        small: { price: 100, time: 60, size: '1-2 inches' },
        medium: { price: 150, time: 90, size: '3-4 inches' },
        large: { price: 200, time: 120, size: '5-6 inches' },
        xlarge: { price: 250, time: 150, size: '7+ inches' }
      },
      tags: [],
      isAvailable: true
    };

    console.log('Sending data:', JSON.stringify(minimalData, null, 2));

    try {
      const response = await api.post('/flash', minimalData);
      console.log('✅ Minimal data test successful!');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ Minimal data test failed');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
    }

    // Step 4: Test with proper data types
    console.log('\nStep 4: Testing with proper data types...');
    const properData = {
      title: 'Test Flash 2',
      description: '',
      imageUrl: 'https://example.com/test2.jpg',
      imagePublicId: 'test-id-2',
      imageWidth: 800,
      imageHeight: 600,
      imageFormat: 'jpg',
      imageBytes: 102400,
      basePrice: 150.00, // Number instead of string
      complexity: 'MEDIUM',
      timeEstimate: 120,
      isRepeatable: true,
      sizePricing: {
        small: { price: 100, time: 60, size: '1-2 inches' },
        medium: { price: 150, time: 90, size: '3-4 inches' },
        large: { price: 200, time: 120, size: '5-6 inches' },
        xlarge: { price: 250, time: 150, size: '7+ inches' }
      },
      tags: [],
      isAvailable: true
    };

    console.log('Sending data:', JSON.stringify(properData, null, 2));

    try {
      const response = await api.post('/flash', properData);
      console.log('✅ Proper data types test successful!');
      console.log('Response:', response.data);
    } catch (error) {
      console.log('❌ Proper data types test failed');
      console.log('Status:', error.response?.status);
      console.log('Error:', error.response?.data);
    }

    console.log('\n🎉 Debug tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
debugFlashCreation(); 