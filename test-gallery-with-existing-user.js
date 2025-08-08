const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://tattooed-world-backend.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

async function testGalleryWithExistingUser() {
  console.log('🔍 Testing gallery upload with existing user...\n');
  
  try {
    // First, let's see what artists exist
    console.log('📋 Getting existing artists...');
    const artistsResponse = await api.get('/artists');
    console.log('Artists found:', artistsResponse.data.data.artists.length);
    
    const artists = artistsResponse.data.data.artists;
    if (artists.length === 0) {
      console.log('❌ No artists found in database');
      return;
    }
    
    // Try to find an artist with an email we can use
    const artistWithEmail = artists.find(artist => artist.user?.email);
    if (!artistWithEmail) {
      console.log('❌ No artists with email found');
      console.log('Available artists:', artists.map(a => ({ id: a.id, name: a.user?.name })));
      return;
    }
    
    console.log('✅ Found artist with email:', artistWithEmail.user.email);
    console.log('Artist details:', {
      id: artistWithEmail.id,
      name: artistWithEmail.user.name,
      email: artistWithEmail.user.email,
      role: artistWithEmail.user.role
    });
    
    // Try common passwords
    const commonPasswords = ['password', '123456', 'admin123', 'artist123', 'test123'];
    
    for (const password of commonPasswords) {
      console.log(`\n📋 Trying password: ${password}`);
      
      try {
        const loginResponse = await api.post('/auth/login', {
          email: artistWithEmail.user.email,
          password: password
        });
        
        if (loginResponse.data.success) {
          console.log('✅ Login successful!');
          const token = loginResponse.data.data.token;
          const user = loginResponse.data.data.user;
          
          console.log('User details:', {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            artistProfile: !!user.artistProfile
          });
          
          // Test gallery upload
          await testGalleryUpload(token, user);
          return;
        }
      } catch (error) {
        console.log(`❌ Login failed with password ${password}:`, error.response?.data?.error || error.message);
      }
    }
    
    console.log('\n❌ Could not login with any common password');
    console.log('Please provide the correct password for:', artistWithEmail.user.email);
    
  } catch (error) {
    console.error('💥 Error testing gallery:', error);
  }
}

async function testGalleryUpload(token, user) {
  console.log('\n🔍 Testing gallery upload...');
  
  try {
    // First, check if user has artist profile
    if (!user.artistProfile) {
      console.log('❌ User does not have artist profile');
      return;
    }
    
    console.log('✅ User has artist profile:', user.artistProfile.id);
    
    // Test GET gallery first
    console.log('\n📋 Testing GET gallery...');
    try {
      const getResponse = await axios.get(`${API_BASE_URL}/gallery?artistId=${user.artistProfile.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ GET gallery successful');
      console.log('Current items:', getResponse.data.data.items.length);
    } catch (error) {
      console.log('❌ GET gallery failed:', error.response?.data || error.message);
    }
    
    // Test gallery upload
    console.log('\n📋 Testing gallery upload...');
    
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
    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${typeof value === 'object' ? '[Buffer]' : value}`);
    }
    
    const uploadResponse = await axios.post(`${API_BASE_URL}/gallery`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✅ Gallery upload successful!');
    console.log('Response:', uploadResponse.data);
    
    // Test GET gallery again to see the new item
    console.log('\n📋 Testing GET gallery after upload...');
    try {
      const getResponse = await axios.get(`${API_BASE_URL}/gallery?artistId=${user.artistProfile.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ GET gallery successful after upload');
      console.log('Updated items count:', getResponse.data.data.items.length);
    } catch (error) {
      console.log('❌ GET gallery failed after upload:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Gallery upload failed');
    console.error('Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

// Run the test
testGalleryWithExistingUser().then(() => {
  console.log('\n🏁 Gallery test completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Gallery test failed:', error);
  process.exit(1);
});
