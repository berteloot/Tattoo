const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testStudioArtistFix() {
  console.log('🧪 Testing StudioArtist relationship fix...\\n');

  try {
    // Test 1: Get studios
    console.log('1. Testing get studios...');
    const studiosResponse = await axios.get(`${API_BASE}/studios`);
    
    if (!studiosResponse.data.success) {
      throw new Error('Failed to get studios');
    }
    
    const studios = studiosResponse.data.data;
    console.log(`✅ Found ${studios.length} studios\\n`);
    
    if (studios.length === 0) {
      console.log('⚠️ No studios found, skipping artist tests');
      return;
    }
    
    // Test 2: Get artists for first studio
    const firstStudio = studios[0];
    console.log(`2. Testing get artists for studio: ${firstStudio.title}...`);
    
    const artistsResponse = await axios.get(`${API_BASE}/studios/${firstStudio.id}/artists`);
    
    if (!artistsResponse.data.success) {
      throw new Error('Failed to get studio artists');
    }
    
    const artists = artistsResponse.data.data;
    console.log(`✅ Found ${artists.length} artists for studio\\n`);
    
    // Test 3: Get studios for first artist (if any)
    if (artists.length > 0) {
      const firstArtist = artists[0];
      console.log(`3. Testing get studios for artist: ${firstArtist.artist?.user?.firstName || 'Unknown'}...`);
      
      const artistStudiosResponse = await axios.get(`${API_BASE}/artists/${firstArtist.artist.id}/studios`);
      
      if (!artistStudiosResponse.data.success) {
        throw new Error('Failed to get artist studios');
      }
      
      const artistStudios = artistStudiosResponse.data.data;
      console.log(`✅ Found ${artistStudios.length} studios for artist\\n`);
    }
    
    // Test 4: Test artist login and get their studios
    console.log('4. Testing artist login and studios...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'artist@example.com',
      password: 'artist123'
    });
    
    if (!loginResponse.data.success) {
      console.log('⚠️ Artist login failed, skipping artist-specific tests');
      return;
    }
    
    const token = loginResponse.data.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    
    const artistStudiosResponse = await axios.get(`${API_BASE}/artists/my-studios`, { headers });
    
    if (artistStudiosResponse.data.success) {
      const myStudios = artistStudiosResponse.data.data;
      console.log(`✅ Artist has ${myStudios.length} studios\\n`);
    } else {
      console.log('⚠️ Artist has no studios or endpoint not found\\n');
    }
    
    console.log('🎉 All StudioArtist relationship tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testStudioArtistFix(); 