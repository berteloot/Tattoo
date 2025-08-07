const axios = require('axios');

// Test the favorites API
async function testFavoritesAPI() {
  console.log('🧪 Testing Favorites API...');
  
  const API_URL = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    // Test 1: Try to access favorites without authentication
    console.log('\n1. Testing favorites without auth...');
    try {
      const response = await axios.get(`${API_URL}/favorites`);
      console.log('❌ Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }
    
    // Test 2: Test with a valid client token
    console.log('\n2. Testing favorites with client auth...');
    
    // First, try to login as a client
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'client@example.com',
      password: 'client123'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      console.log('✅ Client login successful');
      
      // Test favorites with valid token
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
        }
      } else {
        console.log('❌ Favorites API returned error:', favoritesResponse.data.error);
      }
    } else {
      console.log('❌ Client login failed:', loginResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testFavoritesAPI(); 