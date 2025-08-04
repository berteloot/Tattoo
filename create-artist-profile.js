const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function createArtistProfile() {
  console.log('🔄 Creating artist profile for testing...\\n');

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

    // Step 2: Create artist profile
    console.log('2. Creating artist profile...');
    const profileData = {
      bio: 'Professional tattoo artist with 5+ years of experience specializing in traditional and Japanese styles.',
      studioName: 'Ink Dreams Studio',
      website: 'https://inkdreams.com',
      instagram: '@inkdreams',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      hourlyRate: 150,
      minPrice: 50,
      maxPrice: 500
    };

    const profileResponse = await axios.post(`${API_BASE}/artists`, profileData, { headers });
    
    if (profileResponse.data.success) {
      console.log('✅ Artist profile created successfully!');
      console.log('Profile ID:', profileResponse.data.data.id);
      console.log('');
      
      // Step 3: Add some specialties
      console.log('3. Adding specialties...');
      const specialtiesResponse = await axios.get(`${API_BASE}/specialties`);
      if (specialtiesResponse.data.success && specialtiesResponse.data.data.length > 0) {
        const specialtyIds = specialtiesResponse.data.data.slice(0, 3).map(s => s.id);
        console.log('Selected specialties:', specialtyIds);
      }
      
      console.log('\\n🎉 Artist profile setup completed!');
      console.log('You can now test the favorite clients email feature.');
      
    } else {
      console.log('❌ Failed to create artist profile:', profileResponse.data);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the setup
createArtistProfile(); 