const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

async function importStudiosToProduction() {
  console.log('🔍 Importing studios to production...\n');
  
  const localPrisma = new PrismaClient();
  
  try {
    // Step 1: Get studios from local database
    console.log('1️⃣ Getting studios from local database...');
    const localStudios = await localPrisma.studio.findMany({
      select: {
        title: true,
        slug: true,
        website: true,
        phoneNumber: true,
        email: true,
        facebookUrl: true,
        instagramUrl: true,
        twitterUrl: true,
        linkedinUrl: true,
        youtubeUrl: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        latitude: true,
        longitude: true,
        isActive: true,
        isVerified: true,
        isFeatured: true,
        verificationStatus: true
      }
    });
    
    console.log(`Found ${localStudios.length} studios in local database`);
    
    if (localStudios.length === 0) {
      console.log('❌ No studios found in local database');
      return;
    }
    
    // Step 2: Login to production as admin
    console.log('\n2️⃣ Logging in to production as admin...');
    const loginResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/auth/login', {
      email: 'admin@tattoolocator.com',
      password: 'admin123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Failed to login to production');
      return;
    }
    
    const token = loginResponse.data.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('✅ Logged in to production successfully');
    
    // Step 3: Import studios to production
    console.log('\n3️⃣ Importing studios to production...');
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < localStudios.length; i++) {
      const studio = localStudios[i];
      console.log(`\n📋 Importing studio ${i + 1}/${localStudios.length}: ${studio.title}`);
      
      try {
        const importResponse = await axios.post('https://tattooed-world-backend.onrender.com/api/admin/studios', studio, { headers });
        
        if (importResponse.data.success) {
          console.log(`✅ Successfully imported: ${studio.title}`);
          successCount++;
        } else {
          console.log(`❌ Failed to import: ${studio.title} - ${importResponse.data.error}`);
          errorCount++;
        }
      } catch (error) {
        console.log(`❌ Error importing: ${studio.title} - ${error.response?.data?.error || error.message}`);
        errorCount++;
      }
      
      // Add a small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Step 4: Verify import
    console.log('\n4️⃣ Verifying import...');
    const verifyResponse = await axios.get('https://tattooed-world-backend.onrender.com/api/admin/studios', { headers });
    
    console.log('\n🎯 Import Summary:');
    console.log(`- Studios attempted: ${localStudios.length}`);
    console.log(`- Successfully imported: ${successCount}`);
    console.log(`- Failed to import: ${errorCount}`);
    console.log(`- Studios in production after import: ${verifyResponse.data?.data?.length || 0}`);
    
    if (verifyResponse.data?.data?.length > 0) {
      console.log('\n✅ Import successful! Studios should now be visible in the admin interface.');
    } else {
      console.log('\n❌ Import may have failed. Check the errors above.');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    await localPrisma.$disconnect();
  }
}

importStudiosToProduction(); 