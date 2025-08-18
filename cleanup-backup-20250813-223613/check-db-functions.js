const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseFunctions() {
  try {
    console.log('🔍 Checking for database functions that might cause issues...');
    
    // Check for any functions that reference 'new' or 'updatedAt'
    const functions = await prisma.$queryRaw`
      SELECT 
        routine_name,
        routine_definition
      FROM information_schema.routines 
      WHERE routine_type = 'FUNCTION'
      AND routine_definition LIKE '%new%'
      AND routine_definition LIKE '%updatedAt%'
    `;
    
    console.log('📋 Found functions with new.updatedAt:', functions);
    
    // Check for any functions on the studios table
    const studioFunctions = await prisma.$queryRaw`
      SELECT 
        routine_name,
        routine_definition
      FROM information_schema.routines 
      WHERE routine_type = 'FUNCTION'
      AND routine_definition LIKE '%studios%'
    `;
    
    console.log('📋 Found functions referencing studios table:', studioFunctions);
    
    // Check for any default values or constraints that might cause issues
    const constraints = await prisma.$queryRaw`
      SELECT 
        constraint_name,
        constraint_type,
        table_name
      FROM information_schema.table_constraints 
      WHERE table_name = 'studios'
    `;
    
    console.log('📋 Found constraints on studios table:', constraints);
    
    // Check the actual table structure
    const tableStructure = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        is_identity
      FROM information_schema.columns 
      WHERE table_name = 'studios'
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Complete studios table structure:', tableStructure);
    
  } catch (error) {
    console.error('❌ Error checking database functions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseFunctions();
