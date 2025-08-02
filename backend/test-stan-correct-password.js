const axios = require('axios');

// Test stan account with correct password
async function testStanCorrectPassword() {
  console.log('🔍 TESTING STAN ACCOUNT WITH CORRECT PASSWORD\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // Test login with correct password
    console.log('1. Testing login with correct password...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'stan@altilead.com',
      password: '@222888'
    });
    
    console.log('✅ LOGIN SUCCESSFUL!');
    console.log('User data:', {
      id: loginResponse.data.data.user.id,
      email: loginResponse.data.data.user.email,
      role: loginResponse.data.data.user.role,
      emailVerified: loginResponse.data.data.user.emailVerified
    });
    
    const token = loginResponse.data.data.token;
    
    // Test profile update to see if the validation fix is working
    console.log('\n2. Testing profile update...');
    const updateData = {
      bio: 'Test bio update - validation fix test',
      city: 'Montreal',
      specialtyIds: [],
      serviceIds: []
    };
    
    const updateResponse = await axios.put(`${API_BASE_URL}/api/artists/cmdt3tutq00016mkf85lw12ar`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile update successful!');
    console.log('Update response:', updateResponse.data);
    
    console.log('\n🎉 STAN ACCOUNT IS FULLY WORKING!');
    console.log('Email: stan@altilead.com');
    console.log('Password: @222888');
    console.log('Profile saving should now work properly!');
    
  } catch (error) {
    console.log('❌ Test failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.status === 400) {
      console.log('\n🔍 Profile update failed - checking validation details...');
      console.log('This will help us identify what validation is still failing');
    }
  }
}

// Run the test
testStanCorrectPassword().catch(console.error); 