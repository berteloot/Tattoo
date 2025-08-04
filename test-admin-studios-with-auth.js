const axios = require('axios');

async function testAdminStudiosWithAuth() {
  console.log('🔍 Testing admin studios endpoint with authentication...\n');
  
  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/auth/login', {
      email: 'berteloot@gmail.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Step 2: Test admin studios endpoint with different filters
    console.log('\n2️⃣ Testing admin studios endpoint with various filters...');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test with no filters
    console.log('\n📋 Testing with no filters...');
    const noFiltersResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios', { headers });
    console.log('Response:', {
      status: noFiltersResponse.status,
      total: noFiltersResponse.data?.total || 0,
      studios: noFiltersResponse.data?.data?.length || 0,
      success: noFiltersResponse.data?.success
    });
    
    if (noFiltersResponse.data?.data?.length > 0) {
      console.log('First studio:', noFiltersResponse.data.data[0]);
    }
    
    // Test with verified filter
    console.log('\n📋 Testing with verified=true filter...');
    const verifiedResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios?verified=true', { headers });
    console.log('Verified studios:', {
      status: verifiedResponse.status,
      total: verifiedResponse.data?.total || 0,
      studios: verifiedResponse.data?.data?.length || 0
    });
    
    // Test with unverified filter
    console.log('\n📋 Testing with verified=false filter...');
    const unverifiedResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios?verified=false', { headers });
    console.log('Unverified studios:', {
      status: unverifiedResponse.status,
      total: unverifiedResponse.data?.total || 0,
      studios: unverifiedResponse.data?.data?.length || 0
    });
    
    // Test with status filter
    console.log('\n📋 Testing with status=PENDING filter...');
    const pendingResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios?status=PENDING', { headers });
    console.log('Pending studios:', {
      status: pendingResponse.status,
      total: pendingResponse.data?.total || 0,
      studios: pendingResponse.data?.data?.length || 0
    });
    
    // Step 3: Check if there are any studios in the database at all
    console.log('\n3️⃣ Checking public studios endpoint to see if any studios exist...');
    const publicStudiosResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/studios');
    console.log('Public studios:', {
      status: publicStudiosResponse.status,
      studios: publicStudiosResponse.data?.data?.length || 0
    });
    
    if (publicStudiosResponse.data?.data?.length > 0) {
      console.log('Sample public studio:', publicStudiosResponse.data.data[0]);
    }
    
    console.log('\n🎯 Summary:');
    console.log('- Admin studios (no filter):', noFiltersResponse.data?.data?.length || 0);
    console.log('- Admin studios (verified):', verifiedResponse.data?.data?.length || 0);
    console.log('- Admin studios (unverified):', unverifiedResponse.data?.data?.length || 0);
    console.log('- Admin studios (pending):', pendingResponse.data?.data?.length || 0);
    console.log('- Public studios:', publicStudiosResponse.data?.data?.length || 0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testAdminStudiosWithAuth(); 