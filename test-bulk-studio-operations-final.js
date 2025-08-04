const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:3001';
const ADMIN_EMAIL = 'admin@tattoolocator.com';
const ADMIN_PASSWORD = 'admin123';

async function testBulkStudioOperations() {
  try {
    console.log('🧪 Testing Bulk Studio Operations (Final)...\n');

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

    // Step 2: Get existing studios for testing
    console.log('2. Getting existing studios for testing...');
    const studiosResponse = await axios.get(`${API_BASE_URL}/api/admin/studios`, {
      headers: authHeaders
    });

    if (!studiosResponse.data.success) {
      throw new Error('Failed to fetch studios');
    }

    const studios = studiosResponse.data.data.studios;
    const testStudios = studios.filter(s => 
      s.title.includes('Bulk Test Studio V2') && 
      !s.isVerified
    ).slice(0, 3);

    if (testStudios.length === 0) {
      console.log('❌ No suitable test studios found');
      return;
    }

    const studioIds = testStudios.map(s => s.id);
    console.log(`✅ Found ${testStudios.length} test studios: ${testStudios.map(s => s.title).join(', ')}\n`);

    // Step 3: Test bulk verification
    console.log('3. Testing bulk verification...');
    const bulkVerifyResponse = await axios.post(`${API_BASE_URL}/api/admin/studios/bulk-verify`, {
      studioIds: studioIds,
      isVerified: true,
      verificationNotes: 'Bulk test approval final'
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
      studioIds: studioIds,
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
    const updatedStudiosResponse = await axios.get(`${API_BASE_URL}/api/admin/studios`, {
      headers: authHeaders
    });

    if (updatedStudiosResponse.data.success) {
      const updatedStudios = updatedStudiosResponse.data.data.studios;
      const testStudiosInDb = updatedStudios.filter(s => studioIds.includes(s.id));
      
      console.log(`📋 Found ${testStudiosInDb.length} test studios in database`);
      
      for (const studio of testStudiosInDb) {
        console.log(`📋 ${studio.title}:`);
        console.log(`   - Verified: ${studio.isVerified}`);
        console.log(`   - Status: ${studio.verificationStatus}`);
        console.log(`   - Featured: ${studio.isFeatured}`);
      }
    } else {
      console.log('❌ Failed to fetch studios:', updatedStudiosResponse.data.error);
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