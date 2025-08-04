const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function fixMapOnProduction() {
  try {
    console.log('🔧 FIXING MAP ON PRODUCTION\n');
    
    console.log('1. Calling map fix endpoint...');
    const response = await axios.post(`${API_BASE_URL}/api/emergency/fix-map-data`);
    
    console.log('✅ Map fix successful!');
    console.log('Response:', response.data);
    
    if (response.data.success) {
      console.log(`\n📊 Updated ${response.data.updated} studios with coordinates`);
      console.log('\n📍 Studios with coordinates:');
      response.data.studios.forEach(studio => {
        console.log(`  • ${studio.title}: ${studio.latitude}, ${studio.longitude} (${studio.address}, ${studio.city}, ${studio.state})`);
      });
      
      console.log('\n🌐 Map should now work at: https://tattooed-world-backend.onrender.com/map');
    }
    
  } catch (error) {
    console.error('❌ Map fix failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the fix
fixMapOnProduction(); 