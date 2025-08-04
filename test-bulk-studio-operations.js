const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@tattoolocator.com';
const ADMIN_PASSWORD = 'admin123';

async function testBulkStudioOperations() {
  try {
    console.log('🧪 Testing Bulk Studio Operations...\n');

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

    // Step 2: Create test studios for bulk operations
    console.log('2. Creating test studios for bulk operations...');
    const testStudios = [
      {
        title: 'Bulk Test Studio 1',
        address: '123 Bulk St',
        city: 'Bulk City',
        state: 'BS',
        email: 'bulk1@test.com'
      },
      {
        title: 'Bulk Test Studio 2',
        address: '456 Bulk Ave',
        city: 'Bulk Town',
        state: 'BT',
        email: 'bulk2@test.com'
      },
      {
        title: 'Bulk Test Studio 3',
        address: '789 Bulk Blvd',
        city: 'Bulk Village',
        state: 'BV',
        email: 'bulk3@test.com'
      }
    ];

    const createdStudioIds = [];
    for (const studioData of testStudios) {
      try {
        const createResponse = await axios.post(`${API_BASE_URL}/api/admin/studios`, studioData, {
          headers: authHeaders
        });
        if (createResponse.data.success) {
          createdStudioIds.push(createResponse.data.data.id);
          console.log(`✅ Created: ${studioData.title}`);
        }
      } catch (error) {
        console.log(`❌ Failed to create: ${studioData.title}`);
      }
    }

    if (createdStudioIds.length === 0) {
      console.log('❌ No test studios created, cannot test bulk operations');
      return;
    }

    console.log(`✅ Created ${createdStudioIds.length} test studios\n`);

    // Step 3: Test bulk verification
    console.log('3. Testing bulk verification...');
    const bulkVerifyResponse = await axios.post(`${API_BASE_URL}/api/admin/studios/bulk-verify`, {
      studioIds: createdStudioIds,
      isVerified: true,
      verificationNotes: 'Bulk test approval'
    }, {
      headers: authHeaders
    });

    if (bulkVerifyResponse.data.success) {
      console.log('✅ Bulk verification successful');
      console.log(`📝 Response: ${bulkVerifyResponse.data.message}`);
      console.log(`📊 Results: ${bulkVerifyResponse.data.data.successful}/${bulkVerifyResponse.data.data.total} successful`);
    } else {
      console.log('❌ Bulk verification failed:', bulkVerifyResponse.data.error);
    }

    // Step 4: Test bulk featuring
    console.log('\n4. Testing bulk featuring...');
    const bulkFeatureResponse = await axios.post(`${API_BASE_URL}/api/admin/studios/bulk-feature`, {
      studioIds: createdStudioIds,
      isFeatured: true
    }, {
      headers: authHeaders
    });

    if (bulkFeatureResponse.data.success) {
      console.log('✅ Bulk featuring successful');
      console.log(`📝 Response: ${bulkFeatureResponse.data.message}`);
      console.log(`📊 Results: ${bulkFeatureResponse.data.data.successful}/${bulkFeatureResponse.data.data.total} successful`);
    } else {
      console.log('❌ Bulk featuring failed:', bulkFeatureResponse.data.error);
    }

    // Step 5: Verify the changes in the database
    console.log('\n5. Verifying changes in database...');
    const studiosResponse = await axios.get(`${API_BASE_URL}/api/admin/studios`, {
      headers: authHeaders
    });

    if (studiosResponse.data.success) {
      const studios = studiosResponse.data.data.studios;
      const testStudiosInDb = studios.filter(s => createdStudioIds.includes(s.id));
      
      console.log(`📋 Found ${testStudiosInDb.length} test studios in database`);
      
      for (const studio of testStudiosInDb) {
        console.log(`📋 ${studio.title}:`);
        console.log(`   - Verified: ${studio.isVerified}`);
        console.log(`   - Status: ${studio.verificationStatus}`);
        console.log(`   - Featured: ${studio.isFeatured}`);
      }
    } else {
      console.log('❌ Failed to fetch studios:', studiosResponse.data.error);
    }

    // Step 6: Test validation (empty array)
    console.log('\n6. Testing validation (empty array)...');
    try {
      const invalidResponse = await axios.post(`${API_BASE_URL}/api/admin/studios/bulk-verify`, {
        studioIds: [],
        isVerified: true
      }, {
        headers: authHeaders
      });
      console.log('❌ Validation failed - should have rejected empty array');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working correctly');
        console.log(`📝 Error: ${error.response.data.error}`);
      } else {
        console.log('❌ Unexpected error during validation test:', error.message);
      }
    }

    // Step 7: Test validation (missing studioIds)
    console.log('\n7. Testing validation (missing studioIds)...');
    try {
      const invalidResponse = await axios.post(`${API_BASE_URL}/api/admin/studios/bulk-verify`, {
        isVerified: true
      }, {
        headers: authHeaders
      });
      console.log('❌ Validation failed - should have rejected missing studioIds');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working correctly');
        console.log(`📝 Error: ${error.response.data.error}`);
      } else {
        console.log('❌ Unexpected error during validation test:', error.message);
      }
    }

    console.log('\n🎉 Bulk Studio Operations Test Completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testBulkStudioOperations(); 