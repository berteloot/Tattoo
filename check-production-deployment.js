const axios = require('axios');

// Check production deployment status and Prisma client
async function checkProductionDeployment() {
  console.log('🔍 Checking Production Deployment Status...');
  
  const baseURL = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    // Check if the server is running
    console.log('🏥 Testing server health...');
    
    const healthResponse = await axios.get(`${baseURL.replace('/api', '')}/health`);
    console.log('✅ Server is running:', healthResponse.data);

    // Test if profile picture fields are recognized by trying to get an artist profile
    console.log('🎨 Testing artist profile endpoint...');
    
    const artistsResponse = await axios.get(`${baseURL}/artists?limit=1`);
    
    if (artistsResponse.data.success) {
      console.log('✅ Artists endpoint working');
      
      if (artistsResponse.data.data.artists.length > 0) {
        const artist = artistsResponse.data.data.artists[0];
        console.log('🎨 Sample artist fields:', Object.keys(artist));
        
        // Check if profile picture fields exist in the response
        const hasProfilePictureFields = [
          'profilePictureUrl',
          'profilePicturePublicId',
          'profilePictureWidth',
          'profilePictureHeight',
          'profilePictureFormat',
          'profilePictureBytes'
        ].some(field => artist.hasOwnProperty(field));
        
        if (hasProfilePictureFields) {
          console.log('✅ Profile picture fields exist in API response');
          console.log('📊 Profile picture data:', {
            url: artist.profilePictureUrl,
            publicId: artist.profilePicturePublicId,
            width: artist.profilePictureWidth,
            height: artist.profilePictureHeight,
            format: artist.profilePictureFormat,
            bytes: artist.profilePictureBytes
          });
        } else {
          console.log('❌ Profile picture fields missing from API response');
          console.log('🔧 Production Prisma client needs to be regenerated');
        }
      }
    } else {
      console.log('❌ Artists endpoint failed:', artistsResponse.data.error);
    }

  } catch (error) {
    console.error('❌ Production check failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the check
checkProductionDeployment();
