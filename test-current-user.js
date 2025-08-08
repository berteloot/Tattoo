const axios = require('axios');

// Test current user authentication and role
async function testCurrentUser() {
  console.log('🔍 Testing Current User Authentication...');
  
  const baseURL = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    // First, let's check if we can access the current user endpoint
    console.log('👤 Testing current user endpoint...');
    
    // This will fail without auth, but let's see the error
    try {
      const userResponse = await axios.get(`${baseURL}/auth/me`);
      console.log('✅ Current user endpoint accessible');
      console.log('👤 User data:', userResponse.data);
    } catch (error) {
      console.log('❌ Current user endpoint requires auth:', error.response?.status, error.response?.data?.error);
    }

    // Let's also test the artists endpoint to see what data we get
    console.log('🎨 Testing artists endpoint...');
    
    const artistsResponse = await axios.get(`${baseURL}/artists?limit=1`);
    
    if (artistsResponse.data.success) {
      console.log('✅ Artists endpoint working');
      if (artistsResponse.data.data.artists.length > 0) {
        const artist = artistsResponse.data.data.artists[0];
        console.log('🎨 Sample artist data:', {
          id: artist.id,
          studioName: artist.studioName,
          isVerified: artist.isVerified,
          verificationStatus: artist.verificationStatus,
          hasUser: !!artist.user,
          userRole: artist.user?.role
        });
      }
    }

    // Let's check if there are any users in the system
    console.log('👥 Testing admin endpoint to check users...');
    
    try {
      const adminResponse = await axios.get(`${baseURL}/admin/users?limit=1`);
      if (adminResponse.data.success) {
        console.log('✅ Admin endpoint accessible');
        console.log('📊 Users count:', adminResponse.data.data.pagination.total);
        if (adminResponse.data.data.users.length > 0) {
          const user = adminResponse.data.data.users[0];
          console.log('👤 Sample user data:', {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            hasArtistProfile: !!user.artistProfile
          });
        }
      }
    } catch (error) {
      console.log('❌ Admin endpoint requires auth:', error.response?.status, error.response?.data?.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the test
testCurrentUser();
