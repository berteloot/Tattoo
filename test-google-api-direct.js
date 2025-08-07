const axios = require('axios');

async function testGoogleAPIDirect() {
  try {
    console.log('🧪 TESTING GOOGLE API DIRECTLY\n');
    
    // Test a simple Montreal address
    const address = '1541 Sherbrooke St W, Montreal, Quebec';
    const apiKey = 'AIzaSyDcV1CcJSHK0tZi1Y7a123ev7Gs7MMgoBQ'; // Your API key
    
    console.log(`🌍 Testing address: ${address}`);
    console.log(`🔑 Using API key: ${apiKey.substring(0, 10)}...`);
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    
    console.log(`📡 Calling: ${url.substring(0, 50)}...`);
    
    const response = await axios.get(url);
    const data = response.data;
    
    console.log(`✅ Status: ${data.status}`);
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log(`📍 Location: ${location.lat}, ${location.lng}`);
      console.log(`🎯 Formatted Address: ${data.results[0].formatted_address}`);
      
      // Check if different from Montreal center
      const montrealCenter = { lat: 45.5017, lng: -73.5673 };
      const distance = Math.sqrt(
        Math.pow(location.lat - montrealCenter.lat, 2) + 
        Math.pow(location.lng - montrealCenter.lng, 2)
      );
      
      if (distance > 0.001) {
        console.log(`🎯 Different from Montreal center! Distance: ${distance.toFixed(4)}`);
      } else {
        console.log(`⚠️ Same as Montreal center`);
      }
    } else {
      console.log(`❌ Error: ${data.status}`);
      if (data.error_message) {
        console.log(`📝 Error message: ${data.error_message}`);
      }
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
testGoogleAPIDirect(); 