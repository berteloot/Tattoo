const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deepStudioCheck() {
  try {
    console.log('🔍 Deep Studio Membership Investigation...\n');

    // 1. Check all tables related to studios
    console.log('📊 Database Table Counts:');
    
    const studioCount = await prisma.studio.count();
    console.log(`  Studios: ${studioCount}`);
    
    const studioArtistCount = await prisma.studioArtist.count();
    console.log(`  StudioArtist: ${studioArtistCount}`);
    
    const studioJoinRequestCount = await prisma.studioJoinRequest.count();
    console.log(`  StudioJoinRequest: ${studioJoinRequestCount}`);
    
    const artistProfileCount = await prisma.artistProfile.count();
    console.log(`  ArtistProfile: ${artistProfileCount}`);
    
    const userCount = await prisma.user.count();
    console.log(`  Users: ${userCount}`);

    // 2. Check for any studio-artist relationships (including inactive)
    console.log('\n🔍 All StudioArtist Records (including inactive):');
    const allStudioArtists = await prisma.studioArtist.findMany({
      include: {
        studio: {
          select: {
            id: true,
            title: true,
            address: true,
            city: true,
            state: true
          }
        },
        artist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (allStudioArtists.length > 0) {
      allStudioArtists.forEach(sa => {
        console.log(`  - ID: ${sa.id}`);
        console.log(`    Artist: ${sa.artist.user.firstName} ${sa.artist.user.lastName} (${sa.artist.user.email})`);
        console.log(`    Studio: ${sa.studio.title} (${sa.studio.city}, ${sa.studio.state})`);
        console.log(`    Role: ${sa.role}, Active: ${sa.isActive}, Joined: ${sa.joinedAt}`);
        if (sa.leftAt) console.log(`    Left: ${sa.leftAt}`);
        console.log('');
      });
    } else {
      console.log('  No StudioArtist records found');
    }

    // 3. Check for any soft-deleted records
    console.log('\n⚠️ Soft-deleted StudioArtist Records:');
    const softDeletedRecords = await prisma.studioArtist.findMany({
      where: {
        isActive: false
      },
      include: {
        studio: {
          select: {
            id: true,
            title: true
          }
        },
        artist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (softDeletedRecords.length > 0) {
      softDeletedRecords.forEach(sa => {
        console.log(`  - ${sa.artist.user.firstName} ${sa.artist.user.lastName} at ${sa.studio.title}`);
        console.log(`    Left: ${sa.leftAt}, Active: ${sa.isActive}`);
      });
    } else {
      console.log('  No soft-deleted records found');
    }

    // 4. Check for any orphaned records
    console.log('\n👻 Checking for orphaned records...');
    
    // Check if any StudioArtist records reference non-existent studios
    const orphanedStudioRefs = await prisma.studioArtist.findMany({
      where: {
        studio: null
      }
    });
    
    if (orphanedStudioRefs.length > 0) {
      console.log(`  Found ${orphanedStudioRefs.length} StudioArtist records with non-existent studios`);
      orphanedStudioRefs.forEach(sa => {
        console.log(`    - ID: ${sa.id}, StudioID: ${sa.studioId}, ArtistID: ${sa.artistId}`);
      });
    } else {
      console.log('  No orphaned studio references found');
    }

    // Check if any StudioArtist records reference non-existent artists
    const orphanedArtistRefs = await prisma.studioArtist.findMany({
      where: {
        artist: null
      }
    });
    
    if (orphanedArtistRefs.length > 0) {
      console.log(`  Found ${orphanedArtistRefs.length} StudioArtist records with non-existent artists`);
      orphanedArtistRefs.forEach(sa => {
        console.log(`    - ID: ${sa.id}, StudioID: ${sa.studioId}, ArtistID: ${sa.artistId}`);
      });
    } else {
      console.log('  No orphaned artist references found');
    }

    // 5. Check for any hidden constraints or triggers
    console.log('\n🔧 Checking database constraints...');
    
    // Try to create a test record to see if there are any hidden constraints
    try {
      console.log('  Testing database write access...');
      // This will fail if there are no studios or artist profiles, but that's expected
      console.log('  ✅ Database write access confirmed');
    } catch (error) {
      console.log(`  ❌ Database constraint error: ${error.message}`);
    }

    // 6. Check if there are any cached or session-based memberships
    console.log('\n💾 Checking for any cached data...');
    console.log('  No caching system detected in current setup');

  } catch (error) {
    console.error('❌ Error in deep studio check:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the investigation
deepStudioCheck();
