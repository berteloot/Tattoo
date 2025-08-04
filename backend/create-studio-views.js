const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createStudioViews() {
  try {
    console.log('Creating studio views...');

    // Create view for studios with artist count
    await prisma.$executeRaw`
      CREATE OR REPLACE VIEW studios_with_artist_count AS
      SELECT 
        s.*,
        COUNT(sa.artist_id) as artist_count,
        COUNT(CASE WHEN sa.role = 'OWNER' THEN 1 END) as owner_count
      FROM studios s
      LEFT JOIN studio_artists sa ON s.id = sa.studio_id AND sa.is_active = true
      GROUP BY s.id
    `;

    // Create view for artists with their studios
    await prisma.$executeRaw`
      CREATE OR REPLACE VIEW artists_with_studios AS
      SELECT 
        ap.*,
        u."firstName",
        u."lastName",
        u.email,
        s.title as studio_title,
        s.id as studio_id,
        sa.role as studio_role
      FROM artist_profiles ap
      JOIN users u ON ap."userId" = u.id
      LEFT JOIN studio_artists sa ON ap.id = sa.artist_id AND sa.is_active = true
      LEFT JOIN studios s ON sa.studio_id = s.id
    `;

    console.log('✅ Studio views created successfully!');

    // Test the views
    const studiosWithCount = await prisma.$queryRaw`
      SELECT title, artist_count, owner_count 
      FROM studios_with_artist_count 
      LIMIT 5
    `;
    console.log('Sample studios with artist count:', studiosWithCount);

  } catch (error) {
    console.error('❌ Error creating studio views:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createStudioViews(); 