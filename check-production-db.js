const axios = require('axios');

// Check production database schema
async function checkProductionDB() {
  console.log('🔍 Checking Production Database Schema...');
  
  const baseURL = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    // Test the health endpoint first
    console.log('🏥 Testing health endpoint...');
    
    const healthResponse = await axios.get(`${baseURL.replace('/api', '')}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Try to get a list of artists to see if the endpoint works
    console.log('👥 Testing artists endpoint...');
    
    const artistsResponse = await axios.get(`${baseURL}/artists?limit=1`);
    
    if (artistsResponse.data.success) {
      console.log('✅ Artists endpoint working');
      console.log('📊 Artists count:', artistsResponse.data.data.pagination.total);
      
      if (artistsResponse.data.data.artists.length > 0) {
        const artist = artistsResponse.data.data.artists[0];
        console.log('🎨 Sample artist fields:', Object.keys(artist));
        
        // Check if profile picture fields exist
        const hasProfilePictureFields = [
          'profilePictureUrl',
          'profilePicturePublicId',
          'profilePictureWidth',
          'profilePictureHeight',
          'profilePictureFormat',
          'profilePictureBytes'
        ].some(field => artist.hasOwnProperty(field));
        
        if (hasProfilePictureFields) {
          console.log('✅ Profile picture fields exist in production database');
        } else {
          console.log('❌ Profile picture fields missing from production database');
          console.log('🔧 Need to run SQL commands on production database');
        }
      }
    } else {
      console.log('❌ Artists endpoint failed:', artistsResponse.data.error);
    }

  } catch (error) {
    console.error('❌ Production DB check failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the check
checkProductionDB(); 