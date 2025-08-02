const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testPageViewTracking() {
  try {
    console.log('🧪 Testing Page View Tracking...\n');

    // Step 1: Get a list of artists to find an ID to test with
    console.log('1. Fetching artists list...');
    const artistsResponse = await axios.get(`${API_BASE_URL}/api/artists?limit=1`);
    
    if (!artistsResponse.data.success || !artistsResponse.data.data.artists.length) {
      console.log('❌ No artists found to test with');
      return;
    }

    const artistId = artistsResponse.data.data.artists[0].id;
    const artistName = `${artistsResponse.data.data.artists[0].user.firstName} ${artistsResponse.data.data.artists[0].user.lastName}`;
    
    console.log(`✅ Found artist: ${artistName} (ID: ${artistId})`);
    console.log(`   Current profile views: ${artistsResponse.data.data.artists[0].profileViews || 0}\n`);

    // Step 2: Track a page view
    console.log('2. Tracking page view...');
    const viewResponse = await axios.post(`${API_BASE_URL}/api/artists/${artistId}/view`);
    
    if (viewResponse.data.success) {
      console.log(`✅ Page view tracked successfully!`);
      console.log(`   New profile views: ${viewResponse.data.data.profileViews}`);
      console.log(`   Last viewed at: ${viewResponse.data.data.lastViewedAt}\n`);
    } else {
      console.log('❌ Failed to track page view:', viewResponse.data.error);
      return;
    }

    // Step 3: Verify the view count increased
    console.log('3. Verifying view count increase...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/api/artists/${artistId}`);
    
    if (verifyResponse.data.success) {
      const updatedViews = verifyResponse.data.data.artist.profileViews;
      console.log(`✅ Verification successful!`);
      console.log(`   Updated profile views: ${updatedViews}`);
      console.log(`   Last viewed at: ${verifyResponse.data.data.artist.lastViewedAt}\n`);
    } else {
      console.log('❌ Failed to verify view count:', verifyResponse.data.error);
    }

    // Step 4: Test multiple views
    console.log('4. Testing multiple page views...');
    for (let i = 1; i <= 3; i++) {
      await axios.post(`${API_BASE_URL}/api/artists/${artistId}/view`);
      console.log(`   View ${i} tracked`);
    }

    // Step 5: Final verification
    console.log('\n5. Final verification...');
    const finalResponse = await axios.get(`${API_BASE_URL}/api/artists/${artistId}`);
    
    if (finalResponse.data.success) {
      const finalViews = finalResponse.data.data.artist.profileViews;
      console.log(`✅ Final profile views: ${finalViews}`);
      console.log(`✅ Last viewed at: ${finalResponse.data.data.artist.lastViewedAt}`);
    }

    console.log('\n🎉 Page view tracking test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPageViewTracking(); 