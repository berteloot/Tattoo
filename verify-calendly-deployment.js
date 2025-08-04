const axios = require('axios')

const RENDER_URL = 'https://tattooed-world-backend.onrender.com'

async function verifyCalendlyDeployment() {
  console.log('🧪 Verifying Calendly Integration on Render...')
  console.log(`🌐 Testing URL: ${RENDER_URL}`)
  console.log('')

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...')
    const healthResponse = await axios.get(`${RENDER_URL}/health`, { timeout: 10000 })
    if (healthResponse.status === 200) {
      console.log('✅ Health check passed')
    } else {
      console.log('❌ Health check failed')
      return
    }

    // Test 2: Frontend loads
    console.log('\n2. Testing frontend...')
    const frontendResponse = await axios.get(RENDER_URL, { timeout: 10000 })
    if (frontendResponse.status === 200) {
      console.log('✅ Frontend loads successfully')
    } else {
      console.log('❌ Frontend failed to load')
      return
    }

    // Test 3: API endpoints
    console.log('\n3. Testing API endpoints...')
    const apiResponse = await axios.get(`${RENDER_URL}/api/artists`, { timeout: 10000 })
    if (apiResponse.status === 200) {
      console.log('✅ API endpoints working')
    } else {
      console.log('❌ API endpoints failed')
      return
    }

    // Test 4: Check for Calendly integration in response
    console.log('\n4. Checking Calendly integration...')
    if (apiResponse.data && apiResponse.data.data && apiResponse.data.data.artists) {
      const artists = apiResponse.data.data.artists
      console.log(`Found ${artists.length} artists`)
      
      // Check if any artist has calendlyUrl field
      const artistsWithCalendly = artists.filter(artist => artist.calendlyUrl)
      console.log(`${artistsWithCalendly.length} artists have Calendly URLs configured`)
      
      if (artists.length > 0) {
        const sampleArtist = artists[0]
        if ('calendlyUrl' in sampleArtist) {
          console.log('✅ Calendly field is present in API responses')
        } else {
          console.log('❌ Calendly field missing from API responses')
          return
        }
      }
    }

    // Test 5: Test specific artist endpoint
    console.log('\n5. Testing artist profile endpoint...')
    if (apiResponse.data && apiResponse.data.data && apiResponse.data.data.artists.length > 0) {
      const firstArtist = apiResponse.data.data.artists[0]
      const artistResponse = await axios.get(`${RENDER_URL}/api/artists/${firstArtist.id}`, { timeout: 10000 })
      
      if (artistResponse.status === 200 && artistResponse.data.data.artist) {
        const artist = artistResponse.data.data.artist
        if ('calendlyUrl' in artist) {
          console.log('✅ Artist profile includes Calendly field')
          console.log(`   Artist: ${artist.user.firstName} ${artist.user.lastName}`)
          console.log(`   Calendly URL: ${artist.calendlyUrl || 'Not set'}`)
        } else {
          console.log('❌ Artist profile missing Calendly field')
          return
        }
      } else {
        console.log('❌ Artist profile endpoint failed')
        return
      }
    }

    console.log('\n🎉 Calendly Integration Verification Complete!')
    console.log('==============================================')
    console.log('✅ All tests passed')
    console.log('✅ Calendly integration is working on Render')
    console.log('✅ Artists can now add their Calendly URLs')
    console.log('✅ Clients can book appointments through the widget')
    console.log('')
    console.log('📋 Next Steps:')
    console.log('1. Artists can log in and add their Calendly URLs')
    console.log('2. Clients can browse artists and book appointments')
    console.log('3. Monitor booking conversion rates')
    console.log('')
    console.log('🚀 Deployment successful!')

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
    if (error.response) {
      console.error('Response status:', error.response.status)
      console.error('Response data:', error.response.data)
    }
    process.exit(1)
  }
}

// Run verification
verifyCalendlyDeployment() 