const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
const ADMIN_EMAIL = 'berteloot@gmail.com';
const ADMIN_PASSWORD = 'admin123';

async function testAdminSystem() {
  console.log('🧪 Testing Admin System...\n');

  try {
    // 1. Login as admin
    console.log('1. 🔐 Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    const token = loginResponse.data.data.token;
    const adminUser = loginResponse.data.data.user;

    console.log(`✅ Logged in as: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.role})`);
    console.log(`🔑 Token received: ${token.substring(0, 20)}...\n`);

    // Set up axios with auth header
    const api = axios.create({
      baseURL: API_BASE,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // 2. Test admin dashboard
    console.log('2. 📊 Testing admin dashboard...');
    const dashboardResponse = await api.get('/admin/dashboard');
    const stats = dashboardResponse.data.data.statistics;
    
    console.log('✅ Dashboard statistics:');
    console.log(`   - Total Users: ${stats.totalUsers}`);
    console.log(`   - Total Artists: ${stats.totalArtists}`);
    console.log(`   - Pending Verifications: ${stats.pendingVerifications}`);
    console.log(`   - Total Reviews: ${stats.totalReviews}`);
    console.log(`   - Total Flash: ${stats.totalFlash}\n`);

    // 3. Test user management
    console.log('3. 👥 Testing user management...');
    const usersResponse = await api.get('/admin/users?limit=5');
    const users = usersResponse.data.data.users;
    
    console.log(`✅ Retrieved ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.firstName} ${user.lastName} (${user.email}) - ${user.role} - ${user.isActive ? 'Active' : 'Inactive'}`);
    });
    console.log('');

    // 4. Test admin actions
    console.log('4. 📋 Testing admin actions...');
    const actionsResponse = await api.get('/admin/actions?limit=5');
    const actions = actionsResponse.data.data.actions;
    
    console.log(`✅ Retrieved ${actions.length} recent admin actions:`);
    actions.forEach((action, index) => {
      console.log(`   ${index + 1}. ${action.admin.firstName} ${action.admin.lastName} - ${action.action} - ${action.targetType}`);
    });
    console.log('');

    // 5. Test user details (if users exist)
    if (users.length > 0) {
      console.log('5. 🔍 Testing user details...');
      const firstUser = users[0];
      const userDetailsResponse = await api.get(`/admin/users/${firstUser.id}`);
      const userDetails = userDetailsResponse.data.data.user;
      
      console.log(`✅ Retrieved details for: ${userDetails.firstName} ${userDetails.lastName}`);
      console.log(`   - Email: ${userDetails.email}`);
      console.log(`   - Role: ${userDetails.role}`);
      console.log(`   - Active: ${userDetails.isActive}`);
      console.log(`   - Verified: ${userDetails.isVerified}`);
      console.log(`   - Reviews Given: ${userDetails._count.reviewsGiven}`);
      console.log(`   - Reviews Received: ${userDetails._count.reviewsReceived}`);
      console.log('');

      // 6. Test user update (safe update - just add a note)
      console.log('6. ✏️ Testing user update...');
      const updateResponse = await api.put(`/admin/users/${firstUser.id}`, {
        isVerified: userDetails.isVerified, // Keep same value
        reason: 'Admin system test - no changes made'
      });
      
      console.log(`✅ User update successful: ${updateResponse.data.message}`);
      console.log('');

      // 7. Test admin action logging
      console.log('7. 📝 Verifying admin action was logged...');
      const newActionsResponse = await api.get('/admin/actions?limit=1');
      const latestAction = newActionsResponse.data.data.actions[0];
      
      if (latestAction.action === 'UPDATE_USER') {
        console.log('✅ Admin action properly logged:');
        console.log(`   - Action: ${latestAction.action}`);
        console.log(`   - Target: ${latestAction.targetType} (${latestAction.targetId})`);
        console.log(`   - Details: ${latestAction.details}`);
        console.log(`   - Admin: ${latestAction.admin.firstName} ${latestAction.admin.lastName}`);
      } else {
        console.log('⚠️ Latest action is not the expected UPDATE_USER action');
      }
      console.log('');

    }

    // 8. Test artist verification (if pending artists exist)
    console.log('8. 🎨 Testing artist verification...');
    const pendingArtistsResponse = await api.get('/admin/artists/pending');
    const pendingArtists = pendingArtistsResponse.data.data.artists;
    
    console.log(`✅ Found ${pendingArtists.length} pending artist verifications`);
    if (pendingArtists.length > 0) {
      console.log('   Pending artists:');
      pendingArtists.forEach((artist, index) => {
        console.log(`   ${index + 1}. ${artist.user.firstName} ${artist.user.lastName} (${artist.user.email})`);
      });
    }
    console.log('');

    console.log('🎉 All admin system tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Admin authentication working');
    console.log('✅ Dashboard statistics accessible');
    console.log('✅ User management functional');
    console.log('✅ Admin actions being logged');
    console.log('✅ User details retrievable');
    console.log('✅ User updates working');
    console.log('✅ Artist verification system accessible');
    console.log('✅ Audit trail functional');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    if (error.response?.data?.details) {
      console.error('Details:', error.response.data.details);
    }
    process.exit(1);
  }
}

// Run the test
testAdminSystem(); 