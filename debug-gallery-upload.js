const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const API_BASE_URL = 'https://tattooed-world-backend.onrender.com/api';

// Test different credentials
const TEST_CREDENTIALS = [
  { email: 'berteloot@gmail.com', password: 'admin123', role: 'ADMIN' },
  { email: 'client@example.com', password: 'client123', role: 'CLIENT' },
  { email: 'artist@example.com', password: 'artist123', role: 'ARTIST' },
  { email: 'pending@example.com', password: 'pending123', role: 'ARTIST_PENDING' }
];

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = global.authToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Handle FormData properly
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
  console.log('Headers:', config.headers);
  
  return config;
});

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.statusText}`);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return response;
  },
  (error) => {
    console.error(`❌ ${error.response?.status || 'NO_RESPONSE'} ${error.message}`);
    if (error.response?.data) {
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
    }
    return Promise.reject(error);
  }
);

async function testAuthentication() {
  console.log('🔍 Testing authentication with different credentials...\n');
  
  for (const creds of TEST_CREDENTIALS) {
    console.log(`📋 Testing ${creds.role} credentials: ${creds.email}`);
    
    try {
      const loginResponse = await api.post('/auth/login', {
        email: creds.email,
        password: creds.password
      });
      
      if (loginResponse.data.success) {
        global.authToken = loginResponse.data.data.token;
        console.log(`✅ ${creds.role} authentication successful`);
        console.log('User:', loginResponse.data.data.user);
        return creds;
      }
    } catch (error) {
      console.log(`❌ ${creds.role} authentication failed:`, error.response?.data?.error || error.message);
    }
  }
  
  throw new Error('All authentication attempts failed');
}

async function debugGalleryUpload() {
  console.log('🔍 Starting comprehensive gallery upload debugging...\n');
  
  try {
    // Step 1: Test authentication
    console.log('📋 Step 1: Testing authentication...');
    const workingCreds = await testAuthentication();
    
    // Step 2: Get user profile and artist profile
    console.log('\n📋 Step 2: Getting user profile...');
    const profileResponse = await api.get('/auth/me');
    console.log('Profile response:', profileResponse.data);
    
    const artistProfile = profileResponse.data.data.artistProfile;
    if (!artistProfile) {
      console.log('❌ No artist profile found. User role:', profileResponse.data.data.role);
      
      // If user is ADMIN, try to create an artist profile
      if (profileResponse.data.data.role === 'ADMIN') {
        console.log('📋 Creating artist profile for admin user...');
        try {
          const createProfileResponse = await api.post('/artists', {
            bio: 'Admin test artist profile',
            specialties: ['Traditional American'],
            services: ['Custom Design'],
            location: {
              latitude: 45.5017,
              longitude: -73.5673,
              address: 'Montreal, QC, Canada'
            }
          });
          console.log('✅ Artist profile created for admin');
        } catch (error) {
          console.log('❌ Failed to create artist profile:', error.response?.data?.error || error.message);
        }
      }
      return;
    }
    
    console.log('✅ Artist profile found:', artistProfile.id);
    
    // Step 3: Test gallery API endpoints
    console.log('\n📋 Step 3: Testing gallery API endpoints...');
    
    // Test GET /gallery
    console.log('\n--- Testing GET /gallery ---');
    try {
      const getAllResponse = await api.get('/gallery', {
        params: { artistId: artistProfile.id }
      });
      console.log('✅ GET /gallery successful');
      console.log('Current gallery items:', getAllResponse.data.data?.items?.length || 0);
    } catch (error) {
      console.log('❌ GET /gallery failed:', error.message);
    }
    
    // Step 4: Test gallery creation with minimal data
    console.log('\n📋 Step 4: Testing gallery creation with minimal data...');
    
    const minimalFormData = new FormData();
    minimalFormData.append('title', 'Test Gallery Item');
    minimalFormData.append('description', 'Test description');
    minimalFormData.append('tattooStyle', 'Traditional American');
    minimalFormData.append('bodyLocation', 'Arm');
    minimalFormData.append('tattooSize', 'Medium');
    minimalFormData.append('colorType', 'Color');
    minimalFormData.append('sessionCount', '1');
    minimalFormData.append('hoursSpent', '2');
    minimalFormData.append('clientConsent', 'true');
    minimalFormData.append('clientAnonymous', 'true');
    minimalFormData.append('clientAgeVerified', 'true');
    minimalFormData.append('isBeforeAfter', 'false');
    minimalFormData.append('tags', 'test,debug');
    minimalFormData.append('categories', 'traditional,arm');
    
    // Create a simple test image
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    minimalFormData.append('image', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    
    console.log('FormData fields:');
    for (let [key, value] of minimalFormData.entries()) {
      console.log(`  ${key}: ${typeof value === 'object' ? '[Buffer]' : value}`);
    }
    
    try {
      const createResponse = await api.post('/gallery', minimalFormData);
      console.log('✅ Gallery creation successful!');
      console.log('Created item:', createResponse.data);
    } catch (error) {
      console.log('❌ Gallery creation failed');
      console.log('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
    }
    
    // Step 5: Test with JSON data instead of FormData
    console.log('\n📋 Step 5: Testing gallery creation with JSON data...');
    
    const jsonData = {
      title: 'Test JSON Gallery Item',
      description: 'Test description via JSON',
      tattooStyle: 'Traditional American',
      bodyLocation: 'Arm',
      tattooSize: 'Medium',
      colorType: 'Color',
      sessionCount: 1,
      hoursSpent: 2,
      clientConsent: true,
      clientAnonymous: true,
      clientAgeVerified: true,
      isBeforeAfter: false,
      tags: 'test,json,debug',
      categories: 'traditional,arm'
    };
    
    try {
      const jsonResponse = await api.post('/gallery', jsonData);
      console.log('✅ JSON gallery creation successful!');
    } catch (error) {
      console.log('❌ JSON gallery creation failed:', error.message);
    }
    
    // Step 6: Test database connection
    console.log('\n📋 Step 6: Testing database schema...');
    try {
      const schemaResponse = await api.get('/admin/dashboard');
      console.log('✅ Database connection working');
    } catch (error) {
      console.log('❌ Database connection issue:', error.message);
    }
    
    // Step 7: Test file upload endpoint specifically
    console.log('\n📋 Step 7: Testing file upload endpoint...');
    
    const uploadFormData = new FormData();
    uploadFormData.append('image', testImageBuffer, {
      filename: 'test-upload.png',
      contentType: 'image/png'
    });
    
    try {
      const uploadResponse = await api.post('/flash/upload', uploadFormData);
      console.log('✅ File upload successful:', uploadResponse.data);
    } catch (error) {
      console.log('❌ File upload failed:', error.message);
    }
    
  } catch (error) {
    console.error('💥 Fatal error in debugging:', error);
  }
}

// Run the debugging
debugGalleryUpload().then(() => {
  console.log('\n🏁 Debugging completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Debugging failed:', error);
  process.exit(1);
});
