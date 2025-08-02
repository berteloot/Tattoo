const axios = require('axios');

// Test profile saving with the validation fix
async function testProfileSaveFix() {
  console.log('🔍 TESTING PROFILE SAVE VALIDATION FIX\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // Login with stan account
    console.log('1. Logging in with stan@altilead.com...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'stan@altilead.com',
      password: '@222888'
    });
    
    console.log('✅ Login successful!');
    const token = loginResponse.data.data.token;
    
    // Test profile update with the same data that was failing
    console.log('\n2. Testing profile update with validation fix...');
    const updateData = {
      bio: 'i am the best dsaf',
      city: 'Montreal',
      specialtyIds: [],
      serviceIds: []
    };
    
    console.log('Update data:', updateData);
    
    const updateResponse = await axios.put(`${API_BASE_URL}/api/artists/cmdt3tutq00016mkf85lw12ar`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile update successful!');
    console.log('Update response:', updateResponse.data);
    
    console.log('\n🎉 PROFILE SAVING IS NOW WORKING!');
    console.log('The validation fix has been deployed successfully.');
    
  } catch (error) {
    console.log('❌ Profile update failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.status === 400) {
      console.log('\n🔍 Validation error details:');
      if (error.response.data.details) {
        error.response.data.details.forEach(detail => {
          console.log(`- ${detail.param}: ${detail.msg}`);
        });
      }
    }
  }
}

// Run the test
testProfileSaveFix().catch(console.error); 