const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixStudioArtistRelationships() {
  try {
    console.log('🔄 Fixing StudioArtist relationships...');
    
    // Check if foreign key constraints exist
    const constraints = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'studio_artists'
    `;
    
    console.log('Current foreign key constraints:', constraints);
    
    // Check if studio_id foreign key exists
    const studioFkExists = constraints.some(c => 
      c.column_name === 'studio_id' && c.foreign_table_name === 'studios'
    );
    
    // Check if artist_id foreign key exists
    const artistFkExists = constraints.some(c => 
      c.column_name === 'artist_id' && c.foreign_table_name === 'artist_profiles'
    );
    
    if (!studioFkExists) {
      console.log('📝 Adding studio_id foreign key constraint...');
      await prisma.$executeRaw`
        ALTER TABLE studio_artists 
        ADD CONSTRAINT fk_studio_artists_studio_id 
        FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE
      `;
      console.log('✅ studio_id foreign key constraint added');
    } else {
      console.log('✅ studio_id foreign key constraint already exists');
    }
    
    if (!artistFkExists) {
      console.log('📝 Adding artist_id foreign key constraint...');
      await prisma.$executeRaw`
        ALTER TABLE studio_artists 
        ADD CONSTRAINT fk_studio_artists_artist_id 
        FOREIGN KEY (artist_id) REFERENCES artist_profiles(id) ON DELETE CASCADE
      `;
      console.log('✅ artist_id foreign key constraint added');
    } else {
      console.log('✅ artist_id foreign key constraint already exists');
    }
    
    // Check for any orphaned records
    const orphanedStudioArtists = await prisma.$queryRaw`
      SELECT sa.* FROM studio_artists sa
      LEFT JOIN studios s ON sa.studio_id = s.id
      LEFT JOIN artist_profiles ap ON sa.artist_id = ap.id
      WHERE s.id IS NULL OR ap.id IS NULL
    `;
    
    if (orphanedStudioArtists.length > 0) {
      console.log('⚠️ Found orphaned studio_artists records:', orphanedStudioArtists.length);
      console.log('Cleaning up orphaned records...');
      
      await prisma.$executeRaw`
        DELETE FROM studio_artists 
        WHERE studio_id NOT IN (SELECT id FROM studios)
        OR artist_id NOT IN (SELECT id FROM artist_profiles)
      `;
      
      console.log('✅ Orphaned records cleaned up');
    } else {
      console.log('✅ No orphaned records found');
    }
    
    console.log('✅ StudioArtist relationships fixed successfully');
    
  } catch (error) {
    console.error('❌ Error fixing StudioArtist relationships:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixStudioArtistRelationships()
  .then(() => {
    console.log('🎉 StudioArtist relationship fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 StudioArtist relationship fix failed:', error);
    process.exit(1);
  }); 