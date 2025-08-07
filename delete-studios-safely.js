const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function deleteStudiosSafely() {
  try {
    console.log('🗑️ SAFE STUDIO DELETION SCRIPT\n');
    
    // First, get all studios to see what we have
    console.log('1. Fetching all studios...');
    const studiosResponse = await axios.get(`${API_BASE_URL}/api/studios?limit=100`);
    
    if (!studiosResponse.data.success) {
      throw new Error('Failed to fetch studios');
    }
    
    const studios = studiosResponse.data.data.studios;
    console.log(`📊 Found ${studios.length} studios`);
    
    // Show first 10 studios
    console.log('\n📋 First 10 studios:');
    studios.slice(0, 10).forEach((studio, index) => {
      console.log(`${index + 1}. ${studio.title} (ID: ${studio.id})`);
    });
    
    // Ask user which studios to delete
    console.log('\n⚠️  WARNING: This will permanently delete studios!');
    console.log('To delete specific studios, edit this script and add their IDs to the array below.');
    
    // Example: Delete specific studios by ID
    const studiosToDelete = [
      // Add studio IDs here, for example:
      // 'studio-id-1',
      // 'studio-id-2'
    ];
    
    if (studiosToDelete.length === 0) {
      console.log('\n✅ No studios selected for deletion. Edit the script to add studio IDs.');
      return;
    }
    
    console.log(`\n🗑️  About to delete ${studiosToDelete.length} studios...`);
    
    // Delete studios one by one to avoid bulk delete issues
    let deletedCount = 0;
    
    for (const studioId of studiosToDelete) {
      try {
        console.log(`\n🗑️  Deleting studio ID: ${studioId}`);
        
        const deleteResponse = await axios.delete(`${API_BASE_URL}/api/admin/studios/${studioId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'your-admin-token-here'}`
          }
        });
        
        if (deleteResponse.data.success) {
          console.log(`✅ Successfully deleted studio: ${deleteResponse.data.data.title}`);
          deletedCount++;
        } else {
          console.log(`❌ Failed to delete studio: ${deleteResponse.data.error}`);
        }
        
        // Wait between deletions
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error deleting studio ${studioId}:`, error.response?.data || error.message);
      }
    }
    
    console.log(`\n🎉 Deletion complete! Deleted ${deletedCount} studios.`);
    
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
deleteStudiosSafely(); 