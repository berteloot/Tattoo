const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function debugUserProfile() {
  console.log('🔍 Debugging user profile...\\n');

  try {
    // Step 1: Login as artist
    console.log('1. Logging in as artist...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'artist@example.com',
      password: 'artist123'
    });

    if (!loginResponse.data.success) {
      throw new Error('Artist login failed');
    }

    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    console.log('✅ Artist login successful\\n');

    // Step 2: Get current user profile
    console.log('2. Getting current user profile...');
    const userResponse = await axios.get(`${API_BASE}/auth/me`, { headers });
    
    if (userResponse.data.success) {
      const user = userResponse.data.data;
      console.log('User data:');
      console.log(JSON.stringify(user, null, 2));
      console.log('');
      
      console.log('User role:', user.role);
      console.log('Artist profile exists:', !!user.artistProfile);
      console.log('Artist profile ID:', user.artistProfile?.id);
      console.log('');
    } else {
      console.log('❌ Failed to get user profile:', userResponse.data);
    }

    // Step 3: Check if artist profile exists in database
    console.log('3. Checking artist profile in database...');
    const artistResponse = await axios.get(`${API_BASE}/artists`);
    
    if (artistResponse.data.success) {
      const artists = artistResponse.data.data;
      console.log(`Found ${artists.length} artists in database`);
      
      const currentArtist = artists.find(a => a.user?.email === 'artist@example.com');
      if (currentArtist) {
        console.log('Current artist found:');
        console.log(JSON.stringify(currentArtist, null, 2));
      } else {
        console.log('❌ Artist not found in artists list');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the debug
debugUserProfile(); 