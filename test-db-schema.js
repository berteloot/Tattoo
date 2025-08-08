const { Client } = require('pg');

// Test database schema to check profile picture fields
async function testDatabaseSchema() {
  console.log('🔍 Testing Database Schema...');
  
  // You'll need to set the DATABASE_URL environment variable
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

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
      console.log('✅ Profile picture fields found:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
    } else {
      console.log('❌ Profile picture fields not found');
    }

    // Check user roles
    console.log('👥 Checking user roles...');
    
    const userResult = await client.query(`
      SELECT 
        id,
        email,
        role,
        "isActive",
        "emailVerified"
      FROM users 
      LIMIT 5;
    `);
    
    console.log('👤 Users in database:');
    userResult.rows.forEach(user => {
      console.log(`   - ${user.email}: ${user.role} (active: ${user.isActive}, verified: ${user.emailVerified})`);
    });

    // Check artist profiles
    console.log('🎨 Checking artist profiles...');
    
    const artistResult = await client.query(`
      SELECT 
        id,
        "userId",
        "studioName",
        "isVerified",
        "verificationStatus"
      FROM artist_profiles 
      LIMIT 5;
    `);
    
    console.log('🎨 Artist profiles in database:');
    artistResult.rows.forEach(artist => {
      console.log(`   - ID: ${artist.id}, User: ${artist.userId}, Studio: ${artist.studioName}, Verified: ${artist.isVerified}, Status: ${artist.verificationStatus}`);
    });

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

// Run the test
testDatabaseSchema();
