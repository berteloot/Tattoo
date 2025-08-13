const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testGeocodingEndpoint() {
  try {
    console.log('🧪 Testing geocoding endpoint functionality...');
    
    // Test 1: Check database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test 2: Check if studios table exists and has data
    const studioCount = await prisma.studio.count();
    console.log(`📊 Total studios in database: ${studioCount}`);
    
    if (studioCount === 0) {
      console.log('❌ No studios found in database');
      return;
    }
    
    // Test 3: Get a sample studio
    const sampleStudio = await prisma.studio.findFirst({
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        address: true
      }
    });
    
    console.log('📋 Sample studio:', sampleStudio);
    
    // Test 4: Test the raw SQL update that's failing
    if (sampleStudio) {
      console.log('🧪 Testing raw SQL update...');
      
      try {
        const testLat = 40.7128;
        const testLng = -74.006;
        
        console.log(`🔄 Testing update for studio ${sampleStudio.id} with coordinates: ${testLat}, ${testLng}`);
        
        const updateResult = await prisma.$executeRaw`
          UPDATE studios 
          SET latitude = ${testLat}, longitude = ${testLng}
          WHERE id = ${sampleStudio.id}
        `;
        
        console.log(`📊 Update result:`, updateResult);
        
        if (updateResult === 1) {
          console.log('✅ Raw SQL update successful!');
          
          // Verify the update
          const updatedStudio = await prisma.studio.findUnique({
            where: { id: sampleStudio.id },
            select: { id: true, title: true, latitude: true, longitude: true }
          });
          
          console.log('📋 Updated studio:', updatedStudio);
          
          // Reset to original values
          if (sampleStudio.latitude !== null && sampleStudio.longitude !== null) {
            await prisma.$executeRaw`
              UPDATE studios 
              SET latitude = ${sampleStudio.latitude}, longitude = ${sampleStudio.longitude}
              WHERE id = ${sampleStudio.id}
            `;
            console.log('🔄 Reset studio to original coordinates');
          } else {
            await prisma.$executeRaw`
              UPDATE studios 
              SET latitude = NULL, longitude = NULL
              WHERE id = ${sampleStudio.id}
            `;
            console.log('🔄 Reset studio to NULL coordinates');
          }
          
        } else {
          console.log('❌ Raw SQL update failed - no rows affected');
        }
        
      } catch (updateError) {
        console.error('❌ Raw SQL update error:', updateError);
        console.error('Error code:', updateError.code);
        console.error('Error meta:', updateError.meta);
        console.error('Error message:', updateError.message);
      }
    }
    
    // Test 5: Check database schema
    console.log('🔍 Checking database schema...');
    try {
      const schemaResult = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'studios' 
        ORDER BY ordinal_position
      `;
      
      console.log('📋 Studios table columns:');
      schemaResult.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
    } catch (schemaError) {
      console.error('❌ Schema check failed:', schemaError);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

testGeocodingEndpoint();
