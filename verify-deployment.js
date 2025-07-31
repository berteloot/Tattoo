#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Tests the deployed application endpoints
 */

const https = require('https');
const http = require('http');

// Update to the correct URL based on the logs
const BASE_URL = 'https://tattooed-world-backend.onrender.com';

// Test configuration
const tests = [
  {
    name: 'Health Check',
    path: '/health',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'API Info',
    path: '/api',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Artists API',
    path: '/api/artists',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Frontend Root',
    path: '/',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Login Page',
    path: '/login',
    method: 'GET',
    expectedStatus: 200
  }
];

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, { method }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing Tattooed World App Deployment...\n');
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`🧪 Testing: ${test.name}`);
      console.log(`   URL: ${BASE_URL}${test.path}`);
      
      const response = await makeRequest(`${BASE_URL}${test.path}`, test.method);
      
      if (response.status === test.expectedStatus) {
        console.log(`   ✅ PASS - Status: ${response.status}`);
        passed++;
      } else {
        console.log(`   ❌ FAIL - Expected: ${test.expectedStatus}, Got: ${response.status}`);
        failed++;
      }
      
      // Show response preview for API endpoints
      if (test.path.startsWith('/api') && response.data) {
        try {
          const jsonData = JSON.parse(response.data);
          console.log(`   📄 Response: ${JSON.stringify(jsonData, null, 2).substring(0, 200)}...`);
        } catch (e) {
          console.log(`   📄 Response: ${response.data.substring(0, 200)}...`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
      failed++;
    }
    
    console.log('');
  }

  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your app is deployed successfully.');
    console.log(`🌐 Your app is live at: ${BASE_URL}`);
  } else {
    console.log('\n⚠️  Some tests failed. Check the deployment logs on Render.');
  }
}

// Run tests
runTests().catch(console.error); 