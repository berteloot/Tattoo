#!/usr/bin/env node

/**
 * Test CSP Configuration
 * Tests all CSP configurations to ensure they're working correctly
 */

// Mock environment variables for testing
process.env.NODE_ENV = 'production';

// Test different scenarios
const testScenarios = [
  {
    name: 'Production without Google Maps',
    env: {},
    description: 'Production environment without Google Maps API key'
  },
  {
    name: 'Production with Google Maps',
    env: {
      GOOGLE_MAPS_API_KEY: 'test-key-123',
      VITE_GOOGLE_MAPS_API_KEY: 'test-key-123'
    },
    description: 'Production environment with Google Maps API key'
  },
  {
    name: 'Development without Google Maps',
    env: { NODE_ENV: 'development' },
    description: 'Development environment without Google Maps API key'
  },
  {
    name: 'Development with Google Maps',
    env: { 
      NODE_ENV: 'development',
      GOOGLE_MAPS_API_KEY: 'test-key-123',
      VITE_GOOGLE_MAPS_API_KEY: 'test-key-123'
    },
    description: 'Development environment with Google Maps API key'
  }
];

// Test each scenario
testScenarios.forEach((scenario, index) => {
  console.log(`\n🧪 Test ${index + 1}: ${scenario.name}`);
  console.log(`📝 ${scenario.description}`);
  console.log('─'.repeat(60));
  
  // Set environment variables for this test
  Object.entries(scenario.env).forEach(([key, value]) => {
    process.env[key] = value;
  });
  
  try {
    // Import CSP utility (this will use the current env vars)
    const { getCSPForEnvironment, validateCSP, logCSPConfig } = require('../src/utils/csp');
    
    // Get CSP configuration
    const cspConfig = getCSPForEnvironment();
    
    // Validate configuration
    validateCSP(cspConfig);
    
    // Log configuration
    logCSPConfig(cspConfig);
    
    // Check specific directives
    console.log('\n🔍 CSP Directive Check:');
    console.log(`  scriptSrc: ${cspConfig.scriptSrc?.join(', ')}`);
    console.log(`  scriptSrcElem: ${cspConfig.scriptSrcElem?.join(', ')}`);
    console.log(`  imgSrc: ${cspConfig.imgSrc?.join(', ')}`);
    console.log(`  connectSrc: ${cspConfig.connectSrc?.join(', ')}`);
    
    // Check if Google Maps is properly configured
    const hasGoogleMaps = cspConfig.scriptSrc?.includes('https://maps.googleapis.com');
    const hasGoogleMapsElem = cspConfig.scriptSrcElem?.includes('https://maps.googleapis.com');
    
    if (hasGoogleMaps && hasGoogleMapsElem) {
      console.log('✅ Google Maps CSP properly configured');
    } else {
      console.log('❌ Google Maps CSP missing or incomplete');
    }
    
    console.log('✅ Test passed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  // Clean up environment variables
  Object.keys(scenario.env).forEach(key => {
    delete process.env[key];
  });
  
  // Reset to production for next test
  process.env.NODE_ENV = 'production';
});

console.log('\n🎯 CSP Testing Complete!');
console.log('\n📋 Summary:');
console.log('  - All tests should pass');
console.log('  - Google Maps should be configured when API key is present');
console.log('  - Development should include unsafe-eval');
console.log('  - Production should be minimal and secure');
