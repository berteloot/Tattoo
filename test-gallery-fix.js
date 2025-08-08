const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://tattooed-world-backend.onrender.com/api';

// Test credentials (you'll need to provide working credentials)
const TEST_CREDENTIALS = {
  email: 'your-test-email@example.com', // Replace with actual test email
  password: 'your-test-password'        // Replace with actual test password
};

async function testGalleryFix() {
  console.log('🔍 Testing Gallery Upload Fix...\n');
  
  try {
    // Step 1: Test authentication
    console.log('📋 Step 1: Testing authentication...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (!loginResponse.data.success) {
      console.log('❌ Authentication failed. Please provide valid test credentials.');
      console.log('Update TEST_CREDENTIALS in this script with working credentials.');
      return;
    }
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('✅ Authentication successful');
    console.log('User:', user.name, user.email, user.role);
    
    // Step 2: Check if user has artist profile
    if (!user.artistProfile) {
      console.log('❌ User does not have artist profile');
      console.log('Please use a user with an artist profile for testing');
      return;
    }
    
    console.log('✅ User has artist profile:', user.artistProfile.id);
    
    // Step 3: Test gallery upload
    console.log('\n📋 Step 3: Testing gallery upload...');
    
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add all required fields
    formData.append('title', 'Test Gallery Item - Fixed');
    formData.append('description', 'This is a test gallery item to verify the fix');
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
    formData.append('tags', 'test,fix,debug');
    formData.append('categories', 'traditional,arm');
    
    // Create a simple test image
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    formData.append('image', testImageBuffer, {
      filename: 'test-fix.png',
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
    console.log('Response status:', uploadResponse.status);
    console.log('Response data:', uploadResponse.data);
    
    // Step 4: Verify the upload by fetching gallery items
    console.log('\n📋 Step 4: Verifying upload...');
    
    const getResponse = await axios.get(`${API_BASE_URL}/gallery?artistId=${user.artistProfile.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Gallery fetch successful');
    console.log('Total items:', getResponse.data.data.items.length);
    
    const uploadedItem = getResponse.data.data.items.find(item => 
      item.title === 'Test Gallery Item - Fixed'
    );
    
    if (uploadedItem) {
      console.log('✅ Uploaded item found in gallery');
      console.log('Item details:', {
        id: uploadedItem.id,
        title: uploadedItem.title,
        description: uploadedItem.description,
        imageUrl: uploadedItem.imageUrl ? 'Present' : 'Missing'
      });
    } else {
      console.log('❌ Uploaded item not found in gallery');
    }
    
    // Step 5: Test error handling
    console.log('\n📋 Step 5: Testing error handling...');
    
    // Test with missing required fields
    const invalidFormData = new FormData();
    invalidFormData.append('title', 'Invalid Test');
    // Missing required fields
    
    try {
      await axios.post(`${API_BASE_URL}/gallery`, invalidFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          ...invalidFormData.getHeaders()
        }
      });
      console.log('❌ Invalid upload succeeded (should fail)');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Invalid upload properly rejected (400)');
        console.log('Error message:', error.response.data.error);
      } else {
        console.log('❌ Unexpected error for invalid upload:', error.response?.status);
      }
    }
    
    console.log('\n🎉 Gallery upload fix test completed successfully!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    
    if (error.response?.status === 401) {
      console.log('\n💡 To run this test:');
      console.log('1. Update TEST_CREDENTIALS with valid credentials');
      console.log('2. Ensure the user has an artist profile');
      console.log('3. Run the test again');
    }
  }
}

// Instructions for running the test
console.log('📋 Gallery Upload Fix Test Instructions:');
console.log('1. Update TEST_CREDENTIALS with valid user credentials');
console.log('2. Ensure the user has an artist profile');
console.log('3. Run: node test-gallery-fix.js');
console.log('');

// Run the test
testGalleryFix().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
