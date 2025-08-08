const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://tattooed-world-backend.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

async function checkProductionUsers() {
  console.log('🔍 Checking production users...\n');
  
  try {
    // Test if the API is accessible
    console.log('📋 Testing API accessibility...');
    try {
      const healthResponse = await api.get('/');
      console.log('✅ API is accessible');
    } catch (error) {
      console.log('❌ API not accessible:', error.message);
      return;
    }
    
    // Try to access admin dashboard without auth to see if it exists
    console.log('\n📋 Testing admin endpoints...');
    try {
      const adminResponse = await api.get('/admin/dashboard');
      console.log('❌ Admin endpoint accessible without auth (security issue)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Admin endpoint properly protected');
      } else {
        console.log('❌ Admin endpoint error:', error.response?.status, error.message);
      }
    }
    
    // Try to access gallery endpoint without auth
    console.log('\n📋 Testing gallery endpoints...');
    try {
      const galleryResponse = await api.get('/gallery');
      console.log('✅ Gallery endpoint accessible (public)');
      console.log('Gallery response:', galleryResponse.data);
    } catch (error) {
      console.log('❌ Gallery endpoint error:', error.response?.status, error.message);
    }
    
    // Try to access artists endpoint without auth
    console.log('\n📋 Testing artists endpoints...');
    try {
      const artistsResponse = await api.get('/artists');
      console.log('✅ Artists endpoint accessible (public)');
      console.log('Artists count:', artistsResponse.data.data?.artists?.length || 0);
    } catch (error) {
      console.log('❌ Artists endpoint error:', error.response?.status, error.message);
    }
    
    // Test registration endpoint
    console.log('\n📋 Testing registration...');
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const registerResponse = await api.post('/auth/register', {
        name: 'Test User',
        email: testEmail,
        password: 'test123456',
        role: 'ARTIST'
      });
      console.log('✅ Registration successful');
      console.log('Test user created:', testEmail);
      
      // Try to login with the new user
      console.log('\n📋 Testing login with new user...');
      const loginResponse = await api.post('/auth/login', {
        email: testEmail,
        password: 'test123456'
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Login successful with new user');
        const token = loginResponse.data.data.token;
        
        // Test gallery upload with the new user
        console.log('\n📋 Testing gallery upload with new user...');
        await testGalleryUpload(token, loginResponse.data.data.user);
      }
      
    } catch (error) {
      console.log('❌ Registration failed:', error.response?.data?.error || error.message);
    }
    
  } catch (error) {
    console.error('💥 Error checking production users:', error);
  }
}

async function testGalleryUpload(token, user) {
  console.log('🔍 Testing gallery upload with authenticated user...');
  
  try {
    // Create FormData for gallery upload
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('title', 'Debug Test Gallery Item');
    formData.append('description', 'Created via debugging script');
    formData.append('tattooStyle', 'Traditional American');
    formData.append('bodyLocation', 'Arm');
    formData.append('tattooSize', 'Medium');
    formData.append('colorType', 'Color');
    formData.append('sessionCount', '1');
    formData.append('hoursSpent', '2');
    formData.append('clientConsent', 'true');
    formData.append('clientAnonymous', 'true');
    formData.append('clientAgeVerified', 'true');
    formData.append('isBeforeAfter', 'false');
    formData.append('tags', 'debug,test');
    formData.append('categories', 'traditional,arm');
    
    // Create a simple test image
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    formData.append('image', testImageBuffer, {
      filename: 'debug-test.png',
      contentType: 'image/png'
    });
    
    console.log('🚀 Attempting gallery upload...');
    
    const uploadResponse = await axios.post(`${API_BASE_URL}/gallery`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✅ Gallery upload successful!');
    console.log('Response:', uploadResponse.data);
    
  } catch (error) {
    console.error('❌ Gallery upload failed');
    console.error('Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

// Run the check
checkProductionUsers().then(() => {
  console.log('\n🏁 Production user check completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Production user check failed:', error);
  process.exit(1);
});
