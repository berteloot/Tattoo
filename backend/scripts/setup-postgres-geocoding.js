const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function setupPostgresGeocoding() {
  console.log('🚀 Setting up PostgreSQL HTTP Foreign Data Wrapper for Google Geocoding...');
  
  try {
    // Read the SQL setup file
    const sqlPath = path.join(__dirname, 'setup-postgres-geocoding.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL setup
    console.log('📝 Executing PostgreSQL setup script...');
    await prisma.$executeRawUnsafe(sqlContent);
    console.log('✅ PostgreSQL setup completed successfully');
    
    // Set the Google Maps API key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  GOOGLE_MAPS_API_KEY not found in environment variables');
      console.log('📋 To set the API key manually, run:');
      console.log('   SELECT set_google_maps_api_key(\'your-api-key-here\');');
      return;
    }
    
    console.log('🔑 Setting Google Maps API key...');
    await prisma.$executeRaw`SELECT set_google_maps_api_key(${apiKey})`;
    console.log('✅ API key set successfully');
    
    // Test the geocoding system
    await testGeocodingSystem();
    
  } catch (error) {
    console.error('❌ Error setting up PostgreSQL geocoding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function testGeocodingSystem() {
  console.log('\n🧪 Testing geocoding system...');
  
  try {
    // Test 1: Check geocoding status
    console.log('📊 Checking current geocoding status...');
    const status = await prisma.$queryRaw`SELECT * FROM get_geocoding_status()`;
    console.log('Geocoding Status:', status[0]);
    
    // Test 2: Test geocoding a single address
    console.log('\n📍 Testing single address geocoding...');
    const testResult = await prisma.$queryRaw`
      SELECT geocode_address(
        '123 Main St',
        'New York',
        'NY',
        '10001',
        'United States'
      ) as result
    `;
    console.log('Test geocoding result:', testResult[0].result);
    
    // Test 3: Get a sample studio and test geocoding
    console.log('\n🏢 Testing studio geocoding...');
    const sampleStudio = await prisma.studio.findFirst({
      where: {
        isActive: true,
        address: { not: null }
      },
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        latitude: true,
        longitude: true
      }
    });
    
    if (sampleStudio) {
      console.log('Sample studio:', sampleStudio.title);
      console.log('Address:', `${sampleStudio.address}, ${sampleStudio.city}, ${sampleStudio.state} ${sampleStudio.zipCode}, ${sampleStudio.country}`);
      
      const studioGeocoding = await prisma.$queryRaw`
        SELECT geocode_address(
          ${sampleStudio.address},
          ${sampleStudio.city},
          ${sampleStudio.state},
          ${sampleStudio.zipCode},
          ${sampleStudio.country}
        ) as result
      `;
      console.log('Studio geocoding result:', studioGeocoding[0].result);
      
      // Test 4: Update studio coordinates
      if (studioGeocoding[0].result.status === 'OK') {
        console.log('\n🔄 Testing studio coordinate update...');
        const updateResult = await prisma.$queryRaw`
          SELECT update_studio_coordinates(${sampleStudio.id}) as result
        `;
        console.log('Update result:', updateResult[0].result);
      }
    }
    
    // Test 5: Test GeoJSON generation
    console.log('\n🗺️  Testing GeoJSON generation...');
    const geojson = await prisma.$queryRaw`SELECT get_studios_geojson() as geojson`;
    console.log('GeoJSON features count:', geojson[0].geojson.features?.length || 0);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing geocoding system:', error);
    throw error;
  }
}

async function batchGeocodeStudios() {
  console.log('\n🔄 Starting batch geocoding of studios...');
  
  try {
    const result = await prisma.$queryRaw`SELECT * FROM batch_update_studio_coordinates()`;
    
    console.log(`📊 Batch geocoding completed:`);
    console.log(`   Total processed: ${result.length}`);
    
    const successCount = result.filter(r => r.status === 'SUCCESS').length;
    const errorCount = result.filter(r => r.status === 'ERROR').length;
    
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('\n❌ Errors encountered:');
      result.filter(r => r.status === 'ERROR').forEach(r => {
        console.log(`   Studio ${r.studio_id}: ${r.error}`);
      });
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error in batch geocoding:', error);
    throw error;
  }
}

async function getGeocodingStatus() {
  try {
    const status = await prisma.$queryRaw`SELECT * FROM get_geocoding_status()`;
    return status[0];
  } catch (error) {
    console.error('❌ Error getting geocoding status:', error);
    throw error;
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
      await setupPostgresGeocoding();
      break;
      
    case 'test':
      await testGeocodingSystem();
      break;
      
    case 'batch':
      await batchGeocodeStudios();
      break;
      
    case 'status':
      const status = await getGeocodingStatus();
      console.log('📊 Geocoding Status:', status);
      break;
      
    default:
      console.log('Usage:');
      console.log('  node setup-postgres-geocoding.js setup    - Set up the PostgreSQL geocoding system');
      console.log('  node setup-postgres-geocoding.js test     - Test the geocoding system');
      console.log('  node setup-postgres-geocoding.js batch    - Batch geocode all studios');
      console.log('  node setup-postgres-geocoding.js status   - Check geocoding status');
      break;
  }
  
  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  setupPostgresGeocoding,
  testGeocodingSystem,
  batchGeocodeStudios,
  getGeocodingStatus
}; 