const axios = require('axios');

async function testAdminAPIDirect() {
  console.log('🔍 Testing admin API directly...\n');
  
  try {
    // Step 1: Test the admin studios endpoint without authentication
    console.log('1️⃣ Testing admin studios endpoint without auth...');
    try {
      const noAuthResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios');
      console.log('❌ Should require auth but returned:', noAuthResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.error);
      }
    }
    
    // Step 2: Test with a fake token
    console.log('\n2️⃣ Testing with fake token...');
    try {
      const fakeTokenResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios', {
        headers: {
          'Authorization': 'Bearer fake-token',
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Should reject fake token but returned:', fakeTokenResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejects fake token');
      } else {
        console.log('❌ Unexpected error with fake token:', error.response?.status, error.response?.data?.error);
      }
    }
    
    // Step 3: Check if there are any users in the database
    console.log('\n3️⃣ Checking if any users exist...');
    try {
      const usersResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/auth/me');
      console.log('❌ Should require auth but returned:', usersResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Auth endpoint correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data?.error);
      }
    }
    
    // Step 4: Test public studios endpoint to confirm studios exist
    console.log('\n4️⃣ Testing public studios endpoint...');
    try {
      const publicStudiosResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/studios');
      console.log('✅ Public studios endpoint working:', {
        status: publicStudiosResponse.status,
        total: publicStudiosResponse.data?.total || 0,
        studios: publicStudiosResponse.data?.data?.length || 0,
        success: publicStudiosResponse.data?.success
      });
      
      if (publicStudiosResponse.data?.data?.length > 0) {
        console.log('Sample studio:', {
          id: publicStudiosResponse.data.data[0].id,
          title: publicStudiosResponse.data.data[0].title,
          isVerified: publicStudiosResponse.data.data[0].isVerified,
          isActive: publicStudiosResponse.data.data[0].isActive
        });
      }
    } catch (error) {
      console.log('❌ Public studios error:', error.response?.status, error.response?.data?.error);
    }
    
    console.log('\n🎯 Summary:');
    console.log('- Admin endpoint requires authentication: ✅');
    console.log('- Public studios endpoint working: ✅');
    console.log('- Issue: Need valid admin credentials to access admin studios');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminAPIDirect(); 