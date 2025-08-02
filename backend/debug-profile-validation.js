const axios = require('axios');

// Debug profile validation error
async function debugProfileValidation() {
  console.log('🔍 DEBUGGING PROFILE VALIDATION ERROR\n');
  
  const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';
  
  try {
    // Login with stan account
    console.log('1. Logging in with stan@altilead.com...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'stan@altilead.com',
      password: 'stan123456'
    });
    
    console.log('✅ Login successful!');
    const token = loginResponse.data.data.token;
    
    // Test profile update with minimal data to isolate the issue
    console.log('\n2. Testing profile update with minimal data...');
    const updateData = {
      bio: 'Test bio',
      city: 'Montreal'
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
      
      // Try to identify which field is causing the issue
      console.log('\n🔍 Testing individual fields...');
      
      const fields = ['bio', 'city', 'website', 'calendlyUrl', 'instagram', 'address'];
      
      for (const field of fields) {
        try {
          const testData = { [field]: 'test' };
          console.log(`Testing field: ${field}`);
          
          const testResponse = await axios.put(`${API_BASE_URL}/api/artists/cmdt3tutq00016mkf85lw12ar`, testData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`✅ ${field} field works`);
          
        } catch (fieldError) {
          console.log(`❌ ${field} field fails:`, fieldError.response?.data);
        }
      }
    }
  }
}

// Run the debug
debugProfileValidation().catch(console.error); 