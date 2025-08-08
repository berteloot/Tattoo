const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com/api';

async function updateStanGalleryProduction() {
  try {
    console.log('🚀 Updating Stan gallery items in production...\n');
    
    // First, get Stan's gallery items
    const response = await axios.get(`${API_BASE_URL}/gallery?artistId=cmdxd3thg000118yiotv56dgi`);
    
    if (!response.data.success) {
      console.log('❌ Failed to get Stan gallery items');
      return;
    }
    
    const items = response.data.data.items;
    console.log(`📊 Found ${items.length} gallery items for Stan`);
    
    if (items.length === 0) {
      console.log('❌ No gallery items found for Stan');
      return;
    }
    
    // Show current status
    items.forEach((item, index) => {
      console.log(`\n📋 Item ${index + 1}:`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Title: ${item.title}`);
      console.log(`   isApproved: ${item.isApproved}`);
      console.log(`   clientConsent: ${item.clientConsent}`);
    });
    
    // Note: We can't update these via API without admin authentication
    // But we can check if the new code is working by testing the public gallery
    console.log('\n🔍 Testing public gallery access...');
    
    const publicResponse = await axios.get(`${API_BASE_URL}/gallery`);
    console.log(`Public gallery items: ${publicResponse.data.data.items.length}`);
    
    if (publicResponse.data.data.items.length === 0) {
      console.log('⚠️ Public gallery is still empty - deployment might not be complete');
      console.log('💡 The new code should show items regardless of approval status');
    } else {
      console.log('✅ Public gallery is now showing items!');
    }
    
  } catch (error) {
    console.error('❌ Error updating Stan gallery:', error.response?.data || error.message);
  }
}

updateStanGalleryProduction();
