const axios = require('axios');

async function testAdminFiltering() {
  console.log('🔍 Testing admin studios filtering...\n');
  
  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/auth/login', {
      email: 'admin@tattoolocator.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed');
      return;
    }
    
    const token = loginResponse.data.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('✅ Login successful');
    
    // Step 2: Test different filter combinations
    console.log('\n2️⃣ Testing different filter combinations...');
    
    const testCases = [
      { name: 'No filters', url: '/api/admin/studios' },
      { name: 'All studios', url: '/api/admin/studios?verified=&featured=&status=' },
      { name: 'Verified only', url: '/api/admin/studios?verified=true' },
      { name: 'Unverified only', url: '/api/admin/studios?verified=false' },
      { name: 'Featured only', url: '/api/admin/studios?featured=true' },
      { name: 'Non-featured only', url: '/api/admin/studios?featured=false' },
      { name: 'Pending status', url: '/api/admin/studios?status=PENDING' },
      { name: 'Approved status', url: '/api/admin/studios?status=APPROVED' },
      { name: 'Rejected status', url: '/api/admin/studios?status=REJECTED' },
      { name: 'Verified + Featured', url: '/api/admin/studios?verified=true&featured=true' },
      { name: 'Verified + Non-featured', url: '/api/admin/studios?verified=true&featured=false' },
      { name: 'Unverified + Featured', url: '/api/admin/studios?verified=false&featured=true' },
      { name: 'Unverified + Non-featured', url: '/api/admin/studios?verified=false&featured=false' }
    ];
    
    for (const testCase of testCases) {
      try {
        const response = await axios.get(`https://tattooed-world-backend.onrender.com${testCase.url}`, { headers });
        
        console.log(`${testCase.name}: ${response.data?.data?.studios?.length || 0} studios`);
        
        if (response.data?.data?.studios?.length > 0) {
          const sampleStudio = response.data.data.studios[0];
          console.log(`  Sample: ${sampleStudio.title} (Verified: ${sampleStudio.isVerified}, Featured: ${sampleStudio.isFeatured}, Status: ${sampleStudio.verificationStatus})`);
        }
      } catch (error) {
        console.log(`${testCase.name}: Error - ${error.response?.status} ${error.response?.data?.error}`);
      }
    }
    
    // Step 3: Check what the frontend is actually requesting
    console.log('\n3️⃣ Testing frontend-style requests...');
    
    const frontendRequests = [
      { name: 'Default admin page', url: '/api/admin/studios?page=1&limit=20&search=&verified=&featured=&status=' },
      { name: 'With verified filter', url: '/api/admin/studios?page=1&limit=20&search=&verified=true&featured=&status=' },
      { name: 'With featured filter', url: '/api/admin/studios?page=1&limit=20&search=&verified=&featured=true&status=' },
      { name: 'With status filter', url: '/api/admin/studios?page=1&limit=20&search=&verified=&featured=&status=APPROVED' }
    ];
    
    for (const request of frontendRequests) {
      try {
        const response = await axios.get(`https://tattooed-world-backend.onrender.com${request.url}`, { headers });
        
        console.log(`${request.name}: ${response.data?.data?.studios?.length || 0} studios (Total: ${response.data?.data?.pagination?.total || 0})`);
        
        if (response.data?.data?.studios?.length > 0) {
          const sampleStudio = response.data.data.studios[0];
          console.log(`  Sample: ${sampleStudio.title} (Verified: ${sampleStudio.isVerified}, Featured: ${sampleStudio.isFeatured}, Status: ${sampleStudio.verificationStatus})`);
        }
      } catch (error) {
        console.log(`${request.name}: Error - ${error.response?.status} ${error.response?.data?.error}`);
      }
    }
    
    // Step 4: Check studio status distribution
    console.log('\n4️⃣ Checking studio status distribution...');
    
    const statusChecks = [
      { name: 'All studios', url: '/api/admin/studios?limit=100' },
      { name: 'Verified studios', url: '/api/admin/studios?verified=true&limit=100' },
      { name: 'Unverified studios', url: '/api/admin/studios?verified=false&limit=100' },
      { name: 'Featured studios', url: '/api/admin/studios?featured=true&limit=100' },
      { name: 'Non-featured studios', url: '/api/admin/studios?featured=false&limit=100' }
    ];
    
    for (const check of statusChecks) {
      try {
        const response = await axios.get(`https://tattooed-world-backend.onrender.com${check.url}`, { headers });
        
        const studios = response.data?.data?.studios || [];
        const verifiedCount = studios.filter(s => s.isVerified).length;
        const featuredCount = studios.filter(s => s.isFeatured).length;
        const pendingCount = studios.filter(s => s.verificationStatus === 'PENDING').length;
        const approvedCount = studios.filter(s => s.verificationStatus === 'APPROVED').length;
        
        console.log(`${check.name}: ${studios.length} total`);
        console.log(`  Verified: ${verifiedCount}, Featured: ${featuredCount}`);
        console.log(`  Pending: ${pendingCount}, Approved: ${approvedCount}`);
      } catch (error) {
        console.log(`${check.name}: Error - ${error.response?.status} ${error.response?.data?.error}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminFiltering(); 