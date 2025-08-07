const fetch = require('node-fetch');

async function testActualAPI() {
  console.log('🧪 Testing actual API endpoint...\n');
  
  try {
    // Test the actual API endpoint
    const response = await fetch('http://localhost:3001/api/geocoding/studios');
    
    console.log(`📊 Response status: ${response.status}`);
    console.log(`📊 Response headers:`, Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ API Response:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.success && data.data && data.data.features) {
        console.log(`\n📍 Studios found: ${data.data.features.length}`);
        
        if (data.data.features.length > 0) {
          console.log('\n📍 Sample studio:');
          const sample = data.data.features[0];
          console.log(`   Title: ${sample.properties.title}`);
          console.log(`   Coordinates: ${sample.geometry.coordinates[1]}, ${sample.geometry.coordinates[0]}`);
          console.log(`   Address: ${sample.properties.address}, ${sample.properties.city}, ${sample.properties.state}`);
        }
      } else {
        console.log('\n❌ No features found in response');
      }
    } else {
      console.log('\n❌ API request failed');
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

// Run the test
testActualAPI().catch(console.error); 