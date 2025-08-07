const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function deployTattooGalleryTables() {
  try {
    console.log('🔄 Starting tattoo gallery tables deployment...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'add_tattoo_gallery_tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📖 SQL file loaded successfully');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔧 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await prisma.$executeRawUnsafe(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
        } catch (error) {
          // Skip if table already exists or constraint already exists
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('relation already exists')) {
            console.log(`⚠️  Statement ${i + 1}/${statements.length} skipped (already exists)`);
          } else {
            console.error(`❌ Statement ${i + 1}/${statements.length} failed:`, error.message);
            throw error;
          }
        }
      }
    }
    
    console.log('🎉 Tattoo gallery tables deployment completed successfully!');
    
    // Verify the tables were created
    console.log('🔍 Verifying tables...');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'tattoo_gallery%'
      ORDER BY table_name;
    `;
    
    console.log('📋 Created tables:', tables.map(t => t.table_name));
    
    // Test a simple query
    const count = await prisma.tattooGallery.count();
    console.log(`✅ Tattoo gallery table is accessible. Current count: ${count}`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the deployment
deployTattooGalleryTables()
  .then(() => {
    console.log('🚀 Deployment script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Deployment script failed:', error);
    process.exit(1);
  }); 