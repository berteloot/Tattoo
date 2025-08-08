const axios = require('axios');

// Check actual table structure in production database
async function checkTableStructure() {
  console.log('🔍 Checking Actual Table Structure...');
  
  const baseURL = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    // Check if we can get table information via API
    console.log('📋 Testing artists endpoint to see table structure...');
    
    const artistsResponse = await axios.get(`${baseURL}/artists?limit=1`);
    
    if (artistsResponse.data.success) {
      console.log('✅ Artists endpoint working');
      
      if (artistsResponse.data.data.artists.length > 0) {
        const artist = artistsResponse.data.data.artists[0];
        console.log('🎨 Sample artist data structure:');
        console.log('📊 All fields:', Object.keys(artist));
        
        // Check for any profile picture related fields
        const profileFields = Object.keys(artist).filter(key => 
          key.toLowerCase().includes('profile') || 
          key.toLowerCase().includes('picture') ||
          key.toLowerCase().includes('image')
        );
        
        if (profileFields.length > 0) {
          console.log('📸 Profile picture related fields found:', profileFields);
        } else {
          console.log('❌ No profile picture fields found in API response');
        }
      }
    }

    // Let's also try to get the raw database structure
    console.log('🗄️ Trying to get database structure...');
    
    try {
      // This might not work, but let's try
      const structureResponse = await axios.get(`${baseURL}/emergency/db-structure`);
      console.log('📊 Database structure:', structureResponse.data);
    } catch (error) {
      console.log('❌ Could not get database structure via API');
    }

  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the check
checkTableStructure();
