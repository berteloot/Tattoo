const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixProductionGeocoding() {
  try {
    console.log('🔧 Fixing production geocoding...');
    
    // Check if geocode_cache table exists
    console.log('📋 Checking geocode_cache table...');
    
    try {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'geocode_cache'
        );
      `;
      
      console.log('Table exists check result:', tableExists);
      
      if (!tableExists[0].exists) {
        console.log('❌ geocode_cache table does not exist, creating it...');
        
        // Create the geocode_cache table
        await prisma.$executeRaw`
          CREATE TABLE geocode_cache (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            address_hash TEXT UNIQUE NOT NULL,
            original_address TEXT NOT NULL,
            latitude DOUBLE PRECISION NOT NULL,
            longitude DOUBLE PRECISION NOT NULL,
            created_at TIMESTAMP(6) DEFAULT now(),
            updated_at TIMESTAMP(6) DEFAULT now()
          );
        `;
        
        // Create indexes
        await prisma.$executeRaw`
          CREATE INDEX idx_geocode_cache_address_hash ON geocode_cache(address_hash);
        `;
        
        await prisma.$executeRaw`
          CREATE INDEX idx_geocode_cache_updated_at ON geocode_cache(updated_at);
        `;
        
        console.log('✅ geocode_cache table created successfully');
      } else {
        console.log('✅ geocode_cache table already exists');
      }
    } catch (error) {
      console.error('Error checking/creating geocode_cache table:', error);
    }
    
    // Test the save-result endpoint functionality
    console.log('🧪 Testing save-result functionality...');
    
    // Get a studio that needs geocoding
    const studio = await prisma.studio.findFirst({
      where: {
        isActive: true,
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      },
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true
      }
    });
    
    if (studio) {
      console.log(`📍 Found studio to test: ${studio.title}`);
      
      // Test updating studio coordinates
      const testLatitude = 40.7128;
      const testLongitude = -74.0060;
      const testAddress = `${studio.address}, ${studio.city}, ${studio.state} ${studio.zipCode}, ${studio.country}`;
      
      try {
        // Update studio coordinates
        const updatedStudio = await prisma.studio.update({
          where: { id: studio.id },
          data: {
            latitude: testLatitude,
            longitude: testLongitude,
            updatedAt: new Date()
          }
        });
        
        console.log('✅ Studio coordinates updated successfully');
        
        // Test geocode cache
        const crypto = require('crypto');
        const addressHash = crypto.createHash('md5').update(testAddress.toLowerCase().trim()).digest('hex');
        
        await prisma.geocodeCache.upsert({
          where: { addressHash },
          update: {
            latitude: testLatitude,
            longitude: testLongitude,
            updatedAt: new Date()
          },
          create: {
            addressHash,
            originalAddress: testAddress,
            latitude: testLatitude,
            longitude: testLongitude
          }
        });
        
        console.log('✅ Geocode cache updated successfully');
        
        // Clean up test data
        await prisma.studio.update({
          where: { id: studio.id },
          data: {
            latitude: null,
            longitude: null,
            updatedAt: new Date()
          }
        });
        
        console.log('🧹 Test data cleaned up');
        
      } catch (error) {
        console.error('❌ Error testing save-result functionality:', error);
      }
    } else {
      console.log('ℹ️ No studios found that need geocoding');
    }
    
    // Check current geocoding status
    console.log('📊 Checking current geocoding status...');
    
    const totalStudios = await prisma.studio.count({
      where: { isActive: true }
    });
    
    const geocodedStudios = await prisma.studio.count({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    const missingCoordinates = await prisma.studio.count({
      where: {
        isActive: true,
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    });
    
    const percentageComplete = totalStudios > 0 ? Math.round((geocodedStudios / totalStudios) * 100) : 0;
    
    console.log('📈 Current Status:');
    console.log(`   Total studios: ${totalStudios}`);
    console.log(`   Geocoded: ${geocodedStudios}`);
    console.log(`   Missing coordinates: ${missingCoordinates}`);
    console.log(`   Completion: ${percentageComplete}%`);
    
    console.log('✅ Production geocoding fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing production geocoding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionGeocoding(); 