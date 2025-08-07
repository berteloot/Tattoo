const https = require('https');

async function testProductionAPI() {
  console.log('🧪 Testing production API endpoint...\n');
  
  try {
    const url = 'https://tattooed-world-backend.onrender.com/api/geocoding/studios';
    
    console.log(`📊 Testing: ${url}`);
    
    const response = await new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
    
    console.log(`📊 Response status: ${response.status}`);
    
    if (response.status === 200) {
      const jsonData = JSON.parse(response.data);
      console.log('\n✅ Production API Response:');
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success && jsonData.data && jsonData.data.features) {
        console.log(`\n📍 Studios found in production: ${jsonData.data.features.length}`);
        
        if (jsonData.data.features.length > 0) {
          console.log('\n📍 Sample studio from production:');
          const sample = jsonData.data.features[0];
          console.log(`   Title: ${sample.properties.title}`);
          console.log(`   Coordinates: ${sample.geometry.coordinates[1]}, ${sample.geometry.coordinates[0]}`);
          console.log(`   Address: ${sample.properties.address}, ${sample.properties.city}, ${sample.properties.state}`);
        }
      } else {
        console.log('\n❌ No features found in production response');
      }
    } else {
      console.log('\n❌ Production API request failed');
      console.log('Response data:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Error testing production API:', error);
  }
}

// Run the test
testProductionAPI().catch(console.error); 