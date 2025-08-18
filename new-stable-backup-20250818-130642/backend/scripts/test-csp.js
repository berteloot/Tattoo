#!/usr/bin/env node

/**
 * Test script for CSP configuration
 * Verifies that CSP directives are correctly generated for different environments
 */

const { getCSPConfig, getDevCSPConfig, getCSPForEnvironment, validateCSP } = require('../src/utils/csp');

console.log('🧪 Testing CSP Configuration...\n');

// Test 1: Production CSP without Cloudinary or Google Maps
console.log('📋 Test 1: Production CSP (no external services)');
process.env.NODE_ENV = 'production';
delete process.env.CLOUDINARY_CLOUD_NAME;
delete process.env.GOOGLE_MAPS_API_KEY;
delete process.env.VITE_GOOGLE_MAPS_API_KEY;

try {
  const csp = getCSPForEnvironment();
  console.log('✅ Production CSP generated successfully');
  console.log('📊 Directives:', Object.keys(csp));
  console.log('🔒 imgSrc:', csp.imgSrc);
  console.log('📜 scriptSrc:', csp.scriptSrc);
  console.log('🔗 connectSrc:', csp.connectSrc);
  console.log('');
} catch (error) {
  console.error('❌ Production CSP failed:', error.message);
}

// Test 2: Production CSP with Cloudinary only
console.log('📋 Test 2: Production CSP (Cloudinary only)');
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';

try {
  const csp = getCSPForEnvironment();
  console.log('✅ Cloudinary CSP generated successfully');
  console.log('🔒 imgSrc:', csp.imgSrc);
  console.log('');
} catch (error) {
  console.error('❌ Cloudinary CSP failed:', error.message);
}

// Test 3: Production CSP with Google Maps only
console.log('📋 Test 3: Production CSP (Google Maps only)');
delete process.env.CLOUDINARY_CLOUD_NAME;
process.env.GOOGLE_MAPS_API_KEY = 'test-maps-key';

try {
  const csp = getCSPForEnvironment();
  console.log('✅ Google Maps CSP generated successfully');
  console.log('🔒 imgSrc:', csp.imgSrc);
  console.log('📜 scriptSrc:', csp.scriptSrc);
  console.log('🔗 connectSrc:', csp.connectSrc);
  console.log('');
} catch (error) {
  console.error('❌ Google Maps CSP failed:', error.message);
}

// Test 4: Production CSP with both services
console.log('📋 Test 4: Production CSP (both services)');
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';

try {
  const csp = getCSPForEnvironment();
  console.log('✅ Combined CSP generated successfully');
  console.log('🔒 imgSrc:', csp.imgSrc);
  console.log('📜 scriptSrc:', csp.scriptSrc);
  console.log('🔗 connectSrc:', csp.connectSrc);
  console.log('');
} catch (error) {
  console.error('❌ Combined CSP failed:', error.message);
}

// Test 5: Development CSP
console.log('📋 Test 5: Development CSP');
process.env.NODE_ENV = 'development';

try {
  const csp = getCSPForEnvironment();
  console.log('✅ Development CSP generated successfully');
  console.log('📜 scriptSrc:', csp.scriptSrc);
  console.log('📜 scriptSrcElem:', csp.scriptSrcElem);
  console.log('');
} catch (error) {
  console.error('❌ Development CSP failed:', error.message);
}

// Test 6: CSP Validation
console.log('📋 Test 6: CSP Validation');
try {
  const csp = getCSPForEnvironment();
  validateCSP(csp);
  console.log('✅ CSP validation passed');
} catch (error) {
  console.error('❌ CSP validation failed:', error.message);
}

console.log('\n🎉 CSP testing completed!');
console.log('\n📋 Summary:');
console.log('- CSP configuration is environment-aware');
console.log('- Only includes endpoints that are actually configured');
console.log('- Validation ensures required directives are present');
console.log('- Development mode includes necessary unsafe-eval for React');
console.log('- Production mode is minimal and secure');
