const axios = require('axios');

const API_BASE = 'https://tattooed-world-backend.onrender.com/api';

async function testRenderFavoriteClients() {
  console.log('🌐 Testing Favorite Clients Email Feature on Render Production...\\n');

  try {
    // Step 1: Login as artist
    console.log('1. Logging in as artist on Render...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'artist@example.com',
      password: 'artist123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Artist login failed on Render');
    }

    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Artist login successful on Render\\n');

    // Step 2: Test get favorite clients endpoint
    console.log('2. Testing get favorite clients endpoint on Render...');
    const favoritesResponse = await axios.get(`${API_BASE}/artists/my-favorites`, { headers });
    
    if (favoritesResponse.data.success) {
      const clients = favoritesResponse.data.data;
      console.log(`✅ Found ${clients.totalClients || clients.clients?.length || 0} favorite clients on Render\\n`);
      
      if (clients.clients && clients.clients.length > 0) {
        console.log('Sample client data from Render:');
        console.log(JSON.stringify(clients.clients[0], null, 2));
        console.log('');
      }
    } else {
      console.log('⚠️ No favorite clients found or endpoint error on Render');
      console.log('Response:', favoritesResponse.data);
      console.log('');
    }

    // Step 3: Test email favorite clients endpoint
    console.log('3. Testing email favorite clients endpoint on Render...');
    const emailData = {
      subject: 'Test Email from Artist - Render Production',
      message: 'This is a test email from your favorite artist on Render production!',
      clientIds: [], // Will be populated if we have clients
      sendToAll: true
    };

    // If we have clients, add the first one to the email
    if (favoritesResponse.data.success && favoritesResponse.data.data.clients && favoritesResponse.data.data.clients.length > 0) {
      emailData.clientIds = [favoritesResponse.data.data.clients[0].client.id];
      emailData.sendToAll = false;
    }

    const emailResponse = await axios.post(`${API_BASE}/artists/email-favorites`, emailData, { headers });
    
    if (emailResponse.data.success) {
      console.log('✅ Email sent successfully on Render!');
      console.log('Response:', emailResponse.data);
    } else {
      console.log('⚠️ Email sending failed or no clients to email on Render');
      console.log('Response:', emailResponse.data);
    }

    console.log('\\n🎉 Render Production Favorite Clients Email Feature Test Completed!');

  } catch (error) {
    console.error('❌ Test failed on Render:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\\n💡 Tip: Make sure the artist account exists and has a profile on Render');
    } else if (error.response?.status === 403) {
      console.log('\\n💡 Tip: Authorization issue - check user role and permissions');
    }
  }
}

// Run the test
testRenderFavoriteClients(); 