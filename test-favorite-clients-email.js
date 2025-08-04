const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testFavoriteClientsEmail() {
  console.log('🧪 Testing Favorite Clients Email Feature...\\n');

  try {
    // Step 1: Login as an artist
    console.log('1. Logging in as artist...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'artist@example.com',
      password: 'artist123'
    });

    if (!loginResponse.data.success) {
      console.log('⚠️ Artist login failed, trying to create artist profile...');
      
      // Try to create artist profile first
      const createProfileResponse = await axios.post(`${API_BASE}/artists`, {
        bio: 'Test artist bio',
        studioName: 'Test Studio',
        city: 'Test City',
        state: 'TS',
        country: 'USA'
      }, {
        headers: { Authorization: `Bearer ${loginResponse.data.data.token}` }
      });
      
      if (createProfileResponse.data.success) {
        console.log('✅ Artist profile created successfully');
      }
    }

    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Artist login successful\\n');

    // Step 2: Test get favorite clients endpoint
    console.log('2. Testing get favorite clients endpoint...');
    const favoritesResponse = await axios.get(`${API_BASE}/artists/my-favorites`, { headers });
    
    if (favoritesResponse.data.success) {
      const clients = favoritesResponse.data.data;
      console.log(`✅ Found ${clients.length} favorite clients\\n`);
      
      if (clients.length > 0) {
        console.log('Sample client data:');
        console.log(JSON.stringify(clients[0], null, 2));
        console.log('');
      }
    } else {
      console.log('⚠️ No favorite clients found or endpoint error');
      console.log('Response:', favoritesResponse.data);
      console.log('');
    }

    // Step 3: Test email favorite clients endpoint
    console.log('3. Testing email favorite clients endpoint...');
    const emailData = {
      subject: 'Test Email from Artist',
      message: 'This is a test email from your favorite artist!',
      clientIds: [], // Will be populated if we have clients
      sendToAll: true
    };

    // If we have clients, add the first one to the email
    if (favoritesResponse.data.success && favoritesResponse.data.data.length > 0) {
      emailData.clientIds = [favoritesResponse.data.data[0].id];
      emailData.sendToAll = false;
    }

    const emailResponse = await axios.post(`${API_BASE}/artists/email-favorites`, emailData, { headers });
    
    if (emailResponse.data.success) {
      console.log('✅ Email sent successfully!');
      console.log('Response:', emailResponse.data);
    } else {
      console.log('⚠️ Email sending failed or no clients to email');
      console.log('Response:', emailResponse.data);
    }

    console.log('\\n🎉 Favorite Clients Email Feature Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\\n💡 Tip: Make sure the artist account exists and has a profile');
    }
  }
}

// Run the test
testFavoriteClientsEmail(); 