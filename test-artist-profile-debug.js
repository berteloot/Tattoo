const axios = require('axios');

// Test the artist profile creation API
async function testArtistProfileCreation() {
  try {
    // First, let's login to get a token
    console.log('🔍 Logging in...');
    const loginResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/auth/login', {
      email: 'artist@example.com',
      password: 'artist123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token received');
    
    // Test data that should pass validation
    const testData = {
      bio: 'I am a professional tattoo artist with 5 years of experience specializing in traditional and blackwork styles.',
      city: 'Le Pouliguen',
      country: 'France',
      specialtyIds: ['spec_real_006'], // Realism specialty
      serviceIds: []
    };
    
    console.log('🔍 Sending test data:', JSON.stringify(testData, null, 2));
    
    // Try to create artist profile
    const response = await axios.post('https://tattooed-world-backend.onrender.com/api/artists', testData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('❌ Validation details:', error.response.data.details);
    }
  }
}

testArtistProfileCreation(); 