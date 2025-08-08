const axios = require('axios');

// Debug script to check user status and artist profile
async function debugUserStatus() {
  console.log('🔍 Debugging User Status...');
  
  const baseURL = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    // Login with the user's credentials
    console.log('🔐 Logging in...');
    
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'stan@sharemymeals.org',
      password: 'your-password-here' // Replace with actual password
    });

    if (!loginResponse.data.success) {
      throw new Error('Login failed: ' + loginResponse.data.error);
    }

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('✅ Login successful');
    console.log('👤 User info:', {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      hasArtistProfile: !!user.artistProfile
    });

    if (user.artistProfile) {
      console.log('🎨 Artist Profile ID:', user.artistProfile.id);
      
      // Try to get the artist profile details
      console.log('📋 Fetching artist profile details...');
      
      const profileResponse = await axios.get(`${baseURL}/artists/${user.artistProfile.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.data.success) {
        console.log('✅ Artist profile fetched successfully');
        console.log('📊 Profile data:', {
          id: profileResponse.data.data.artist.id,
          bio: profileResponse.data.data.artist.bio?.substring(0, 50) + '...',
          studioName: profileResponse.data.data.artist.studioName,
          isVerified: profileResponse.data.data.artist.isVerified,
          verificationStatus: profileResponse.data.data.artist.verificationStatus
        });
      } else {
        console.log('❌ Failed to fetch artist profile:', profileResponse.data.error);
      }
    } else {
      console.log('❌ User does not have an artist profile');
    }

    // Test the profile picture upload endpoint authorization
    console.log('🔒 Testing profile picture upload authorization...');
    
    try {
      const testResponse = await axios.post(`${baseURL}/artists/profile-picture/upload`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Profile picture upload endpoint accessible');
    } catch (error) {
      console.log('❌ Profile picture upload authorization failed:', error.response?.status, error.response?.data?.error);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the debug
debugUserStatus();
