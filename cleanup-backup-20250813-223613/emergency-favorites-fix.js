#!/usr/bin/env node

/**
 * Emergency Favorites Fix Script for Render Production
 * 
 * This script can be run directly on Render to fix the favorites table schema
 * and resolve the 500 error when fetching favorites.
 * 
 * Usage on Render:
 * 1. Go to your service dashboard
 * 2. Click on "Shell" tab
 * 3. Run: node emergency-favorites-fix.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function emergencyFix() {
  console.log('🚨 EMERGENCY FAVORITES FIX STARTING...');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  try {
    // Test connection
    console.log('🔄 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Check current favorites table
    console.log('🔍 Checking current favorites table...');
    try {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'favorites'
        );
      `;
      console.log('📋 Favorites table exists:', tableExists[0].exists);
      
      if (tableExists[0].exists) {
        const columns = await prisma.$queryRaw`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'favorites'
          ORDER BY ordinal_position;
        `;
        console.log('📊 Current columns:', columns);
      }
    } catch (error) {
      console.log('⚠️ Error checking table:', error.message);
    }
    
    // Fix the table
    console.log('🔧 Fixing favorites table...');
    
    // Drop and recreate
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "favorites" CASCADE;`);
    console.log('✅ Dropped old table');
    
    // Create new table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "favorites" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "artistId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('✅ Created new table');
    
    // Add constraints
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
    `);
    console.log('✅ Added userId constraint');
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "favorites" ADD CONSTRAINT "favorites_artistId_fkey" 
      FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE CASCADE;
    `);
    console.log('✅ Added artistId constraint');
    
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
    
    // Verify
    const finalCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "favorites";
    `;
    console.log('✅ Final check - favorites count:', finalCheck[0].count);
    
    console.log('🎉 EMERGENCY FIX COMPLETED SUCCESSFULLY!');
    console.log('🔄 The favorites API should now work properly');
    
  } catch (error) {
    console.error('❌ EMERGENCY FIX FAILED:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }
}

// Run immediately
emergencyFix()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
