const axios = require('axios');

async function testPublicStudios() {
  console.log('🔍 Testing public studios endpoint...\n');
  
  try {
    // Test 1: Basic public studios endpoint
    console.log('1️⃣ Testing basic public studios endpoint...');
    const basicResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/studios');
    console.log('Basic response:', {
      status: basicResponse.status,
      total: basicResponse.data?.data?.pagination?.total || 0,
      studios: basicResponse.data?.data?.studios?.length || 0,
      success: basicResponse.data?.success
    });
    
    if (basicResponse.data?.data?.studios?.length > 0) {
      console.log('Sample studio:', {
        id: basicResponse.data.data.studios[0].id,
        title: basicResponse.data.data.studios[0].title,
        isActive: basicResponse.data.data.studios[0].isActive,
        isVerified: basicResponse.data.data.studios[0].isVerified,
        isFeatured: basicResponse.data.data.studios[0].isFeatured
      });
    }
    
    // Test 2: With verified filter
    console.log('\n2️⃣ Testing with verified=true filter...');
    const verifiedResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/studios?verified=true');
    console.log('Verified studios:', {
      status: verifiedResponse.status,
      total: verifiedResponse.data?.data?.pagination?.total || 0,
      studios: verifiedResponse.data?.data?.studios?.length || 0
    });
    
    // Test 3: With featured filter
    console.log('\n3️⃣ Testing with featured=true filter...');
    const featuredResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/studios?featured=true');
    console.log('Featured studios:', {
      status: featuredResponse.status,
      total: featuredResponse.data?.data?.pagination?.total || 0,
      studios: featuredResponse.data?.data?.studios?.length || 0
    });
    
    // Test 4: With no filters (should show all active studios)
    console.log('\n4️⃣ Testing with no filters (all active studios)...');
    const allActiveResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/studios?limit=100');
    console.log('All active studios:', {
      status: allActiveResponse.status,
      total: allActiveResponse.data?.data?.pagination?.total || 0,
      studios: allActiveResponse.data?.data?.studios?.length || 0
    });
    
    // Test 5: Check studio status distribution
    console.log('\n5️⃣ Checking studio status distribution...');
    const studios = allActiveResponse.data?.data?.studios || [];
    const activeCount = studios.filter(s => s.isActive).length;
    const verifiedCount = studios.filter(s => s.isVerified).length;
    const featuredCount = studios.filter(s => s.isFeatured).length;
    
    console.log('Studio distribution:');
    console.log(`- Total returned: ${studios.length}`);
    console.log(`- Active: ${activeCount}`);
    console.log(`- Verified: ${verifiedCount}`);
    console.log(`- Featured: ${featuredCount}`);
    
    // Test 6: Check if there are inactive studios
    console.log('\n6️⃣ Checking for inactive studios...');
    const inactiveResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/studios?verified=&featured=');
    console.log('Inactive studios check:', {
      status: inactiveResponse.status,
      total: inactiveResponse.data?.data?.pagination?.total || 0,
      studios: inactiveResponse.data?.data?.studios?.length || 0
    });
    
    console.log('\n🎯 Summary:');
    console.log('- Public studios endpoint only shows ACTIVE studios by default');
    console.log('- If studios are not showing, they might be inactive (isActive: false)');
    console.log('- The endpoint applies isActive: true filter automatically');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testPublicStudios(); 