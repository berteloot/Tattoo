const axios = require('axios');

// Test the profile picture functionality locally
async function testProfilePictureLocal() {
  console.log('🧪 Testing Profile Picture Upload Locally...');
  
  const baseURL = 'http://localhost:3001/api';
  
  try {
    // First, create a test artist account
    console.log('📝 Creating test artist account...');
    
    const registerResponse = await axios.post(`${baseURL}/auth/register`, {
      email: 'test-artist-2@example.com',
      password: 'test123',
      firstName: 'Test',
      lastName: 'Artist',
      role: 'ARTIST'
    });

    if (!registerResponse.data.success) {
      throw new Error('Failed to create test account: ' + registerResponse.data.error);
    }

    console.log('✅ Test account created successfully');

    // Login to get token
    console.log('🔐 Logging in...');
    
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'test-artist-2@example.com',
      password: 'test123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.error);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // Create artist profile
    console.log('🎨 Creating artist profile...');
    
    const profileResponse = await axios.post(`${baseURL}/artists`, {
      bio: 'Test artist profile for profile picture testing',
      studioName: 'Test Studio',
      city: 'Test City',
      state: 'Test State',
      specialtyIds: [],
      serviceIds: []
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!profileResponse.data.success) {
      throw new Error('Failed to create artist profile: ' + profileResponse.data.error);
    }

    console.log('✅ Artist profile created successfully');

    // Test profile picture upload
    console.log('📤 Testing profile picture upload...');
    
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xCF, 0x00,
      0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('image', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });

    const uploadResponse = await axios.post(`${baseURL}/artists/profile-picture/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    if (!uploadResponse.data.success) {
      throw new Error('Profile picture upload failed: ' + uploadResponse.data.error);
    }

    console.log('✅ Profile picture upload successful:', uploadResponse.data.data);

    // Test profile picture removal
    console.log('🗑️ Testing profile picture removal...');
    
    const deleteResponse = await axios.delete(`${baseURL}/artists/profile-picture`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!deleteResponse.data.success) {
      throw new Error('Profile picture removal failed: ' + deleteResponse.data.error);
    }

    console.log('✅ Profile picture removal successful');

    console.log('🎉 All profile picture tests passed locally!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testProfilePictureLocal(); 