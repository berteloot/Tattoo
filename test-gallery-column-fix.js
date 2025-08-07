const axios = require('axios');

async function testGalleryColumnFix() {
  console.log('🔧 Testing gallery column fix endpoint...');
  
  try {
    const response = await axios.post('https://tattooed-world-backend.onrender.com/api/emergency/fix-gallery-columns');
    
    console.log('✅ Success!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('🔍 Endpoint not found - deployment might still be in progress');
      console.log('Let\'s wait a bit and try again...');
      
      // Wait 60 seconds and try again
      setTimeout(async () => {
        try {
          console.log('🔄 Retrying...');
          const retryResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/emergency/fix-gallery-columns');
          console.log('✅ Retry successful!');
          console.log('Response:', retryResponse.data);
        } catch (retryError) {
          console.error('❌ Retry failed:', retryError.response?.data || retryError.message);
        }
      }, 60000);
    }
  }
}

testGalleryColumnFix(); 