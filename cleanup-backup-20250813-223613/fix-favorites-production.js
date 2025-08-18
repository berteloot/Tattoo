const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixFavoritesProduction() {
  console.log('🔧 Starting production favorites fix...');
  
  try {
    // Test database connection
    console.log('🔄 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Fix Favorites table schema
    console.log('🔄 Fixing Favorites table schema...');
    
    // Drop and recreate the favorites table to ensure proper structure
    try {
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "favorites" CASCADE;`);
      console.log('✅ Dropped existing favorites table');
    } catch (error) {
      console.log('⚠️ Error dropping table (might not exist):', error.message);
    }

    // Create favorites table with proper structure
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "favorites" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "artistId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✅ Created favorites table');

    // Add foreign key constraints
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);
    console.log('✅ Added userId foreign key constraint');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "favorites" ADD CONSTRAINT "favorites_artistId_fkey" 
      FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);
    console.log('✅ Added artistId foreign key constraint');

    // Add unique constraint
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "favorites" ADD CONSTRAINT "unique_user_artist_favorite" 
      UNIQUE ("userId", "artistId");
    `);
    console.log('✅ Added unique constraint');

    // Add indexes
    await prisma.$executeRawUnsafe(`CREATE INDEX "idx_favorites_user_id" ON "favorites"("userId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "idx_favorites_artist_id" ON "favorites"("artistId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX "idx_favorites_created_at" ON "favorites"("createdAt");`);
    console.log('✅ Added indexes');

    // Verify the table structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'favorites'
      ORDER BY ordinal_position;
    `;
    console.log('📋 Favorites table structure:', tableInfo);

    // Check if there are any existing favorites that need to be migrated
    console.log('🔄 Checking for existing favorites data...');
    try {
      const existingFavorites = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "favorites"`;
      console.log('📊 Existing favorites count:', existingFavorites[0].count);
    } catch (error) {
      console.log('ℹ️ No existing favorites found (this is normal for a fresh table)');
    }

    console.log('🎉 Production favorites fix completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Production favorites fix failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run fix if this file is executed directly
if (require.main === module) {
  fixFavoritesProduction()
    .then((success) => {
      if (success) {
        console.log('✅ Production favorites fix successful');
        process.exit(0);
      } else {
        console.error('❌ Production favorites fix failed');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error during fix:', error);
      process.exit(1);
    });
}

module.exports = { fixFavoritesProduction };
