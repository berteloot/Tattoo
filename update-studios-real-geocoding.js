const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function updateStudiosWithRealGeocoding() {
  try {
    console.log('🔧 UPDATING STUDIOS WITH REAL GEOCODING\n');
    
    // First, get all studios
    console.log('1. Fetching all studios...');
    const studiosResponse = await axios.get(`${API_BASE_URL}/api/studios?limit=100`);
    
    if (!studiosResponse.data.success) {
      throw new Error('Failed to fetch studios');
    }
    
    const studios = studiosResponse.data.data.studios;
    console.log(`📊 Found ${studios.length} studios`);
    
    // Filter studios that need real geocoding (those with fallback coordinates)
    const studiosNeedingGeocoding = studios.filter(studio => 
      studio.latitude === 45.5017 && studio.longitude === -73.5673
    );
    
    console.log(`📍 Found ${studiosNeedingGeocoding.length} studios with fallback coordinates`);
    
    if (studiosNeedingGeocoding.length === 0) {
      console.log('✅ All studios already have real coordinates!');
      return;
    }
    
    // Build addresses for geocoding
    const addresses = studiosNeedingGeocoding.map(studio => {
      const addressParts = [
        studio.address,
        studio.city,
        studio.state,
        studio.zipCode
      ].filter(Boolean);
      return addressParts.join(', ');
    }).filter(Boolean);
    
    console.log(`🌍 Geocoding ${addresses.length} addresses with Google API...`);
    
    // Process addresses in small batches
    const batchSize = 5; // Small batches to avoid rate limits
    let updatedCount = 0;
    
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);
      
      try {
        console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(addresses.length/batchSize)}...`);
        
        // Geocode each address individually to get real coordinates
        for (let j = 0; j < batch.length; j++) {
          const address = batch[j];
          const studio = studiosNeedingGeocoding[i + j];
          
          try {
            console.log(`🌍 Geocoding: ${studio.title}`);
            
            const geocodeResponse = await axios.post(`${API_BASE_URL}/api/geocoding/geocode`, {
              address: address
            });
            
            if (geocodeResponse.data.success && !geocodeResponse.data.fallback) {
              const coords = geocodeResponse.data.location;
              console.log(`✅ Real coordinates: ${coords.lat}, ${coords.lng}`);
              
              // Update studio in database
              const updateResponse = await axios.post(`${API_BASE_URL}/api/geocoding/update-studio-coordinates`, {
                studioId: studio.id
              });
              
              if (updateResponse.data.success) {
                updatedCount++;
                console.log(`💾 Updated database for: ${studio.title}`);
              }
            } else {
              console.log(`⚠️ Still using fallback for: ${studio.title}`);
            }
            
            // Wait between requests
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (error) {
            console.error(`❌ Failed to process ${studio.title}:`, error.response?.data || error.message);
          }
        }
        
        // Wait between batches
        if (i + batchSize < addresses.length) {
          console.log('⏳ Waiting 5 seconds before next batch...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
      } catch (error) {
        console.error(`❌ Error processing batch ${Math.floor(i/batchSize) + 1}:`, error.response?.data || error.message);
      }
    }
    
    console.log(`\n🎉 Completed! Updated ${updatedCount} studios with real coordinates`);
    console.log('🌐 Check the map at: https://tattooed-world-backend.onrender.com/map');
    
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
updateStudiosWithRealGeocoding(); 