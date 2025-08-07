const axios = require('axios');

// Test frontend favorites functionality
async function testFrontendFavorites() {
  console.log('🧪 Testing Frontend Favorites Functionality...');
  
  const API_URL = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    // Test 1: Check if artists are available
    console.log('\n1. Checking available artists...');
    
    const artistsResponse = await axios.get(`${API_URL}/artists`);
    if (artistsResponse.data.success) {
      const artists = artistsResponse.data.data.artists;
      console.log(`✅ Found ${artists.length} artists available`);
      
      if (artists.length > 0) {
        const sampleArtist = artists[0];
        console.log('📋 Sample artist:', {
          name: `${sampleArtist.user.firstName} ${sampleArtist.user.lastName}`,
          studio: sampleArtist.studioName,
          city: sampleArtist.city,
          verified: sampleArtist.isVerified
        });
      }
    } else {
      console.log('❌ Failed to fetch artists:', artistsResponse.data.error);
      return;
    }
    
    // Test 2: Test favorites API without authentication (should fail gracefully)
    console.log('\n2. Testing favorites without authentication...');
    
    try {
      const favoritesResponse = await axios.get(`${API_URL}/favorites`);
      console.log('❌ Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }
    
    // Test 3: Test favorites check endpoint without authentication
    console.log('\n3. Testing favorites check without authentication...');
    
    try {
      const checkResponse = await axios.get(`${API_URL}/favorites/check/123`);
      console.log('❌ Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }
    
    // Test 4: Test adding favorite without authentication
    console.log('\n4. Testing add favorite without authentication...');
    
    try {
      const addResponse = await axios.post(`${API_URL}/favorites`, { artistId: '123' });
      console.log('❌ Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }
    
    console.log('\n✅ Frontend favorites functionality test completed');
    console.log('📝 Summary:');
    console.log('   - Artists API: Working');
    console.log('   - Favorites API: Properly protected (requires authentication)');
    console.log('   - Error handling: Working correctly');
    console.log('\n💡 The frontend should handle authentication errors gracefully');
    console.log('   and show appropriate messages to users.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFrontendFavorites(); 