#!/usr/bin/env node

/**
 * Deployment verification script
 * This script verifies that the backend is working properly after deployment
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'https://tattoo-app-backend.onrender.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tattoo-app-frontend.onrender.com';

async function verifyDeployment() {
  console.log('🔍 Verifying deployment...');
  console.log(`🔗 Backend URL: ${API_URL}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  
  const tests = [
    {
      name: 'Health Check',
      url: `${API_URL}/health`,
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Root Endpoint',
      url: `${API_URL}/`,
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Artists API',
      url: `${API_URL}/api/artists?limit=1`,
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Specialties API',
      url: `${API_URL}/api/specialties`,
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Services API',
      url: `${API_URL}/api/services`,
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Flash API',
      url: `${API_URL}/api/flash?limit=1`,
      method: 'GET',
      expectedStatus: 200
    }
  ];
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (const test of tests) {
    try {
      console.log(`\n📋 Testing: ${test.name}`);
      const response = await axios({
        method: test.method,
        url: test.url,
        timeout: 10000,
        headers: {
          'User-Agent': 'Deployment-Verifier/1.0'
        }
      });
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name}: PASSED (${response.status})`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name}: FAILED (expected ${test.expectedStatus}, got ${response.status})`);
        failedTests++;
      }
      
    } catch (error) {
      console.log(`❌ ${test.name}: FAILED`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data?.error || error.message}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      failedTests++;
    }
  }
  
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / tests.length) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Deployment is successful.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed. Please check the deployment.');
    process.exit(1);
  }
}

// Run verification
verifyDeployment(); 