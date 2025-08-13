const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndFixTriggers() {
  try {
    console.log('🔍 Checking for problematic database triggers...');
    
    // Check if there are any triggers on the studios table
    const triggers = await prisma.$queryRaw`
      SELECT 
        trigger_name,
        event_manipulation,
        action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'studios'
    `;
    
    console.log('📋 Found triggers on studios table:', triggers);
    
    // Check if there are any triggers that reference 'new.updatedAt'
    const problematicTriggers = await prisma.$queryRaw`
      SELECT 
        trigger_name,
        action_statement
      FROM information_schema.triggers 
      WHERE event_object_table = 'studios'
      AND action_statement LIKE '%new.updatedAt%'
    `;
    
    if (problematicTriggers.length > 0) {
      console.log('❌ Found problematic triggers:', problematicTriggers);
      
      // Drop problematic triggers
      for (const trigger of problematicTriggers) {
        console.log(`🗑️ Dropping trigger: ${trigger.trigger_name}`);
        await prisma.$executeRaw`DROP TRIGGER IF EXISTS ${trigger.trigger_name} ON studios`;
      }
      
      console.log('✅ Problematic triggers dropped');
    } else {
      console.log('✅ No problematic triggers found');
    }
    
    // Check the current table structure
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'studios'
      AND column_name IN ('updated_at', 'updatedAt')
    `;
    
    console.log('📊 Current table structure for updated fields:', columns);
    
  } catch (error) {
    console.error('❌ Error checking/fixing triggers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixTriggers();
