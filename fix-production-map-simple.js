const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

// Montreal coordinates for different areas
const montrealCoordinates = [
  { lat: 45.5017, lng: -73.5673, name: 'Downtown Montreal' },
  { lat: 45.5048, lng: -73.5732, name: 'Old Montreal' },
  { lat: 45.4972, lng: -73.5784, name: 'Plateau Mont-Royal' },
  { lat: 45.5234, lng: -73.5878, name: 'Mile End' },
  { lat: 45.5168, lng: -73.5612, name: 'Village' },
  { lat: 45.4905, lng: -73.5708, name: 'Griffintown' },
  { lat: 45.5088, lng: -73.5542, name: 'Quartier Latin' },
  { lat: 45.5200, lng: -73.6100, name: 'Outremont' },
  { lat: 45.4800, lng: -73.5800, name: 'Verdun' },
  { lat: 45.5300, lng: -73.6200, name: 'Côte-des-Neiges' }
];

async function fixMapOnProduction() {
  try {
    console.log('🔧 FIXING MAP ON PRODUCTION\n');
    
    // First, get all studios
    console.log('1. Fetching studios from production...');
    const studiosResponse = await axios.get(`${API_BASE_URL}/api/studios?limit=50`);
    
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
    
    // For now, let's just show what we found
    console.log('\n📋 Studios without coordinates:');
    studiosWithoutCoords.forEach((studio, index) => {
      const coords = montrealCoordinates[index % montrealCoordinates.length];
      console.log(`  • ${studio.title}: Will add ${coords.lat}, ${coords.lng}`);
    });
    
    console.log('\n⚠️  Note: To actually update the database, you need to:');
    console.log('   1. Deploy the updated emergency route with the map fix endpoint');
    console.log('   2. Or run the SQL script directly on the production database');
    console.log('   3. Or use the admin panel to manually update studio coordinates');
    
    console.log('\n🌐 Current map status: https://tattooed-world-backend.onrender.com/map');
    
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