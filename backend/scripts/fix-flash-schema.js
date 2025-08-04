const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixFlashSchema() {
  try {
    console.log('🔄 Fixing Flash table schema...');
    
    // Check if isHidden column exists
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'flash' 
      AND column_name = 'isHidden'
    `;
    
    if (result.length === 0) {
      console.log('📝 Adding isHidden column to Flash table...');
      
      // Add isHidden column
      await prisma.$executeRaw`
        ALTER TABLE flash 
        ADD COLUMN "isHidden" BOOLEAN DEFAULT false
      `;
      
      console.log('✅ isHidden column added to Flash table');
    } else {
      console.log('✅ isHidden column already exists in Flash table');
    }
    
    // Check if isApproved column exists
    const approvedResult = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'flash' 
      AND column_name = 'isApproved'
    `;
    
    if (approvedResult.length === 0) {
      console.log('📝 Adding isApproved column to Flash table...');
      
      // Add isApproved column
      await prisma.$executeRaw`
        ALTER TABLE flash 
        ADD COLUMN "isApproved" BOOLEAN DEFAULT true
      `;
      
      console.log('✅ isApproved column added to Flash table');
    } else {
      console.log('✅ isApproved column already exists in Flash table');
    }
    
    console.log('🎉 Flash table schema fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing Flash table schema:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixFlashSchema()
  .then(() => {
    console.log('✅ Flash schema fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Flash schema fix failed:', error);
    process.exit(1);
  }); 