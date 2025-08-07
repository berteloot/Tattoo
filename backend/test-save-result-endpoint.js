const https = require('https');

async function testSaveResultEndpoint() {
  console.log('🧪 Testing save-result endpoint...');
  
  const testData = {
    studioId: 'test-studio-id',
    latitude: 40.7128,
    longitude: -74.0060,
    address: '123 Test Street, New York, NY 10001, USA'
  };
  
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'tattooed-world-backend.onrender.com',
    port: 443,
    path: '/api/geocoding/save-result',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`📡 Response status: ${res.statusCode}`);
      console.log(`📡 Response headers:`, res.headers);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📡 Response body:', data);
        
        try {
          const jsonData = JSON.parse(data);
          console.log('📡 Parsed response:', jsonData);
        } catch (error) {
          console.log('📡 Raw response (not JSON):', data);
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

testSaveResultEndpoint().catch(console.error); 