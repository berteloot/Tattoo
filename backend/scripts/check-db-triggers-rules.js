const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTriggersAndRules() {
  try {
    console.log('🔍 Checking for triggers and basic table structure...');
    
    // Check for triggers on the studios table
    const triggers = await prisma.$queryRaw`
      SELECT 
        trigger_name,
        event_manipulation,
        action_timing,
        action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'studios'
    `;
    
    console.log('📋 Found triggers on studios table:', triggers);
    
    // Check for any views that might be interfering
    const views = await prisma.$queryRaw`
      SELECT 
        table_name,
        view_definition
      FROM information_schema.views 
      WHERE table_name LIKE '%studio%'
    `;
    
    console.log('📋 Found views related to studios:', views);
    
    // Check the basic table structure
    const tableStructure = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'studios'
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Studios table structure:', tableStructure);
    
  } catch (error) {
    console.error('❌ Error checking triggers and rules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTriggersAndRules();
