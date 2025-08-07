const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function testMontrealAddresses() {
  try {
    console.log('🧪 TESTING MONTREAL ADDRESSES WITH GOOGLE API\n');
    
    // Test with specific Montreal addresses
    const testAddresses = [
      '1234 Saint Catherine St W, Montreal, QC H3G 1P2',
      '5678 Sherbrooke St W, Montreal, QC H4A 1H7',
      '910 Rue Saint Denis, Montreal, QC H2X 3K8',
      '1234 Avenue du Mont-Royal E, Montreal, QC H2J 1X1',
      '5678 Boulevard Saint-Laurent, Montreal, QC H2T 1S1'
    ];
    
    for (const address of testAddresses) {
      console.log(`🌍 Testing: ${address}`);
      
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
          console.log(`⚠️ Same as Montreal center (might be too generic)`);
        }
      } else {
        console.log(`❌ Error: ${result.error}`);
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
testMontrealAddresses(); 