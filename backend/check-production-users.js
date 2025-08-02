const axios = require('axios');

// Check all users in production
async function checkProductionUsers() {
  console.log('🔍 CHECKING ALL USERS IN PRODUCTION\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // First, apply the emergency fix to see all users
    console.log('1. Applying emergency fix to see all users...');
    const fixResponse = await axios.post(`${API_BASE_URL}/api/emergency/fix-verification`);
    
    console.log('✅ Emergency fix applied');
    console.log('Users fixed:', fixResponse.data.data.usersFixed);
    
    // Show all users
    console.log('\n📋 All users in production:');
    fixResponse.data.data.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.role}`);
    });
    
    // Check if stan@altilead.com exists
    const stanUser = fixResponse.data.data.users.find(user => user.email === 'stan@altilead.com');
    
    if (stanUser) {
      console.log('\n✅ stan@altilead.com found in production!');
      console.log('User ID:', stanUser.id);
      console.log('Role:', stanUser.role);
    } else {
      console.log('\n❌ stan@altilead.com NOT found in production');
      console.log('The account might not exist in the production database');
    }
    
    // Check for berteloot@gmail.com as well
    const bertelootUser = fixResponse.data.data.users.find(user => user.email === 'berteloot@gmail.com');
    
    if (bertelootUser) {
      console.log('\n✅ berteloot@gmail.com found in production!');
      console.log('User ID:', bertelootUser.id);
      console.log('Role:', bertelootUser.role);
    } else {
      console.log('\n❌ berteloot@gmail.com NOT found in production');
    }
    
  } catch (error) {
    console.log('❌ Error checking production users:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
}

// Run the check
checkProductionUsers().catch(console.error); 