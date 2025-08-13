const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addGeocodeCacheTable() {
  try {
    console.log('🔄 Adding geocode cache table...');
    
    // Check if table already exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'geocode_cache'
      );
    `;
    
    if (tableExists[0].exists) {
      console.log('✅ Geocode cache table already exists');
      return;
    }
    
    // Create the geocode cache table
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
    
    console.log('✅ Geocode cache table created successfully');
    
    // Create index for faster lookups
    await prisma.$executeRaw`
      CREATE INDEX idx_geocode_cache_address_hash ON geocode_cache(address_hash);
    `;
    
    console.log('✅ Index created for geocode cache table');
    
  } catch (error) {
    console.error('❌ Error creating geocode cache table:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
addGeocodeCacheTable(); 