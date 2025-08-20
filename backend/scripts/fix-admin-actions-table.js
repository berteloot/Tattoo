const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminActionsTable() {
  try {
    console.log('🔧 Fixing missing AdminAction table...');
    
    // Check if the table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_actions'
      );
    `;
    
    if (tableExists[0].exists) {
      console.log('✅ AdminAction table already exists');
      return;
    }
    
    console.log('📋 Creating AdminAction table...');
    
    // Create the table manually
    await prisma.$executeRaw`
      CREATE TABLE "admin_actions" (
        "id" TEXT PRIMARY KEY,
        "adminId" TEXT NOT NULL,
        "action" TEXT NOT NULL,
        "targetType" TEXT NOT NULL,
        "targetId" TEXT NOT NULL,
        "details" TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "admin_actions_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `;
    
    // Create indexes
    await prisma.$executeRaw`CREATE INDEX "idx_admin_actions_admin_id" ON "admin_actions"("adminId");`;
    await prisma.$executeRaw`CREATE INDEX "idx_admin_actions_created_at" ON "admin_actions"("createdAt");`;
    await prisma.$executeRaw`CREATE INDEX "idx_admin_actions_action" ON "admin_actions"("action");`;
    await prisma.$executeRaw`CREATE INDEX "idx_admin_actions_target" ON "admin_actions"("targetType", "targetId");`;
    
    console.log('✅ AdminAction table created successfully!');
    
    // Test the table
    const testQuery = await prisma.adminAction.findMany({ take: 1 });
    console.log('✅ Table query test successful:', testQuery.length, 'records found');
    
  } catch (error) {
    console.error('❌ Error fixing AdminAction table:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixAdminActionsTable()
  .then(() => {
    console.log('🎉 AdminAction table fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 AdminAction table fix failed:', error);
    process.exit(1);
  });
