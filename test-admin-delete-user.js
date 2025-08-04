const axios = require('axios');

// Test configuration
const API_BASE = 'https://tattooed-world-backend.onrender.com/api';
const ADMIN_EMAIL = 'berteloot@gmail.com';
const ADMIN_PASSWORD = 'admin123';

console.log('🧪 Testing Admin Delete User Functionality...\n');

async function testAdminDeleteUser() {
  try {
    // Step 1: Login as admin
    console.log('Step 1: Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (!loginResponse.data.success) {
      throw new Error('Admin login failed: ' + loginResponse.data.error);
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');

    // Set up axios with auth header
    const api = axios.create({
      baseURL: API_BASE,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Step 2: Get all users to find a test user
    console.log('\nStep 2: Getting users list...');
    const usersResponse = await api.get('/admin/users?limit=10');
    
    if (!usersResponse.data.success) {
      throw new Error('Failed to get users: ' + usersResponse.data.error);
    }

    const users = usersResponse.data.data.users;
    console.log(`✅ Found ${users.length} users`);

    // Find a non-admin user to test with
    const testUser = users.find(user => 
      user.role !== 'ADMIN' && 
      user.isActive && 
      user.email !== ADMIN_EMAIL
    );

    if (!testUser) {
      console.log('⚠️  No suitable test user found (all users are admins or inactive)');
      console.log('Available users:');
      users.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role} - Active: ${user.isActive}`);
      });
      return;
    }

    console.log(`✅ Found test user: ${testUser.firstName} ${testUser.lastName} (${testUser.email})`);

    // Step 3: Test delete user (soft delete)
    console.log('\nStep 3: Testing user deletion...');
    const deleteData = {
      reason: 'Test deletion by admin - automated test'
    };

    console.log('Sending delete request...');
    const deleteResponse = await api.delete(`/admin/users/${testUser.id}`, {
      data: deleteData
    });

    if (deleteResponse.data.success) {
      console.log('✅ User deletion successful!');
      console.log('Response:', deleteResponse.data);
    } else {
      console.log('❌ User deletion failed');
      console.log('Response:', deleteResponse.data);
    }

    // Step 4: Verify user is now inactive
    console.log('\nStep 4: Verifying user is now inactive...');
    const verifyResponse = await api.get(`/admin/users/${testUser.id}`);
    
    if (verifyResponse.data.success) {
      const updatedUser = verifyResponse.data.data.user;
      console.log(`✅ User verification successful`);
      console.log(`User active status: ${updatedUser.isActive}`);
      
      if (!updatedUser.isActive) {
        console.log('✅ User successfully deactivated!');
      } else {
        console.log('❌ User is still active - deletion may have failed');
      }
    } else {
      console.log('❌ Failed to verify user status');
      console.log('Response:', verifyResponse.data);
    }

    // Step 5: Test restore user
    console.log('\nStep 5: Testing user restoration...');
    const restoreResponse = await api.post(`/admin/users/${testUser.id}/restore`);

    if (restoreResponse.data.success) {
      console.log('✅ User restoration successful!');
      console.log('Response:', restoreResponse.data);
    } else {
      console.log('❌ User restoration failed');
      console.log('Response:', restoreResponse.data);
    }

    // Step 6: Verify user is active again
    console.log('\nStep 6: Verifying user is active again...');
    const finalVerifyResponse = await api.get(`/admin/users/${testUser.id}`);
    
    if (finalVerifyResponse.data.success) {
      const finalUser = finalVerifyResponse.data.data.user;
      console.log(`✅ Final verification successful`);
      console.log(`User active status: ${finalUser.isActive}`);
      
      if (finalUser.isActive) {
        console.log('✅ User successfully restored and active!');
      } else {
        console.log('❌ User is still inactive - restoration may have failed');
      }
    } else {
      console.log('❌ Failed to verify final user status');
      console.log('Response:', finalVerifyResponse.data);
    }

    console.log('\n🎉 Admin delete/restore user test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testAdminDeleteUser(); 