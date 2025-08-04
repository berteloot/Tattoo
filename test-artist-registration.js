const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testArtistRegistration() {
  console.log('🧪 Testing Artist Registration...\n');

  try {
    // Test data for artist registration using a unique email
    const artistData = {
      firstName: 'Test',
      lastName: 'Artist',
      email: `test-artist-${Date.now()}@example.com`, // Unique email
      password: 'password123',
      role: 'ARTIST'
    };

    console.log('📝 Registration Data:', {
      ...artistData,
      password: '[HIDDEN]'
    });

    // Test registration
    console.log('\n🔄 Attempting registration...');
    const registrationResponse = await axios.post(`${API_BASE_URL}/auth/register`, artistData);
    
    console.log('✅ Registration Response:', {
      status: registrationResponse.status,
      success: registrationResponse.data.success,
      message: registrationResponse.data.message,
      requiresEmailVerification: registrationResponse.data.data?.requiresEmailVerification
    });

    if (registrationResponse.data.success) {
      console.log('✅ Registration successful!');
      
      // Since this is a new email, we need to handle email verification
      if (registrationResponse.data.data?.requiresEmailVerification) {
        console.log('📧 Email verification required. Testing with a test email that bypasses verification...');
        
        // Test with a known test email that bypasses verification
        const testArtistData = {
          firstName: 'Test',
          lastName: 'Artist',
          email: 'pending@example.com', // This email bypasses verification
          password: 'password123',
          role: 'ARTIST'
        };

        console.log('\n🔄 Testing registration with test email...');
        const testRegistrationResponse = await axios.post(`${API_BASE_URL}/auth/register`, testArtistData);
        
        if (testRegistrationResponse.data.success) {
          console.log('✅ Test registration successful!');
          
          // Test login
          console.log('\n🔄 Testing login with test account...');
          const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: testArtistData.email,
            password: testArtistData.password
          });

          if (loginResponse.data.success) {
            const token = loginResponse.data.data.token;
            console.log('✅ Login successful! Token received.');

            // Test creating artist profile
            console.log('\n🔄 Testing artist profile creation...');
            const profileData = {
              studioName: 'Test Studio',
              bio: 'Test artist bio',
              specialties: ['Traditional', 'Japanese'],
              services: ['Custom Design', 'Cover-up'],
              location: {
                latitude: 40.7128,
                longitude: -74.0060,
                address: 'New York, NY'
              }
            };

            const profileResponse = await axios.post(`${API_BASE_URL}/artists`, profileData, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            console.log('✅ Profile Creation Response:', {
              status: profileResponse.status,
              success: profileResponse.data.success,
              message: profileResponse.data.message
            });

            if (profileResponse.data.success) {
              console.log('✅ Artist profile created successfully!');
              console.log('🎉 Complete artist registration flow is working!');
            } else {
              console.log('❌ Artist profile creation failed:', profileResponse.data.error);
            }
          } else {
            console.log('❌ Login failed:', loginResponse.data.error);
          }
        } else {
          console.log('❌ Test registration failed:', testRegistrationResponse.data.error);
        }
      }
    } else {
      console.log('❌ Registration failed:', registrationResponse.data.error);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}

// Run the test
testArtistRegistration(); 