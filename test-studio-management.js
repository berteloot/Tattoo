const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@tattoolocator.com';
const ADMIN_PASSWORD = 'admin123';

async function testStudioManagement() {
  try {
    console.log('🧪 Testing Studio Management Functionality...\n');

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

    // Step 2: Get all studios
    console.log('2. Fetching all studios...');
    const studiosResponse = await axios.get(`${API_BASE_URL}/api/admin/studios`, {
      headers: authHeaders
    });

    if (studiosResponse.data.success) {
      const studios = studiosResponse.data.data.studios;
      console.log(`✅ Found ${studios.length} studios`);
      
      if (studios.length > 0) {
        const testStudio = studios.find(s => s.title.includes('Test Studio'));
        if (testStudio) {
          console.log(`📋 Test studio found: ${testStudio.title} (${testStudio.verificationStatus})`);
          
          // Step 3: Test studio verification
          console.log('\n3. Testing studio verification...');
          const verifyResponse = await axios.put(`${API_BASE_URL}/api/admin/studios/${testStudio.id}/verify`, {
            isVerified: true,
            verificationNotes: 'Test verification from admin panel'
          }, {
            headers: authHeaders
          });

          if (verifyResponse.data.success) {
            console.log('✅ Studio verification successful');
            console.log(`📝 Response: ${verifyResponse.data.message}`);
          } else {
            console.log('❌ Studio verification failed:', verifyResponse.data.error);
          }

          // Step 4: Test studio featuring
          console.log('\n4. Testing studio featuring...');
          const featureResponse = await axios.put(`${API_BASE_URL}/api/admin/studios/${testStudio.id}/feature`, {
            isFeatured: true
          }, {
            headers: authHeaders
          });

          if (featureResponse.data.success) {
            console.log('✅ Studio featuring successful');
            console.log(`📝 Response: ${featureResponse.data.message}`);
          } else {
            console.log('❌ Studio featuring failed:', featureResponse.data.error);
          }

          // Step 5: Test studio update
          console.log('\n5. Testing studio update...');
          const updateResponse = await axios.put(`${API_BASE_URL}/api/admin/studios/${testStudio.id}`, {
            title: testStudio.title + ' (Updated)',
            website: 'https://updated-studio.com',
            phoneNumber: '555-999-8888',
            isActive: true
          }, {
            headers: authHeaders
          });

          if (updateResponse.data.success) {
            console.log('✅ Studio update successful');
            console.log(`📝 Response: ${updateResponse.data.message}`);
          } else {
            console.log('❌ Studio update failed:', updateResponse.data.error);
          }

          // Step 6: Verify the changes
          console.log('\n6. Verifying changes...');
          const updatedStudioResponse = await axios.get(`${API_BASE_URL}/api/admin/studios/${testStudio.id}`, {
            headers: authHeaders
          });

          if (updatedStudioResponse.data.success) {
            const updatedStudio = updatedStudioResponse.data.data;
            console.log('✅ Studio details retrieved');
            console.log(`📋 Updated title: ${updatedStudio.title}`);
            console.log(`📋 Verification status: ${updatedStudio.verificationStatus}`);
            console.log(`📋 Featured: ${updatedStudio.isFeatured}`);
            console.log(`📋 Active: ${updatedStudio.isActive}`);
          } else {
            console.log('❌ Failed to retrieve updated studio:', updatedStudioResponse.data.error);
          }

        } else {
          console.log('⚠️  No test studio found to verify');
        }
      } else {
        console.log('⚠️  No studios found in database');
      }
    } else {
      console.log('❌ Failed to fetch studios:', studiosResponse.data.error);
    }

    // Step 7: Test filtering
    console.log('\n7. Testing studio filtering...');
    const filterResponse = await axios.get(`${API_BASE_URL}/api/admin/studios?verified=true&featured=true`, {
      headers: authHeaders
    });

    if (filterResponse.data.success) {
      const filteredStudios = filterResponse.data.data.studios;
      console.log(`✅ Filter applied successfully`);
      console.log(`📋 Found ${filteredStudios.length} verified and featured studios`);
    } else {
      console.log('❌ Filtering failed:', filterResponse.data.error);
    }

    console.log('\n🎉 Studio Management Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testStudioManagement(); 