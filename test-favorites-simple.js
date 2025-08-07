const axios = require('axios');

// Simple test with a test account that bypasses email verification
async function testFavoritesSimple() {
  console.log('🧪 Testing Favorites with Test Account...');
  
  const API_URL = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    // Test with a test account that bypasses email verification
    console.log('\n1. Testing with test account...');
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'client@example.com',
      password: 'client123'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      console.log(`✅ Login successful: ${user.firstName} ${user.lastName} (${user.role})`);
      
      // Test favorites API
      console.log('\n2. Testing favorites API...');
      
      const favoritesResponse = await axios.get(`${API_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (favoritesResponse.data.success) {
        const favorites = favoritesResponse.data.data.favorites;
        console.log(`✅ Favorites API working: ${favorites.length} favorites found`);
        
        if (favorites.length > 0) {
          console.log('📋 Sample favorite:', {
            artistName: `${favorites[0].artist.user.firstName} ${favorites[0].artist.user.lastName}`,
            studioName: favorites[0].artist.studioName,
            city: favorites[0].artist.city
          });
        } else {
          console.log('ℹ️ No favorites yet - this is normal');
        }
        
        // Test adding a favorite
        console.log('\n3. Testing add favorite...');
        
        // First, get some artists to favorite
        const artistsResponse = await axios.get(`${API_URL}/artists`);
        if (artistsResponse.data.success && artistsResponse.data.data.artists.length > 0) {
          const artistId = artistsResponse.data.data.artists[0].id;
          console.log(`📝 Found artist to favorite: ${artistsResponse.data.data.artists[0].user.firstName} ${artistsResponse.data.data.artists[0].user.lastName}`);
          
          // Add to favorites
          const addFavoriteResponse = await axios.post(`${API_URL}/favorites`, {
            artistId: artistId
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (addFavoriteResponse.data.success) {
            console.log('✅ Successfully added artist to favorites');
            
            // Check favorites again
            const updatedFavoritesResponse = await axios.get(`${API_URL}/favorites`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (updatedFavoritesResponse.data.success) {
              const updatedFavorites = updatedFavoritesResponse.data.data.favorites;
              console.log(`✅ Updated favorites count: ${updatedFavorites.length}`);
            }
          } else {
            console.log('❌ Failed to add favorite:', addFavoriteResponse.data.error);
          }
        }
        
      } else {
        console.log('❌ Favorites API error:', favoritesResponse.data.error);
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFavoritesSimple(); 