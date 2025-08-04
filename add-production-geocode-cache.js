const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function addProductionGeocodeCache() {
  try {
    console.log('🔄 Adding geocode cache table to production database...');
    
    // Call the database initialization script via API
    const response = await axios.post(`${API_BASE_URL}/api/emergency/fix-map-data`, {
      action: 'add_geocode_cache_table'
    });
    
    console.log('✅ Response:', response.data);
    
  } catch (error) {
    console.error('❌ Failed to add geocode cache table:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the script
addProductionGeocodeCache(); 