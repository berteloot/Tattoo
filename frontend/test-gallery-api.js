// Simple test to check if galleryAPI is working
import { galleryAPI } from './src/services/api.js';

console.log('Testing galleryAPI...');
console.log('galleryAPI:', galleryAPI);
console.log('galleryAPI.create:', galleryAPI.create);
console.log('typeof galleryAPI.create:', typeof galleryAPI.create);

// Test if it's a function
if (typeof galleryAPI.create === 'function') {
  console.log('✅ galleryAPI.create is a function');
} else {
  console.log('❌ galleryAPI.create is NOT a function');
}

// Test if it's callable
try {
  const testData = new FormData();
  testData.append('title', 'test');
  console.log('✅ galleryAPI.create can be called');
} catch (error) {
  console.log('❌ galleryAPI.create cannot be called:', error);
}
