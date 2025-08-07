const axios = require('axios');

// Test with admin account and create a verified client
async function testAdminAndClient() {
  console.log('🧪 Testing with Admin Account...');
  
  const API_URL = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    // Test admin login
    console.log('\n1. Testing admin login...');
    
    const adminLoginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'berteloot@gmail.com',
      password: 'admin123'
    });
    
    if (adminLoginResponse.data.success) {
      const adminToken = adminLoginResponse.data.data.token;
      const adminUser = adminLoginResponse.data.data.user;
      console.log(`✅ Admin login successful: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.role})`);
      
      // Test admin favorites access (should work for any role)
      console.log('\n2. Testing admin favorites access...');
      
      const adminFavoritesResponse = await axios.get(`${API_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (adminFavoritesResponse.data.success) {
        const favorites = adminFavoritesResponse.data.data.favorites;
        console.log(`✅ Admin favorites API working: ${favorites.length} favorites found`);
        
        if (favorites.length > 0) {
          console.log('📋 Sample favorite:', {
            artistName: `${favorites[0].artist.user.firstName} ${favorites[0].artist.user.lastName}`,
            studioName: favorites[0].artist.studioName,
            city: favorites[0].artist.city
          });
        }
      } else {
        console.log('❌ Admin favorites API error:', adminFavoritesResponse.data.error);
      }
      
      // Create a verified client account
      console.log('\n3. Creating verified client account...');
      
      const clientRegisterResponse = await axios.post(`${API_URL}/auth/register`, {
        firstName: 'Verified',
        lastName: 'Client',
        email: 'verifiedclient@example.com',
        password: 'client123',
        role: 'CLIENT'
      });
      
      if (clientRegisterResponse.data.success) {
        console.log('✅ Client registration successful');
        
        // Now try to login with the new client
        console.log('\n4. Testing new client login...');
        
        const clientLoginResponse = await axios.post(`${API_URL}/auth/login`, {
          email: 'verifiedclient@example.com',
          password: 'client123'
        });
        
        if (clientLoginResponse.data.success) {
          const clientToken = clientLoginResponse.data.data.token;
          const clientUser = clientLoginResponse.data.data.user;
          console.log(`✅ Client login successful: ${clientUser.firstName} ${clientUser.lastName} (${clientUser.role})`);
          
          // Test client favorites
          const clientFavoritesResponse = await axios.get(`${API_URL}/favorites`, {
            headers: {
              'Authorization': `Bearer ${clientToken}`
            }
          });
          
          if (clientFavoritesResponse.data.success) {
            const favorites = clientFavoritesResponse.data.data.favorites;
            console.log(`✅ Client favorites API working: ${favorites.length} favorites found`);
          } else {
            console.log('❌ Client favorites API error:', clientFavoritesResponse.data.error);
          }
        } else {
          console.log('❌ Client login failed:', clientLoginResponse.data.error);
        }
      } else {
        console.log('❌ Client registration failed:', clientRegisterResponse.data.error);
      }
      
    } else {
      console.log('❌ Admin login failed:', adminLoginResponse.data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAdminAndClient(); 