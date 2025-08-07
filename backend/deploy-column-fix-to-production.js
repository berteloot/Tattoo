const { PrismaClient } = require('@prisma/client');

// Production database URL (this should be set in production environment)
const PRODUCTION_DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/tattoo_app';

console.log('🚀 Deploying column fix to production database...');
console.log('Database URL:', PRODUCTION_DATABASE_URL.replace(/\/\/.*@/, '//***:***@'));

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRODUCTION_DATABASE_URL
    }
  }
});

async function fixProductionColumns() {
  try {
    console.log('🔧 Fixing production gallery column names...');
    
    // First, check what columns currently exist
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'tattoo_gallery'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Current columns in production:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    // Fix column names from snake_case to camelCase
    const columnMappings = [
      { from: 'image_url', to: 'imageUrl' },
      { from: 'image_public_id', to: 'imagePublicId' },
      { from: 'image_width', to: 'imageWidth' },
      { from: 'image_height', to: 'imageHeight' },
      { from: 'image_format', to: 'imageFormat' },
      { from: 'image_bytes', to: 'imageBytes' },
      { from: 'thumbnail_url', to: 'thumbnailUrl' },
      { from: 'tattoo_style', to: 'tattooStyle' },
      { from: 'body_location', to: 'bodyLocation' },
      { from: 'tattoo_size', to: 'tattooSize' },
      { from: 'color_type', to: 'colorType' },
      { from: 'session_count', to: 'sessionCount' },
      { from: 'hours_spent', to: 'hoursSpent' },
      { from: 'client_consent', to: 'clientConsent' },
      { from: 'client_anonymous', to: 'clientAnonymous' },
      { from: 'client_age_verified', to: 'clientAgeVerified' },
      { from: 'is_before_after', to: 'isBeforeAfter' },
      { from: 'before_image_url', to: 'beforeImageUrl' },
      { from: 'before_image_public_id', to: 'beforeImagePublicId' },
      { from: 'after_image_url', to: 'afterImageUrl' },
      { from: 'after_image_public_id', to: 'afterImagePublicId' },
      { from: 'is_featured', to: 'isFeatured' },
      { from: 'is_approved', to: 'isApproved' },
      { from: 'is_hidden', to: 'isHidden' },
      { from: 'completed_at', to: 'completedAt' },
      { from: 'created_at', to: 'createdAt' },
      { from: 'updated_at', to: 'updatedAt' }
    ];
    
    // Rename columns that exist with snake_case names
    for (const mapping of columnMappings) {
      const columnExists = columns.some(col => col.column_name === mapping.from);
      const targetExists = columns.some(col => col.column_name === mapping.to);
      
      if (columnExists && !targetExists) {
        console.log(`🔄 Renaming ${mapping.from} → ${mapping.to}`);
        await prisma.$executeRawUnsafe(`
          ALTER TABLE tattoo_gallery 
          RENAME COLUMN "${mapping.from}" TO "${mapping.to}";
        `);
      } else if (columnExists && targetExists) {
        console.log(`⚠️  Both ${mapping.from} and ${mapping.to} exist, skipping`);
      } else if (!columnExists && targetExists) {
        console.log(`✅ ${mapping.to} already exists`);
      } else {
        console.log(`❌ Neither ${mapping.from} nor ${mapping.to} found`);
      }
    }
    
    // Check final column names
    const finalColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'tattoo_gallery'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Final columns after fix:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    console.log('\n✅ Column name fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing columns:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixProductionColumns()
  .then(() => {
    console.log('🎉 Production column fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Production column fix failed:', error);
    process.exit(1);
  }); 