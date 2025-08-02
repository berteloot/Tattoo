const axios = require('axios');

// Test if the profile validation fix is working
async function testProfileValidationFix() {
  console.log('🔍 TESTING PROFILE VALIDATION FIX\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // First, login as admin to test the fix
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'admin@tattoolocator.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin login successful');
    
    // Get admin's artist profile (if exists)
    console.log('\n2. Getting admin profile...');
    const profileResponse = await axios.get(`${API_BASE_URL}/api/artists`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Profile access successful');
    
    // Test profile update with the same data that was failing
    console.log('\n3. Testing profile update with validation fix...');
    const updateData = {
      bio: 'i am the best dsaf',
      city: 'Montreal',
      specialtyIds: [],
      serviceIds: [],
      website: '', // Empty string that was causing validation issues
      calendlyUrl: '' // Empty string that was causing validation issues
    };
    
    // Try to update a profile (this will test the validation)
    const updateResponse = await axios.put(`${API_BASE_URL}/api/artists/cmdt3tutq00016mkf85lw12ar`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Profile update successful!');
    console.log('Update response:', updateResponse.data);
    console.log('\n🎉 VALIDATION FIX IS WORKING!');
    
  } catch (error) {
    console.log('❌ Test failed:');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data);
    
    if (error.response?.status === 400) {
      console.log('\n🔍 VALIDATION ERROR DETAILS:');
      console.log('This means the validation fix has not been deployed yet');
      console.log('The website and calendlyUrl validation is still too strict');
    }
  }
}

// Run the test
testProfileValidationFix().catch(console.error); 