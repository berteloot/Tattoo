const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSpecialtiesSchema() {
  try {
    console.log('🔧 Fixing Specialties table schema...');
    
    // Add missing columns to specialties table
    const queries = [
      // Add category column if it doesn't exist
      `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "category" TEXT DEFAULT 'Traditional & Regional';`,
      
      // Add description column if it doesn't exist
      `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "description" TEXT;`,
      
      // Add isActive column if it doesn't exist
      `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;`,
      
      // Add createdAt column if it doesn't exist
      `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`,
      
      // Add updatedAt column if it doesn't exist
      `ALTER TABLE "specialties" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
    ];
    
    for (const query of queries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log('✅ Executed query successfully');
      } catch (error) {
        console.log('⚠️ Query failed (might already exist):', error.message);
      }
    }
    
    console.log('✅ Specialties table schema fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing Specialties schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSpecialtiesSchema(); 