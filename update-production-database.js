const { Client } = require('pg');

// Update production database with profile picture fields
async function updateProductionDatabase() {
  console.log('🔧 Updating Production Database...');
  
  // You'll need to set these environment variables or replace with your production DB credentials
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://username:password@host:port/database',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database');

    // Add profile picture fields
    console.log('📝 Adding profile picture fields...');
    
    await client.query(`
      ALTER TABLE artist_profiles 
      ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500),
      ADD COLUMN IF NOT EXISTS profile_picture_public_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS profile_picture_width INTEGER,
      ADD COLUMN IF NOT EXISTS profile_picture_height INTEGER,
      ADD COLUMN IF NOT EXISTS profile_picture_format VARCHAR(50),
      ADD COLUMN IF NOT EXISTS profile_picture_bytes INTEGER;
    `);
    
    console.log('✅ Profile picture fields added');

    // Add comments
    console.log('📝 Adding field comments...');
    
    await client.query(`
      COMMENT ON COLUMN artist_profiles.profile_picture_url IS 'URL of the artist profile picture (Cloudinary/S3)';
      COMMENT ON COLUMN artist_profiles.profile_picture_public_id IS 'Public ID for the profile picture (for deletion/updates)';
      COMMENT ON COLUMN artist_profiles.profile_picture_width IS 'Width of the profile picture in pixels';
      COMMENT ON COLUMN artist_profiles.profile_picture_height IS 'Height of the profile picture in pixels';
      COMMENT ON COLUMN artist_profiles.profile_picture_format IS 'Image format (jpeg, png, webp, etc.)';
      COMMENT ON COLUMN artist_profiles.profile_picture_bytes IS 'File size in bytes';
    `);
    
    console.log('✅ Field comments added');

    // Create index
    console.log('📝 Creating index...');
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_artist_profiles_profile_picture_url 
      ON artist_profiles(profile_picture_url);
    `);
    
    console.log('✅ Index created');

    // Add constraint
    console.log('📝 Adding URL constraint...');
    
    try {
      await client.query(`
        ALTER TABLE artist_profiles 
        ADD CONSTRAINT chk_profile_picture_url 
        CHECK (profile_picture_url IS NULL OR profile_picture_url ~ '^https?://');
      `);
      console.log('✅ URL constraint added');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️ URL constraint already exists');
      } else {
        throw error;
      }
    }

    // Verify the changes
    console.log('🔍 Verifying changes...');
    
    const result = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'artist_profiles' 
      AND column_name LIKE 'profile_picture%'
      ORDER BY column_name;
    `);
    
    console.log('✅ Profile picture fields in database:');
    result.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    console.log('🎉 Production database updated successfully!');

  } catch (error) {
    console.error('❌ Error updating production database:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

// Run the update
updateProductionDatabase();
