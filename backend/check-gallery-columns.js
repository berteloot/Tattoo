const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkGalleryColumns() {
  try {
    console.log('🔍 Checking tattoo_gallery table columns...');
    
    // Check the actual column names in the database
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'tattoo_gallery'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Current columns in tattoo_gallery table:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    // Check if the table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tattoo_gallery'
      );
    `;
    
    console.log('\n📊 Table exists:', tableExists[0].exists);
    
    // Check sample data
    const sampleData = await prisma.$queryRaw`
      SELECT * FROM tattoo_gallery LIMIT 1;
    `;
    
    if (sampleData.length > 0) {
      console.log('\n📝 Sample data:');
      console.log(JSON.stringify(sampleData[0], null, 2));
    } else {
      console.log('\n📝 No data in table');
    }
    
  } catch (error) {
    console.error('❌ Error checking columns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGalleryColumns(); 