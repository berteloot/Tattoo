const axios = require('axios');

// Test stan@altilead.com account access
async function testStanAccount() {
  console.log('🔍 TESTING STAN ACCOUNT ACCESS\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // Test stan account login
    console.log('1. Testing stan@altilead.com login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'stan@altilead.com',
      password: 'testpassword123'
    });
    
    console.log('✅ Stan account login successful!');
    console.log('User data:', {
      id: loginResponse.data.data.user.id,
      email: loginResponse.data.data.user.email,
      role: loginResponse.data.data.user.role,
      emailVerified: loginResponse.data.data.user.emailVerified
    });
    
    const token = loginResponse.data.data.token;
    
    // Test getting stan's artist profile
    console.log('\n2. Testing artist profile access...');
    const profileResponse = await axios.get(`${API_BASE_URL}/api/artists`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Artist profile access successful!');
    
    // Test profile update
    console.log('\n3. Testing profile update...');
    const updateData = {
      bio: 'Test bio update',
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
    
  } catch (error) {
    console.log('❌ Test failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.status === 400 && error.response.data.error?.includes('Invalid credentials')) {
      console.log('\n⚠️ Account exists but password is wrong');
      console.log('Try using the password you were using before');
    } else if (error.response?.status === 400 && error.response.data.error?.includes('verify your email')) {
      console.log('\n❌ Account still needs email verification');
    }
  }
}

// Run the test
testStanAccount().catch(console.error); 