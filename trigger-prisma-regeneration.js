const axios = require('axios');

// Trigger Prisma client regeneration on production server
async function triggerPrismaRegeneration() {
  console.log('🔄 Triggering Prisma Client Regeneration on Production...');
  
  const baseURL = 'https://tattooed-world-backend.onrender.com/api';
  
  try {
    // Call the emergency regeneration endpoint
    console.log('📞 Calling emergency regeneration endpoint...');
    
    const response = await axios.post(`${baseURL}/emergency/regenerate-prisma`);
    
    if (response.data.success) {
      console.log('✅ Prisma client regenerated successfully!');
      console.log('📊 Test result:', response.data.testResult);
      console.log('🔄 Profile picture upload should now work!');
    } else {
      console.log('❌ Prisma regeneration failed:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Failed to trigger Prisma regeneration:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Run the trigger
triggerPrismaRegeneration();
