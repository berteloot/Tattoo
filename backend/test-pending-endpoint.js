const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function testPendingEndpoint() {
  console.log('🔍 TESTING PENDING ENDPOINT\n');

  try {
    // 1. Test with different limit values
    console.log('1️⃣ Testing with limit=1000...');
    const response1 = await axios.get(`${API_BASE_URL}/api/geocoding/pending?limit=1000`);
    console.log(`Response: ${response1.data.data.length} studios\n`);

    // 2. Test without limit
    console.log('2️⃣ Testing without limit...');
    const response2 = await axios.get(`${API_BASE_URL}/api/geocoding/pending`);
    console.log(`Response: ${response2.data.data.length} studios\n`);

    // 3. Test with limit=200
    console.log('3️⃣ Testing with limit=200...');
    const response3 = await axios.get(`${API_BASE_URL}/api/geocoding/pending?limit=200`);
    console.log(`Response: ${response3.data.data.length} studios\n`);

    // 4. Check if there are any studios with empty string addresses
    console.log('4️⃣ Checking for studios with empty addresses...');
    const allStudiosResponse = await axios.get(`${API_BASE_URL}/api/studios?limit=1000`);
    const allStudios = allStudiosResponse.data.data.studios || [];
    
    const studiosWithEmptyAddress = allStudios.filter(studio => 
      (studio.latitude === null || studio.longitude === null) &&
      (!studio.address || studio.address.trim() === '')
    );
    
    console.log(`Studios with null coordinates and empty address: ${studiosWithEmptyAddress.length}`);
    
    if (studiosWithEmptyAddress.length > 0) {
      console.log('Examples:');
      studiosWithEmptyAddress.slice(0, 5).forEach((studio, index) => {
        console.log(`  ${index + 1}. ${studio.title}`);
        console.log(`     Address: "${studio.address}"`);
        console.log(`     City: "${studio.city}"`);
        console.log(`     Country: "${studio.country}"`);
        console.log(`     Lat: ${studio.latitude}, Lng: ${studio.longitude}`);
      });
    }

    // 5. Check if there are studios with null coordinates but valid addresses
    console.log('\n5️⃣ Checking for studios with null coordinates but valid addresses...');
    const studiosWithValidAddress = allStudios.filter(studio => 
      (studio.latitude === null || studio.longitude === null) &&
      studio.address && studio.address.trim() !== ''
    );
    
    console.log(`Studios with null coordinates and valid address: ${studiosWithValidAddress.length}`);
    
    if (studiosWithValidAddress.length > 0) {
      console.log('Examples:');
      studiosWithValidAddress.slice(0, 5).forEach((studio, index) => {
        console.log(`  ${index + 1}. ${studio.title}`);
        console.log(`     Address: "${studio.address}"`);
        console.log(`     City: "${studio.city}"`);
        console.log(`     Country: "${studio.country}"`);
        console.log(`     Lat: ${studio.latitude}, Lng: ${studio.longitude}`);
      });
    }

    // 6. Test the exact query that the pending endpoint uses
    console.log('\n6️⃣ Testing exact pending endpoint query...');
    const testResponse = await axios.get(`${API_BASE_URL}/api/geocoding/pending?limit=1000`);
    const pendingStudios = testResponse.data.data;
    
    console.log(`Pending endpoint returned: ${pendingStudios.length} studios`);
    
    if (pendingStudios.length > 0) {
      console.log('First few pending studios:');
      pendingStudios.slice(0, 5).forEach((studio, index) => {
        console.log(`  ${index + 1}. ${studio.title}`);
        console.log(`     Full address: "${studio.full_address}"`);
        console.log(`     Address: "${studio.address}"`);
        console.log(`     City: "${studio.city}"`);
        console.log(`     Country: "${studio.country}"`);
      });
    }

  } catch (error) {
    console.error('❌ Error testing pending endpoint:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testPendingEndpoint();
