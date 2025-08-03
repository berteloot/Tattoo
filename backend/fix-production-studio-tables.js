const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixProductionStudioTables() {
  try {
    console.log('🔧 Fixing production studio tables...');
    
    // Check if studio tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('studios', 'studio_artists')
      ORDER BY table_name
    `;
    
    console.log('Found existing tables:', tables);
    
    // Create StudioRole enum if it doesn't exist
    try {
      await prisma.$executeRaw`CREATE TYPE studio_role AS ENUM ('OWNER', 'MANAGER', 'ARTIST', 'GUEST')`;
      console.log('✅ Created studio_role enum');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ studio_role enum already exists');
      } else {
        console.error('❌ Error creating enum:', error.message);
      }
    }
    
    // Create studios table if it doesn't exist
    if (tables.length === 0 || !tables.find(t => t.table_name === 'studios')) {
      console.log('Creating studios table...');
      await prisma.$executeRaw`
        CREATE TABLE studios (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          website TEXT,
          phone_number TEXT,
          email TEXT,
          facebook_url TEXT,
          instagram_url TEXT,
          twitter_url TEXT,
          linkedin_url TEXT,
          youtube_url TEXT,
          latitude DOUBLE PRECISION,
          longitude DOUBLE PRECISION,
          address TEXT,
          city TEXT,
          state TEXT,
          zip_code TEXT,
          country TEXT,
          is_active BOOLEAN DEFAULT true,
          is_verified BOOLEAN DEFAULT false,
          is_featured BOOLEAN DEFAULT false,
          verification_status TEXT DEFAULT 'PENDING',
          claimed_by TEXT,
          claimed_at TIMESTAMP,
          verified_by TEXT,
          verified_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('✅ Created studios table');
    } else {
      console.log('✅ Studios table already exists');
    }
    
    // Create studio_artists table if it doesn't exist
    if (tables.length === 0 || !tables.find(t => t.table_name === 'studio_artists')) {
      console.log('Creating studio_artists table...');
      await prisma.$executeRaw`
        CREATE TABLE studio_artists (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          studio_id TEXT NOT NULL,
          artist_id TEXT NOT NULL,
          role studio_role DEFAULT 'ARTIST',
          is_active BOOLEAN DEFAULT true,
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          left_at TIMESTAMP,
          CONSTRAINT unique_studio_artist UNIQUE (studio_id, artist_id)
        )
      `;
      console.log('✅ Created studio_artists table');
    } else {
      console.log('✅ studio_artists table already exists');
    }
    
    // Check if we need to add foreign key constraints
    const constraints = await prisma.$queryRaw`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'studio_artists' 
      AND constraint_type = 'FOREIGN KEY'
    `;
    
    if (constraints.length === 0) {
      console.log('Adding foreign key constraints...');
      try {
        await prisma.$executeRaw`
          ALTER TABLE studio_artists 
          ADD CONSTRAINT fk_studio_artists_studio 
          FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE
        `;
        console.log('✅ Added studio foreign key constraint');
      } catch (error) {
        console.log('⚠️ Studio foreign key constraint already exists or failed:', error.message);
      }
      
      try {
        await prisma.$executeRaw`
          ALTER TABLE studio_artists 
          ADD CONSTRAINT fk_studio_artists_artist 
          FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE
        `;
        console.log('✅ Added artist foreign key constraint');
      } catch (error) {
        console.log('⚠️ Artist foreign key constraint already exists or failed:', error.message);
      }
    } else {
      console.log('✅ Foreign key constraints already exist');
    }
    
    // Add indexes for performance
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_studios_slug ON studios(slug)`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_studios_title ON studios(title)`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_studio_artists_studio_id ON studio_artists(studio_id)`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_studio_artists_artist_id ON studio_artists(artist_id)`;
      console.log('✅ Added performance indexes');
    } catch (error) {
      console.log('⚠️ Indexes already exist or failed:', error.message);
    }
    
    // Test the tables
    const studioCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM studios`;
    const artistCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM studio_artists`;
    
    console.log(`✅ Studio tables ready! Studios: ${studioCount[0].count}, Studio Artists: ${artistCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Error fixing studio tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductionStudioTables(); 