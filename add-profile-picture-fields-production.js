const { Client } = require('pg');

// Add profile picture fields to production database
async function addProfilePictureFields() {
  console.log('🔧 Adding Profile Picture Fields to Production Database...');
  
  // You'll need to set the DATABASE_URL environment variable
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database');

    // Check if fields already exist
    console.log('🔍 Checking if profile picture fields exist...');
    
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'artist_profiles' 
      AND column_name LIKE 'profile_picture%'
      ORDER BY column_name;
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Profile picture fields already exist:');
      checkResult.rows.forEach(row => {
        console.log(`   - ${row.column_name}`);
      });
      return;
    }

    // Add profile picture fields
    console.log('📝 Adding profile picture fields...');
    
    await client.query(`
      ALTER TABLE artist_profiles 
      ADD COLUMN profile_picture_url VARCHAR(500),
      ADD COLUMN profile_picture_public_id VARCHAR(255),
      ADD COLUMN profile_picture_width INTEGER,
      ADD COLUMN profile_picture_height INTEGER,
      ADD COLUMN profile_picture_format VARCHAR(50),
      ADD COLUMN profile_picture_bytes INTEGER;
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
      CREATE INDEX idx_artist_profiles_profile_picture_url 
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
    
    const verifyResult = await client.query(`
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
    verifyResult.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    console.log('🎉 Production database updated successfully!');
    console.log('🔄 Profile picture upload should now work!');

  } catch (error) {
    console.error('❌ Error updating production database:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

// Run the update
addProfilePictureFields();
