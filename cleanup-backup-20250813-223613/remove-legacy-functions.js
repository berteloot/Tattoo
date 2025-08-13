const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeLegacyFunctions() {
  try {
    console.log('🗑️ Removing legacy PostgreSQL functions that conflict with new geocoding system...');
    
    // List of functions to remove
    const functionsToRemove = [
      'update_studio_coordinates',
      'batch_update_studio_coordinates', 
      'get_studios_geojson',
      'get_geocoding_status'
    ];
    
    for (const funcName of functionsToRemove) {
      try {
        console.log(`🗑️ Dropping function: ${funcName}`);
        await prisma.$executeRaw`DROP FUNCTION IF EXISTS ${funcName}(text)`;
        await prisma.$executeRaw`DROP FUNCTION IF EXISTS ${funcName}(text, text, text, text, text)`;
        await prisma.$executeRaw`DROP FUNCTION IF EXISTS ${funcName}(double precision, double precision, double precision, double precision)`;
        console.log(`✅ Dropped function: ${funcName}`);
      } catch (error) {
        console.log(`⚠️ Could not drop function ${funcName}:`, error.message);
      }
    }
    
    // Also check for and remove any other geocoding-related functions
    const remainingFunctions = await prisma.$queryRaw`
      SELECT routine_name
      FROM information_schema.routines 
      WHERE routine_type = 'FUNCTION'
      AND routine_name LIKE '%geocod%'
    `;
    
    console.log('📋 Remaining geocoding-related functions:', remainingFunctions);
    
    // Check if there are any other functions that might cause issues
    const allFunctions = await prisma.$queryRaw`
      SELECT routine_name
      FROM information_schema.routines 
      WHERE routine_type = 'FUNCTION'
      AND routine_name LIKE '%studio%'
    `;
    
    console.log('📋 All studio-related functions:', allFunctions);
    
    console.log('✅ Legacy function cleanup completed');
    
  } catch (error) {
    console.error('❌ Error removing legacy functions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeLegacyFunctions();
