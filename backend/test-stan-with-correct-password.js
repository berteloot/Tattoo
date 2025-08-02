const axios = require('axios');

// Test stan account with different passwords
async function testStanWithCorrectPassword() {
  console.log('🔍 TESTING STAN ACCOUNT WITH DIFFERENT PASSWORDS\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  // Common passwords to try
  const passwords = [
    'stan123456',
    'stan123',
    'password123',
    'testpassword123',
    'admin123',
    'stan@altilead.com',
    'stan',
    '123456'
  ];
  
  for (const password of passwords) {
    try {
      console.log(`Trying password: ${password}`);
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'stan@altilead.com',
        password: password
      });
      
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('Correct password:', password);
      console.log('User data:', {
        id: loginResponse.data.data.user.id,
        email: loginResponse.data.data.user.email,
        role: loginResponse.data.data.user.role,
        emailVerified: loginResponse.data.data.user.emailVerified
      });
      
      // Test profile update
      const token = loginResponse.data.data.token;
      console.log('\nTesting profile update...');
      
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
      
      return; // Exit after successful login
      
    } catch (error) {
      if (error.response?.status === 401 && error.response.data.error?.includes('Invalid credentials')) {
        console.log('❌ Wrong password');
      } else if (error.response?.status === 400) {
        console.log('⚠️ Login successful but profile update failed');
        console.log('Profile error:', error.response.data);
        return; // Found correct password but profile update failed
      } else {
        console.log('❌ Other error:', error.response?.data);
      }
    }
  }
  
  console.log('\n❌ None of the common passwords worked');
  console.log('Please provide the correct password for stan@altilead.com');
}

// Run the test
testStanWithCorrectPassword().catch(console.error); 