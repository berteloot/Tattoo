const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function testActualStudios() {
  try {
    console.log('🧪 TESTING ACTUAL STUDIO ADDRESSES\n');
    
    // First, get actual studios from the database
    console.log('1. Fetching studios from database...');
    const studiosResponse = await axios.get(`${API_BASE_URL}/api/studios?limit=10`);
    
    if (!studiosResponse.data.success) {
      throw new Error('Failed to fetch studios');
    }
    
    const studios = studiosResponse.data.data.studios;
    console.log(`📊 Found ${studios.length} studios`);
    
    // Test with studios that have addresses
    const studiosWithAddresses = studios.filter(studio => 
      studio.address && studio.city && studio.state
    ).slice(0, 5); // Test first 5
    
    console.log(`📍 Testing ${studiosWithAddresses.length} studios with addresses\n`);
    
    for (const studio of studiosWithAddresses) {
      const address = `${studio.address}, ${studio.city}, ${studio.state} ${studio.zipCode || ''}`.trim();
      console.log(`🌍 Testing: ${studio.title}`);
      console.log(`📍 Address: ${address}`);
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/geocoding/geocode`, {
          address: address
        });
        
        const result = response.data;
        console.log(`✅ Result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
        
        if (result.success) {
          console.log(`📍 Location: ${result.location.lat}, ${result.location.lng}`);
          console.log(`💾 Cached: ${result.cached}`);
          console.log(`🔄 Fallback: ${result.fallback || false}`);
          console.log(`📋 Source: ${result.source || 'unknown'}`);
          
          // Check if coordinates are different from Montreal center
          const montrealCenter = { lat: 45.5017, lng: -73.5673 };
          const distance = Math.sqrt(
            Math.pow(result.location.lat - montrealCenter.lat, 2) + 
            Math.pow(result.location.lng - montrealCenter.lng, 2)
          );
          
          if (distance > 0.001) {
            console.log(`🎯 Different from Montreal center! Distance: ${distance.toFixed(4)}`);
          } else {
            console.log(`⚠️ Same as Montreal center`);
          }
        } else {
          console.log(`❌ Error: ${result.error}`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to geocode: ${error.response?.data || error.message}`);
      }
      
      console.log('---');
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testActualStudios(); 