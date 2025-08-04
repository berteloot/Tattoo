const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixFavoritesSchema() {
  try {
    console.log('🔍 Checking favorites table schema...');
    
    // Check if table exists and get its structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'favorites' 
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Current favorites table structure:');
    console.log(tableInfo);
    
    // Check if the correct columns exist
    const hasUserId = tableInfo.some(col => col.column_name === 'userId');
    const hasArtistId = tableInfo.some(col => col.column_name === 'artistId');
    const hasId = tableInfo.some(col => col.column_name === 'id');
    const hasCreatedAt = tableInfo.some(col => col.column_name === 'createdAt');
    
    console.log('\n🔍 Column check:');
    console.log(`- id: ${hasId ? '✅' : '❌'}`);
    console.log(`- userId: ${hasUserId ? '✅' : '❌'}`);
    console.log(`- artistId: ${hasArtistId ? '✅' : '❌'}`);
    console.log(`- createdAt: ${hasCreatedAt ? '✅' : '❌'}`);
    
    if (!hasId || !hasUserId || !hasArtistId || !hasCreatedAt) {
      console.log('\n🔧 Fixing favorites table schema...');
      
      // Drop the table if it exists with wrong structure
      await prisma.$executeRaw`DROP TABLE IF EXISTS favorites CASCADE;`;
      
      // Create the table with correct structure
      await prisma.$executeRaw`
        CREATE TABLE favorites (
          id TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "artistId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "favorites_pkey" PRIMARY KEY (id)
        );
      `;
      
      // Add foreign key constraints
      await prisma.$executeRaw`
        ALTER TABLE favorites 
        ADD CONSTRAINT "favorites_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE favorites 
        ADD CONSTRAINT "favorites_artistId_fkey" 
        FOREIGN KEY ("artistId") REFERENCES artist_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE;
      `;
      
      // Add unique constraint
      await prisma.$executeRaw`
        ALTER TABLE favorites 
        ADD CONSTRAINT "unique_user_artist_favorite" 
        UNIQUE ("userId", "artistId");
      `;
      
      // Add indexes
      await prisma.$executeRaw`CREATE INDEX "idx_favorites_user_id" ON favorites("userId");`;
      await prisma.$executeRaw`CREATE INDEX "idx_favorites_artist_id" ON favorites("artistId");`;
      await prisma.$executeRaw`CREATE INDEX "idx_favorites_created_at" ON favorites("createdAt");`;
      
      console.log('✅ Favorites table schema fixed!');
    } else {
      console.log('✅ Favorites table schema is correct!');
    }
    
    // Test the table
    console.log('\n🧪 Testing favorites table...');
    const testResult = await prisma.favorite.findMany({
      take: 1
    });
    console.log('✅ Prisma can query the favorites table successfully!');
    console.log(`Found ${testResult.length} favorites`);
    
  } catch (error) {
    console.error('❌ Error fixing favorites schema:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFavoritesSchema(); 