#!/usr/bin/env node

console.log('🚀 STARTING BACKGROUND GEOCODING PROCESSOR');
console.log('==========================================');
console.log('');
console.log('📋 This will:');
console.log('   - Process all studios in small batches');
console.log('   - Geocode addresses with postal codes');
console.log('   - Update studio coordinates in database');
console.log('   - Handle errors gracefully');
console.log('   - Provide detailed progress updates');
console.log('');
console.log('⏳ Starting in 3 seconds...');
console.log('Press Ctrl+C to cancel');
console.log('');

setTimeout(() => {
  require('./background-geocoding-processor.js');
}, 3000); 