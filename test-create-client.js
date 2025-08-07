const axios = require('axios');

// Test client account creation and favorites
async function testClientAccount() {
  console.log('🧪 Testing Client Account and Favorites...');
  
  const API_URL = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    // Test 1: Try to register a new client
    console.log('\n1. Testing client registration...');
    
    const registerData = {
      firstName: 'Test',
      lastName: 'Client',
      email: 'testclient@example.com',
      password: 'test123',
      role: 'CLIENT'
    };
    
    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
      if (registerResponse.data.success) {
        console.log('✅ Client registration successful');
      } else {
        console.log('❌ Registration failed:', registerResponse.data.error);
      }
    } catch (error) {
      if (error.response?.data?.error?.includes('already exists')) {
        console.log('ℹ️ Client already exists, proceeding with login');
      } else {
        console.log('❌ Registration error:', error.response?.data?.error);
      }
    }
    
    // Test 2: Login as client
    console.log('\n2. Testing client login...');
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'testclient@example.com',
      password: 'test123'
    });
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      console.log('✅ Client login successful');
      console.log('👤 User:', `${user.firstName} ${user.lastName} (${user.role})`);
      
      // Test 3: Test favorites API
      console.log('\n3. Testing favorites API...');
      
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
          console.log('ℹ️ No favorites yet - this is normal for a new account');
        }
      } else {
        console.log('❌ Favorites API error:', favoritesResponse.data.error);
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

testClientAccount(); 