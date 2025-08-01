const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixFlashSchema() {
  try {
    console.log('🔧 Fixing Flash table schema...');
    
    // Add missing columns to flash table
    const queries = [
      // Add imagePublicId column if it doesn't exist
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imagePublicId" TEXT;`,
      
      // Add imageWidth column if it doesn't exist
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageWidth" INTEGER;`,
      
      // Add imageHeight column if it doesn't exist
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageHeight" INTEGER;`,
      
      // Add imageFormat column if it doesn't exist
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageFormat" TEXT;`,
      
      // Add imageBytes column if it doesn't exist
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "imageBytes" INTEGER;`,
      
      // Add basePrice column if it doesn't exist (rename from price if it exists)
      `DO $$ 
        BEGIN 
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'flash' AND column_name = 'price') THEN
            ALTER TABLE "flash" RENAME COLUMN "price" TO "basePrice";
          ELSE
            ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "basePrice" DOUBLE PRECISION;
          END IF;
        END $$;`,
      
      // Add complexity column if it doesn't exist
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "complexity" TEXT DEFAULT 'MEDIUM';`,
      
      // Add timeEstimate column if it doesn't exist
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "timeEstimate" INTEGER;`,
      
      // Add isRepeatable column if it doesn't exist
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isRepeatable" BOOLEAN DEFAULT true;`,
      
      // Add sizePricing column if it doesn't exist
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "sizePricing" JSONB;`,
      
      // Add isAvailable column if it doesn't exist
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isAvailable" BOOLEAN DEFAULT true;`,
      
      // Add isApproved column if it doesn't exist
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN DEFAULT true;`,
      
      // Add tags column if it doesn't exist
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';`,
      
      // Add updatedAt column if it doesn't exist
      `ALTER TABLE "flash" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`
    ];
    
    for (const query of queries) {
      try {
        await prisma.$executeRawUnsafe(query);
        console.log('✅ Executed query successfully');
      } catch (error) {
        console.log('⚠️ Query failed (might already exist):', error.message);
      }
    }
    
    console.log('✅ Flash table schema fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing Flash schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFlashSchema(); 