#!/usr/bin/env node

// Test Gallery API - Check if gallery endpoints are working
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

console.log('🔍 Testing Gallery API...');
console.log('API URL:', API_URL);
console.log('');

async function testGalleryAPI() {
  try {
    // Test 1: Check if gallery endpoint exists (should return 200 or 401, not 403)
    console.log('1️⃣ Testing GET /gallery (public endpoint)...');
    try {
      const response = await axios.get(`${API_URL}/gallery`);
      console.log('✅ GET /gallery - Status:', response.status);
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ GET /gallery - Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 2: Check if we can get a specific gallery item
    console.log('2️⃣ Testing GET /gallery/:id (public endpoint)...');
    try {
      const response = await axios.get(`${API_URL}/gallery/test-id`);
      console.log('✅ GET /gallery/:id - Status:', response.status);
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ GET /gallery/:id - Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 3: Check if we can create a gallery item (should require auth)
    console.log('3️⃣ Testing POST /gallery (requires authentication)...');
    try {
      const response = await axios.post(`${API_URL}/gallery`, {});
      console.log('✅ POST /gallery - Status:', response.status);
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ POST /gallery - Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 4: Check if we can access with a token
    console.log('4️⃣ Testing with authentication token...');
    const token = 'test-token';
    try {
      const response = await axios.post(`${API_URL}/gallery`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ POST /gallery with token - Status:', response.status);
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ POST /gallery with token - Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 5: Check if the server is running
    console.log('5️⃣ Testing server health...');
    try {
      const response = await axios.get(`${API_URL.replace('/api', '')}/health`);
      console.log('✅ Server health - Status:', response.status);
      console.log('   Response:', response.data);
    } catch (error) {
      console.log('❌ Server health - Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
    }
    console.log('');

    // Test 6: Check if we can access other endpoints
    console.log('6️⃣ Testing other API endpoints...');
    try {
      const response = await axios.get(`${API_URL}/artists`);
      console.log('✅ GET /artists - Status:', response.status);
    } catch (error) {
      console.log('❌ GET /artists - Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
    }

    try {
      const response = await axios.get(`${API_URL}/flash`);
      console.log('✅ GET /flash - Status:', response.status);
    } catch (error) {
      console.log('❌ GET /flash - Status:', error.response?.status);
      console.log('   Error:', error.response?.data || error.message);
    }
    console.log('');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testGalleryAPI().then(() => {
  console.log('🏁 Gallery API test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
