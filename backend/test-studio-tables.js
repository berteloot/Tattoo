const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testStudioTables() {
  try {
    console.log('Testing studio tables...');
    
    // Test if studios table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('studios', 'studio_artists')
      ORDER BY table_name
    `;
    
    console.log('Found tables:', tables);
    
    if (tables.length === 0) {
      console.log('❌ Studio tables do not exist. Creating them...');
      
      // Create StudioRole enum
      await prisma.$executeRaw`CREATE TYPE studio_role AS ENUM ('OWNER', 'MANAGER', 'ARTIST', 'GUEST')`;
      
      // Create studios table
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
      
      // Create studio_artists table
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
      
      console.log('✅ Studio tables created successfully!');
    } else {
      console.log('✅ Studio tables already exist!');
    }
    
    // Test inserting a sample studio
    const sampleStudio = {
      title: "Test Studio",
      slug: "test-studio",
      website: "https://teststudio.com",
      phoneNumber: "+1234567890",
      email: "test@teststudio.com"
    };
    
    const existingStudio = await prisma.$queryRaw`
      SELECT id FROM studios WHERE slug = ${sampleStudio.slug}
    `;
    
    if (existingStudio.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO studios (
          id, title, slug, website, phone_number, email,
          is_active, is_verified, verification_status, created_at, updated_at
        ) VALUES (
          gen_random_uuid()::text, ${sampleStudio.title}, ${sampleStudio.slug}, 
          ${sampleStudio.website}, ${sampleStudio.phoneNumber}, ${sampleStudio.email},
          true, false, 'PENDING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `;
      console.log('✅ Test studio inserted successfully!');
    } else {
      console.log('✅ Test studio already exists!');
    }
    
    // Count studios
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM studios`;
    console.log(`Total studios in database: ${count[0].count}`);
    
  } catch (error) {
    console.error('❌ Error testing studio tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testStudioTables(); 