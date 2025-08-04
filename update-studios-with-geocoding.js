const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function updateStudiosWithGeocoding() {
  try {
    console.log('🔧 UPDATING STUDIOS WITH GEOCODING\n');
    
    // First, get all studios
    console.log('1. Fetching all studios...');
    const studiosResponse = await axios.get(`${API_BASE_URL}/api/studios?limit=100`);
    
    if (!studiosResponse.data.success) {
      throw new Error('Failed to fetch studios');
    }
    
    const studios = studiosResponse.data.data.studios;
    console.log(`📊 Found ${studios.length} studios`);
    
    // Filter studios without coordinates
    const studiosWithoutCoords = studios.filter(studio => 
      !studio.latitude || !studio.longitude
    );
    
    console.log(`📍 Found ${studiosWithoutCoords.length} studios without coordinates`);
    
    if (studiosWithoutCoords.length === 0) {
      console.log('✅ All studios already have coordinates!');
      return;
    }
    
    // Build addresses for geocoding
    const addresses = studiosWithoutCoords.map(studio => {
      const addressParts = [
        studio.address,
        studio.city,
        studio.state,
        studio.zipCode
      ].filter(Boolean)
      return addressParts.join(', ')
    }).filter(Boolean)
    
    console.log(`🌍 Geocoding ${addresses.length} addresses...`);
    
    // Geocode addresses in batches
    const batchSize = 5
    let updatedCount = 0
    
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize)
      
      try {
        console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(addresses.length/batchSize)}...`)
        
        const geocodeResponse = await axios.post(`${API_BASE_URL}/api/geocoding/batch-geocode`, {
          addresses: batch
        })
        
        if (geocodeResponse.data.success) {
          const geocodeResults = geocodeResponse.data.results
          
          // Update each studio with coordinates
          for (let j = 0; j < batch.length; j++) {
            const address = batch[j]
            const geocodeData = geocodeResults[j]
            const studio = studiosWithoutCoords[i + j]
            
            if (geocodeData.success && studio) {
              console.log(`✅ Geocoded: ${studio.title} → ${geocodeData.location.lat}, ${geocodeData.location.lng}`)
              
              // Update studio in database
              try {
                const updateResponse = await axios.post(`${API_BASE_URL}/api/geocoding/update-studio-coordinates`, {
                  studioId: studio.id
                })
                
                if (updateResponse.data.success) {
                  updatedCount++
                  console.log(`💾 Updated database for: ${studio.title}`)
                }
              } catch (updateError) {
                console.error(`❌ Failed to update database for ${studio.title}:`, updateError.response?.data || updateError.message)
              }
            } else {
              console.warn(`⚠️ Failed to geocode: ${studio?.title || address}`)
            }
          }
        }
        
        // Small delay between batches to avoid rate limiting
        if (i + batchSize < addresses.length) {
          console.log('⏳ Waiting 1 second before next batch...')
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
      } catch (error) {
        console.error(`❌ Error processing batch ${Math.floor(i/batchSize) + 1}:`, error.response?.data || error.message)
      }
    }
    
    console.log(`\n🎉 Completed! Updated ${updatedCount} studios with coordinates`)
    console.log('🌐 Check the map at: https://tattooed-world-backend.onrender.com/map')
    
  } catch (error) {
    console.error('❌ Update failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the update
updateStudiosWithGeocoding(); 