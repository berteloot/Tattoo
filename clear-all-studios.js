const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function clearAllStudios() {
  try {
    console.log('🗑️ CLEARING ALL STUDIOS\n');
    
    // First, get all studios
    console.log('1. Fetching all studios...');
    const studiosResponse = await axios.get(`${API_BASE_URL}/api/studios?limit=100`);
    
    if (!studiosResponse.data.success) {
      throw new Error('Failed to fetch studios');
    }
    
    const studios = studiosResponse.data.data.studios;
    console.log(`📊 Found ${studios.length} studios to delete`);
    
    // Confirm deletion
    console.log('\n⚠️  WARNING: This will permanently delete ALL studios!');
    console.log('This action cannot be undone.');
    console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    // Wait 5 seconds for user to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\n🗑️  Starting deletion...');
    
    // Delete studios in batches to avoid overwhelming the server
    const batchSize = 10;
    let deletedCount = 0;
    
    for (let i = 0; i < studios.length; i += batchSize) {
      const batch = studios.slice(i, i + batchSize);
      
      console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(studios.length/batchSize)}...`);
      
      for (const studio of batch) {
        try {
          console.log(`🗑️  Deleting: ${studio.title}`);
          
          // Delete studio relationships first
          await axios.delete(`${API_BASE_URL}/api/admin/studios/${studio.id}/relationships`, {
            headers: {
              'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'your-admin-token-here'}`
            }
          }).catch(() => {
            // Ignore errors if relationships don't exist
          });
          
          // Delete the studio
          const deleteResponse = await axios.delete(`${API_BASE_URL}/api/admin/studios/${studio.id}`, {
            headers: {
              'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'your-admin-token-here'}`
            }
          });
          
          if (deleteResponse.data.success) {
            console.log(`✅ Deleted: ${studio.title}`);
            deletedCount++;
          } else {
            console.log(`❌ Failed to delete: ${studio.title} - ${deleteResponse.data.error}`);
          }
          
          // Wait between deletions
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`❌ Error deleting ${studio.title}:`, error.response?.data || error.message);
        }
      }
      
      // Wait between batches
      if (i + batchSize < studios.length) {
        console.log('⏳ Waiting 2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`\n🎉 Deletion complete! Deleted ${deletedCount} out of ${studios.length} studios.`);
    console.log('\n📝 Next steps:');
    console.log('1. Reload studios with postal codes in your database');
    console.log('2. Run: node update-studios-real-geocoding.js');
    console.log('3. Check the map for accurate studio locations');
    
  } catch (error) {
    console.error('❌ Script failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the script
clearAllStudios(); 