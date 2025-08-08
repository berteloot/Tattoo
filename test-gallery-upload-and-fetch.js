const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://tattooed-world-backend.onrender.com/api';

// Test credentials (you'll need to provide working credentials)
const TEST_CREDENTIALS = {
  email: 'your-test-email@example.com', // Replace with actual test email
  password: 'your-test-password'        // Replace with actual test password
};

async function testGalleryUploadAndFetch() {
  console.log('🔍 Testing Gallery Upload and Fetch...\n');
  
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
    console.log('Artist Profile ID:', user.artistProfile?.id);
    
    // Step 2: Check if user has artist profile
    if (!user.artistProfile) {
      console.log('❌ User does not have artist profile');
      console.log('Please use a user with an artist profile for testing');
      return;
    }
    
    const artistId = user.artistProfile.id;
    console.log('✅ User has artist profile:', artistId);
    
    // Step 3: Fetch gallery items before upload
    console.log('\n📋 Step 3: Fetching gallery items before upload...');
    try {
      const beforeResponse = await axios.get(`${API_BASE_URL}/gallery`, {
        params: { artistId },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Gallery fetch before upload successful');
      console.log('Items before upload:', beforeResponse.data.data.items.length);
      console.log('Items:', beforeResponse.data.data.items);
    } catch (error) {
      console.log('❌ Gallery fetch before upload failed:', error.response?.data || error.message);
    }
    
    // Step 4: Upload gallery item
    console.log('\n📋 Step 4: Uploading gallery item...');
    
    const FormData = require('form-data');
    const formData = new FormData();
    
    formData.append('title', 'Test Upload and Fetch Item');
    formData.append('description', 'Testing upload and immediate fetch');
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
    formData.append('tags', 'test,upload,fetch');
    formData.append('categories', 'traditional,arm');
    
    // Create a simple test image
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    formData.append('image', testImageBuffer, {
      filename: 'test-upload-fetch.png',
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
    console.log('Upload response:', uploadResponse.data);
    
    const uploadedItem = uploadResponse.data.data;
    console.log('Uploaded item ID:', uploadedItem.id);
    console.log('Uploaded item artist ID:', uploadedItem.artistId);
    
    // Step 5: Fetch gallery items after upload
    console.log('\n📋 Step 5: Fetching gallery items after upload...');
    try {
      const afterResponse = await axios.get(`${API_BASE_URL}/gallery`, {
        params: { artistId },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Gallery fetch after upload successful');
      console.log('Items after upload:', afterResponse.data.data.items.length);
      console.log('Items:', afterResponse.data.data.items);
      
      // Check if the uploaded item is in the list
      const foundItem = afterResponse.data.data.items.find(item => item.id === uploadedItem.id);
      if (foundItem) {
        console.log('✅ Uploaded item found in gallery fetch!');
        console.log('Found item:', foundItem);
      } else {
        console.log('❌ Uploaded item NOT found in gallery fetch!');
        console.log('This suggests an artist ID mismatch or database issue');
      }
    } catch (error) {
      console.log('❌ Gallery fetch after upload failed:', error.response?.data || error.message);
    }
    
    // Step 6: Try fetching without artistId filter
    console.log('\n📋 Step 6: Fetching all gallery items (no artistId filter)...');
    try {
      const allResponse = await axios.get(`${API_BASE_URL}/gallery`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ All gallery fetch successful');
      console.log('All items count:', allResponse.data.data.items.length);
      console.log('All items:', allResponse.data.data.items);
      
      // Check if the uploaded item is in the all items list
      const foundInAll = allResponse.data.data.items.find(item => item.id === uploadedItem.id);
      if (foundInAll) {
        console.log('✅ Uploaded item found in all items!');
        console.log('This suggests the item was saved but artistId filter is not working');
      } else {
        console.log('❌ Uploaded item NOT found in all items!');
        console.log('This suggests a database save issue');
      }
    } catch (error) {
      console.log('❌ All gallery fetch failed:', error.response?.data || error.message);
    }
    
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
console.log('📋 Gallery Upload and Fetch Test Instructions:');
console.log('1. Update TEST_CREDENTIALS with valid user credentials');
console.log('2. Ensure the user has an artist profile');
console.log('3. Run: node test-gallery-upload-and-fetch.js');
console.log('');

// Run the test
testGalleryUploadAndFetch().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
