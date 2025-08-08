const { Client } = require('pg');

// Check if profile picture fields exist in production database
async function checkProductionDBFields() {
  console.log('🔍 Checking Production Database Fields...');
  
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

    // Check if profile picture fields exist
    console.log('📝 Checking profile picture fields...');
    
    const result = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'artist_profiles' 
      AND column_name LIKE 'profile_picture%'
      ORDER BY column_name;
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Profile picture fields found in production database:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    } else {
      console.log('❌ Profile picture fields NOT found in production database');
      console.log('🔧 Need to add the fields to production database');
    }

    // Check all columns in artist_profiles table
    console.log('📋 All columns in artist_profiles table:');
    
    const allColumns = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'artist_profiles' 
      ORDER BY ordinal_position;
    `);
    
    allColumns.rows.forEach(row => {
      console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

  } catch (error) {
    console.error('❌ Error checking production database:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

// Run the check
checkProductionDBFields();
