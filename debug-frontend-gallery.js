// Frontend Gallery Debugging Script
// Run this in the browser console on the artist dashboard page

console.log('🔍 Starting frontend gallery debugging...');

// Test the galleryAPI object
console.log('📋 Testing galleryAPI object...');
console.log('galleryAPI:', window.galleryAPI || 'Not found in window');
console.log('galleryAPI from import:', typeof galleryAPI);

// Test the API service
console.log('\n📋 Testing API service...');
console.log('api object:', typeof api);
console.log('galleryAPI object:', typeof galleryAPI);

// Test galleryAPI methods
if (typeof galleryAPI !== 'undefined') {
  console.log('galleryAPI.getAll:', typeof galleryAPI.getAll);
  console.log('galleryAPI.create:', typeof galleryAPI.create);
  console.log('galleryAPI.update:', typeof galleryAPI.update);
  console.log('galleryAPI.delete:', typeof galleryAPI.delete);
}

// Test authentication
console.log('\n📋 Testing authentication...');
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token length:', token ? token.length : 0);

// Test user state
console.log('\n📋 Testing user state...');
console.log('User from AuthContext:', window.user || 'Not found');
console.log('Artist profile:', window.user?.artistProfile || 'Not found');

// Test FormData creation
console.log('\n📋 Testing FormData creation...');
try {
  const testFormData = new FormData();
  testFormData.append('title', 'Test Item');
  testFormData.append('description', 'Test Description');
  
  // Create a simple test image
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 100, 100);
  
  canvas.toBlob((blob) => {
    testFormData.append('image', blob, 'test.png');
    console.log('✅ FormData created successfully');
    console.log('FormData entries:');
    for (let [key, value] of testFormData.entries()) {
      console.log(`  ${key}: ${typeof value === 'object' ? '[Blob]' : value}`);
    }
    
    // Test the actual API call
    testGalleryUpload(testFormData);
  }, 'image/png');
  
} catch (error) {
  console.error('❌ FormData creation failed:', error);
}

async function testGalleryUpload(formData) {
  console.log('\n📋 Testing gallery upload...');
  
  try {
    // Test with minimal data first
    const minimalData = new FormData();
    minimalData.append('title', 'Debug Test Item');
    minimalData.append('description', 'Debug test description');
    minimalData.append('tattooStyle', 'Traditional American');
    minimalData.append('bodyLocation', 'Arm');
    minimalData.append('tattooSize', 'Medium');
    minimalData.append('colorType', 'Color');
    minimalData.append('sessionCount', '1');
    minimalData.append('hoursSpent', '2');
    minimalData.append('clientConsent', 'true');
    minimalData.append('clientAnonymous', 'true');
    minimalData.append('clientAgeVerified', 'true');
    minimalData.append('isBeforeAfter', 'false');
    minimalData.append('tags', 'debug,test');
    minimalData.append('categories', 'traditional,arm');
    
    // Add the test image
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, 100, 100);
    
    canvas.toBlob(async (blob) => {
      minimalData.append('image', blob, 'debug-test.png');
      
      console.log('🚀 Attempting gallery upload...');
      console.log('FormData contents:');
      for (let [key, value] of minimalData.entries()) {
        console.log(`  ${key}: ${typeof value === 'object' ? '[Blob]' : value}`);
      }
      
      try {
        const response = await galleryAPI.create(minimalData);
        console.log('✅ Gallery upload successful!');
        console.log('Response:', response);
        console.log('Response data:', response.data);
      } catch (error) {
        console.error('❌ Gallery upload failed');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        
        // Test the raw fetch approach
        await testRawFetch(minimalData);
      }
    }, 'image/png');
    
  } catch (error) {
    console.error('❌ Test setup failed:', error);
  }
}

async function testRawFetch(formData) {
  console.log('\n📋 Testing raw fetch approach...');
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/gallery', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    console.log('Raw fetch response status:', response.status);
    console.log('Raw fetch response headers:', response.headers);
    
    const responseText = await response.text();
    console.log('Raw fetch response text:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('Raw fetch response JSON:', responseJson);
    } catch (e) {
      console.log('Response is not JSON');
    }
    
  } catch (error) {
    console.error('❌ Raw fetch failed:', error);
  }
}

// Test the actual component state
console.log('\n📋 Testing component state...');
console.log('Current component state:', {
  galleryItems: window.galleryItems || 'Not found',
  loading: window.loading || 'Not found',
  showUploadForm: window.showUploadForm || 'Not found',
  uploading: window.uploading || 'Not found',
  formData: window.formData || 'Not found'
});

console.log('\n🏁 Frontend debugging script loaded. Check console for results.');
