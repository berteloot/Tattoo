const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupGeocodeCache() {
  console.log('🔧 Setting up geocode cache table...');
  
  try {
    // Create the geocode cache table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS geocode_cache (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        address_hash TEXT UNIQUE NOT NULL,
        original_address TEXT NOT NULL,
        latitude DOUBLE PRECISION NOT NULL,
        longitude DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    console.log('✅ Geocode cache table created successfully');
    
    // Create indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_geocode_cache_address_hash ON geocode_cache(address_hash);
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_geocode_cache_updated_at ON geocode_cache(updated_at);
    `;
    
    console.log('✅ Indexes created successfully');
    
    // Clear incorrect coordinates
    const updateResult = await prisma.studio.updateMany({
      where: {
        latitude: 45.5017,
        longitude: -73.5673
      },
      data: {
        latitude: null,
        longitude: null,
        updatedAt: new Date()
      }
    });
    
    console.log(`✅ Cleared ${updateResult.count} incorrect coordinates`);
    
    // Show current status
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
    
    const missingCoordinates = totalStudios - geocodedStudios;
    const percentageComplete = totalStudios > 0 ? (geocodedStudios / totalStudios) * 100 : 0;
    
    console.log('\n📊 Current Geocoding Status:');
    console.log(`   Total studios: ${totalStudios}`);
    console.log(`   Geocoded: ${geocodedStudios}`);
    console.log(`   Missing coordinates: ${missingCoordinates}`);
    console.log(`   Completion: ${percentageComplete.toFixed(2)}%`);
    
    if (missingCoordinates > 0) {
      console.log('\n🎯 Next Steps:');
      console.log('   1. Go to your admin dashboard');
      console.log('   2. Click on "Studio Geocoding"');
      console.log('   3. Click "Start Geocoding" to process the remaining studios');
    } else {
      console.log('\n🎉 All studios are already geocoded!');
    }
    
  } catch (error) {
    console.error('❌ Error setting up geocode cache:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupGeocodeCache().catch(console.error); 