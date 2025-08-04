const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@tattoolocator.com';
const ADMIN_PASSWORD = 'admin123';

// Sample CSV data for testing
const sampleCSV = `title,address,city,state,zipcode,country,phone,email,website,facebook,instagram,twitter,linkedin,youtube,latitude,longitude
"Test Studio 1","123 Main St","New York","NY","10001","USA","555-123-4567","studio1@example.com","https://studio1.com","https://facebook.com/studio1","https://instagram.com/studio1","https://twitter.com/studio1","https://linkedin.com/studio1","https://youtube.com/studio1","40.7128","-74.0060"
"Test Studio 2","456 Oak Ave","Los Angeles","CA","90210","USA","555-987-6543","studio2@example.com","https://studio2.com","https://facebook.com/studio2","https://instagram.com/studio2","https://twitter.com/studio2","https://linkedin.com/studio2","https://youtube.com/studio2","34.0522","-118.2437"
"Test Studio 3","789 Pine St","Chicago","IL","60601","USA","555-456-7890","studio3@example.com","https://studio3.com","https://facebook.com/studio3","https://instagram.com/studio3","https://twitter.com/studio3","https://linkedin.com/studio3","https://youtube.com/studio3","41.8781","-87.6298"`;

async function testStudioCSVUpload() {
  try {
    console.log('🧪 Testing Studio CSV Upload Functionality...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error('Admin login failed');
    }

    const token = loginResponse.data.data.token;
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('✅ Admin login successful\n');

    // Step 2: Test CSV template download
    console.log('2. Testing CSV template download...');
    try {
      const templateResponse = await axios.get(`${API_BASE_URL}/api/admin/studios-csv-template`, {
        headers: authHeaders,
        responseType: 'text'
      });

      console.log('✅ Template download successful');
      console.log('Template content preview:', templateResponse.data.substring(0, 100) + '...\n');
    } catch (error) {
      console.log('❌ Template download failed:', error.response?.data?.error || error.message);
    }

    // Step 3: Test CSV upload
    console.log('3. Testing CSV upload...');
    const uploadResponse = await axios.post(`${API_BASE_URL}/api/admin/upload-studios-csv`, {
      csvData: sampleCSV
    }, {
      headers: authHeaders
    });

    if (uploadResponse.data.success) {
      console.log('✅ CSV upload successful');
      console.log('Upload results:', uploadResponse.data.data);
      console.log(`📊 Summary: ${uploadResponse.data.data.successful} successful, ${uploadResponse.data.data.failed} failed`);
      
      if (uploadResponse.data.data.errors && uploadResponse.data.data.errors.length > 0) {
        console.log('❌ Errors encountered:');
        uploadResponse.data.data.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
    } else {
      console.log('❌ CSV upload failed:', uploadResponse.data.error);
    }

    // Step 4: Verify studios were created
    console.log('\n4. Verifying studios were created...');
    const studiosResponse = await axios.get(`${API_BASE_URL}/api/studios`, {
      headers: authHeaders
    });

    if (studiosResponse.data.success) {
      const studios = studiosResponse.data.data.studios;
      const testStudios = studios.filter(studio => 
        studio.title.includes('Test Studio')
      );
      
      console.log(`✅ Found ${testStudios.length} test studios in database`);
      testStudios.forEach(studio => {
        console.log(`   - ${studio.title} (${studio.city}, ${studio.state})`);
      });
    } else {
      console.log('❌ Failed to fetch studios:', studiosResponse.data.error);
    }

    console.log('\n🎉 Studio CSV Upload Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testStudioCSVUpload(); 