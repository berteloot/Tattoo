#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing asset serving...');

// Test configuration
const PORT = process.env.PORT || 3001;
const TEST_URL = `http://localhost:${PORT}`;

// Test cases
const testCases = [
  {
    name: 'Test CSS serving',
    path: '/test-css',
    expectedContentType: 'text/css',
    description: 'Should serve CSS with correct MIME type'
  },
  {
    name: 'Debug assets endpoint',
    path: '/debug-assets',
    expectedContentType: 'application/json',
    description: 'Should return asset information'
  },
  {
    name: 'Debug build endpoint',
    path: '/debug-build',
    expectedContentType: 'application/json',
    description: 'Should return build information'
  }
];

async function testEndpoint(testCase) {
  return new Promise((resolve) => {
    const req = http.get(`${TEST_URL}${testCase.path}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        const isSuccess = res.statusCode === 200;
        const hasCorrectContentType = contentType.includes(testCase.expectedContentType);
        
        const result = {
          name: testCase.name,
          path: testCase.path,
          statusCode: res.statusCode,
          contentType,
          expectedContentType: testCase.expectedContentType,
          isSuccess,
          hasCorrectContentType,
          description: testCase.description,
          dataLength: data.length
        };
        
        if (isSuccess && hasCorrectContentType) {
          console.log(`✅ ${testCase.name}: PASSED`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Content-Type: ${contentType}`);
          console.log(`   Data length: ${data.length} bytes`);
        } else {
          console.log(`❌ ${testCase.name}: FAILED`);
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Content-Type: ${contentType}`);
          console.log(`   Expected: ${testCase.expectedContentType}`);
          console.log(`   Data length: ${data.length} bytes`);
        }
        
        resolve(result);
      });
    });
    
    req.on('error', (error) => {
      const result = {
        name: testCase.name,
        path: testCase.path,
        error: error.message,
        isSuccess: false
      };
      
      console.log(`❌ ${testCase.name}: ERROR - ${error.message}`);
      resolve(result);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      const result = {
        name: testCase.name,
        path: testCase.path,
        error: 'Request timeout',
        isSuccess: false
      };
      
      console.log(`❌ ${testCase.name}: TIMEOUT`);
      resolve(result);
    });
  });
}

async function runTests() {
  console.log(`🚀 Starting tests against ${TEST_URL}`);
  console.log('⏳ Waiting for server to be ready...');
  
  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n🔍 Running: ${testCase.name}`);
    const result = await testEndpoint(testCase);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  const passed = results.filter(r => r.isSuccess && r.hasCorrectContentType).length;
  const failed = results.length - passed;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed tests:');
    results.filter(r => !r.isSuccess || !r.hasCorrectContentType).forEach(result => {
      console.log(`   - ${result.name}: ${result.error || 'Incorrect content type'}`);
    });
  }
  
  if (passed === results.length) {
    console.log('\n🎉 All tests passed! Asset serving is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the server configuration.');
  }
}

// Run tests
runTests().catch(console.error);
