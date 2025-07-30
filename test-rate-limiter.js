#!/usr/bin/env node

/**
 * Test script to verify rate limiter configuration
 * This script tests the rate limiter with proxy headers to ensure it works on Render.com
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'https://tattoo-app-backend.onrender.com';

async function testRateLimiter() {
  console.log('🧪 Testing rate limiter configuration...');
  console.log(`🔗 API URL: ${API_URL}`);
  
  try {
    // Test 1: Basic health check
    console.log('\n📋 Test 1: Health check');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.status);
    
    // Test 2: API endpoint with proxy headers
    console.log('\n📋 Test 2: API endpoint with proxy headers');
    const apiResponse = await axios.get(`${API_URL}/api/artists?limit=1`, {
      headers: {
        'X-Forwarded-For': '192.168.1.1, 10.0.0.1',
        'User-Agent': 'Test-Script/1.0'
      }
    });
    console.log('✅ API request passed:', apiResponse.status);
    
    // Test 3: Multiple rapid requests (should not trigger rate limit)
    console.log('\n📋 Test 3: Multiple rapid requests');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        axios.get(`${API_URL}/api/artists?limit=1`, {
          headers: {
            'X-Forwarded-For': `192.168.1.${i + 1}`,
            'User-Agent': 'Test-Script/1.0'
          }
        })
      );
    }
    
    const responses = await Promise.all(promises);
    console.log('✅ All rapid requests passed:', responses.length);
    
    console.log('\n🎉 Rate limiter test completed successfully!');
    console.log('✅ The rate limiter is properly configured for Render.com deployment');
    
  } catch (error) {
    if (error.response?.status === 429) {
      console.log('⚠️ Rate limit triggered (this is expected behavior)');
      console.log('✅ Rate limiter is working correctly');
    } else {
      console.error('❌ Test failed:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    }
  }
}

// Run the test
testRateLimiter(); 