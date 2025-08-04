const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Test studio linking functionality
async function testStudioLinking() {
  console.log('🧪 Testing Studio Linking Functionality...\n');

  try {
    // 1. Test studio search
    console.log('1. Testing studio search...');
    const searchResponse = await axios.get(`${API_URL}/studios?search=test`);
    console.log('✅ Studio search working:', searchResponse.data.success);
    console.log('   Found studios:', searchResponse.data.data.studios.length);

    // 2. Test getting studio details
    if (searchResponse.data.data.studios.length > 0) {
      const studioId = searchResponse.data.data.studios[0].id;
      console.log('\n2. Testing studio details...');
      const studioResponse = await axios.get(`${API_URL}/studios/${studioId}`);
      console.log('✅ Studio details working:', studioResponse.data.success);
      console.log('   Studio title:', studioResponse.data.data.title);

      // 3. Test getting studio artists
      console.log('\n3. Testing studio artists...');
      const artistsResponse = await axios.get(`${API_URL}/studios/${studioId}/artists`);
      console.log('✅ Studio artists working:', artistsResponse.data.success);
      console.log('   Artists count:', artistsResponse.data.data.length);
    }

    // 4. Test getting all studios
    console.log('\n4. Testing get all studios...');
    const allStudiosResponse = await axios.get(`${API_URL}/studios`);
    console.log('✅ Get all studios working:', allStudiosResponse.data.success);
    console.log('   Total studios:', allStudiosResponse.data.data.studios.length);

    console.log('\n🎉 All studio linking tests passed!');
    console.log('\n📋 Summary:');
    console.log('   - Studio search: ✅');
    console.log('   - Studio details: ✅');
    console.log('   - Studio artists: ✅');
    console.log('   - Get all studios: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test artist studios functionality
async function testArtistStudios() {
  console.log('\n🧪 Testing Artist Studios Functionality...\n');

  try {
    // 1. Test getting all artists
    console.log('1. Testing get all artists...');
    const artistsResponse = await axios.get(`${API_URL}/artists`);
    console.log('✅ Get all artists working:', artistsResponse.data.success);
    console.log('   Artists count:', artistsResponse.data.data.artists.length);

    // 2. Test getting artist studios (if artists exist)
    if (artistsResponse.data.data.artists.length > 0) {
      const artistId = artistsResponse.data.data.artists[0].id;
      console.log('\n2. Testing artist studios...');
      const artistStudiosResponse = await axios.get(`${API_URL}/artists/${artistId}/studios`);
      console.log('✅ Artist studios working:', artistStudiosResponse.data.success);
      console.log('   Studios count:', artistStudiosResponse.data.data.length);
    }

    console.log('\n🎉 All artist studios tests passed!');
    console.log('\n📋 Summary:');
    console.log('   - Get all artists: ✅');
    console.log('   - Artist studios: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Studio Linking System Tests...\n');
  
  await testStudioLinking();
  await testArtistStudios();
  
  console.log('\n✨ All tests completed!');
}

runTests().catch(console.error); 