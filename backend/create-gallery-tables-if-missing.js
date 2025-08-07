const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createGalleryTablesIfMissing() {
  try {
    console.log('🔍 Checking if gallery tables exist...');
    
    // Check if tattoo_gallery table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tattoo_gallery'
      );
    `;
    
    if (tableExists[0].exists) {
      console.log('✅ tattoo_gallery table already exists');
      
      // Check column names
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'tattoo_gallery'
        ORDER BY ordinal_position;
      `;
      
      console.log('📋 Current columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
      
    } else {
      console.log('❌ tattoo_gallery table does not exist, creating...');
      
      // Create the table with snake_case column names
      await prisma.$executeRawUnsafe(`
        CREATE TABLE tattoo_gallery (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          artist_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          image_url TEXT NOT NULL,
          image_public_id TEXT,
          image_width INTEGER,
          image_height INTEGER,
          image_format TEXT,
          image_bytes INTEGER,
          thumbnail_url TEXT,
          tattoo_style TEXT,
          body_location TEXT,
          tattoo_size TEXT,
          color_type TEXT,
          session_count INTEGER NOT NULL DEFAULT 1,
          hours_spent INTEGER,
          client_consent BOOLEAN NOT NULL DEFAULT false,
          client_anonymous BOOLEAN NOT NULL DEFAULT true,
          client_age_verified BOOLEAN NOT NULL DEFAULT false,
          is_before_after BOOLEAN NOT NULL DEFAULT false,
          before_image_url TEXT,
          before_image_public_id TEXT,
          after_image_url TEXT,
          after_image_public_id TEXT,
          is_featured BOOLEAN NOT NULL DEFAULT false,
          is_approved BOOLEAN NOT NULL DEFAULT false,
          is_hidden BOOLEAN NOT NULL DEFAULT false,
          tags TEXT[],
          categories TEXT[],
          completed_at TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log('✅ tattoo_gallery table created');
      
      // Create indexes
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_artist_id ON tattoo_gallery(artist_id);
        CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_tattoo_style ON tattoo_gallery(tattoo_style);
        CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_body_location ON tattoo_gallery(body_location);
        CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_is_featured ON tattoo_gallery(is_featured);
        CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_is_approved ON tattoo_gallery(is_approved);
        CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_created_at ON tattoo_gallery(created_at);
        CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_tags ON tattoo_gallery USING GIN(tags);
        CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_categories ON tattoo_gallery USING GIN(categories);
      `);
      
      console.log('✅ Indexes created');
    }
    
    // Check if other gallery tables exist
    const likeTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tattoo_gallery_likes'
      );
    `;
    
    if (!likeTableExists[0].exists) {
      console.log('❌ tattoo_gallery_likes table does not exist, creating...');
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE tattoo_gallery_likes (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          gallery_item_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          UNIQUE(gallery_item_id, user_id)
        );
      `);
      
      console.log('✅ tattoo_gallery_likes table created');
    }
    
    const commentTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tattoo_gallery_comments'
      );
    `;
    
    if (!commentTableExists[0].exists) {
      console.log('❌ tattoo_gallery_comments table does not exist, creating...');
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE tattoo_gallery_comments (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          gallery_item_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          comment TEXT NOT NULL,
          is_approved BOOLEAN NOT NULL DEFAULT true,
          is_hidden BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log('✅ tattoo_gallery_comments table created');
    }
    
    const viewTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tattoo_gallery_views'
      );
    `;
    
    if (!viewTableExists[0].exists) {
      console.log('❌ tattoo_gallery_views table does not exist, creating...');
      
      await prisma.$executeRawUnsafe(`
        CREATE TABLE tattoo_gallery_views (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          gallery_item_id TEXT NOT NULL,
          viewer_ip TEXT,
          user_agent TEXT,
          referrer TEXT,
          viewed_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log('✅ tattoo_gallery_views table created');
    }
    
    console.log('🎉 All gallery tables are ready!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createGalleryTablesIfMissing(); 