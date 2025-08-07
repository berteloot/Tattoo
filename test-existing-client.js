const axios = require('axios');

// Test with existing client accounts
async function testExistingClient() {
  console.log('🧪 Testing with Existing Client Accounts...');
  
  const API_URL = 'https://tattooed-world-backend.onrender.com/api';
  
  // Test different client accounts
  const testAccounts = [
    { email: 'client@example.com', password: 'client123' },
    { email: 'test2@example.com', password: 'test123' },
    { email: 'stan@example.com', password: 'stan123' }
  ];
  
  for (const account of testAccounts) {
    console.log(`\n🔍 Testing account: ${account.email}`);
    
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: account.email,
        password: account.password
      });
      
      if (loginResponse.data.success) {
        const token = loginResponse.data.data.token;
        const user = loginResponse.data.data.user;
        console.log(`✅ Login successful: ${user.firstName} ${user.lastName} (${user.role})`);
        
        // Test favorites API
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
          
          // Found a working account, break
          break;
        } else {
          console.log('❌ Favorites API error:', favoritesResponse.data.error);
        }
      } else {
        console.log('❌ Login failed:', loginResponse.data.error);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ Invalid credentials');
      } else {
        console.log('❌ Error:', error.response?.data?.error || error.message);
      }
    }
  }
}

testExistingClient(); 