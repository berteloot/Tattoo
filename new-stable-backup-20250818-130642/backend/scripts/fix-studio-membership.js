const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function investigateStudioMembership() {
  try {
    console.log('🔍 Investigating Studio Membership Inconsistency...\n');

    // 1. Check all studios
    console.log('📊 All Studios:');
    const allStudios = await prisma.studio.findMany({
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        state: true,
        isActive: true,
        claimedBy: true
      }
    });

    console.log(`Found ${allStudios.length} studios:`);
    allStudios.forEach(studio => {
      console.log(`  - ${studio.title} (${studio.city}, ${studio.state})`);
      console.log(`    ID: ${studio.id}, Active: ${studio.isActive}, Claimed: ${studio.claimedBy ? 'Yes' : 'No'}`);
    });

    // 2. Check all StudioArtist records
    console.log('\n📊 All StudioArtist records:');
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

    console.log(`Found ${allStudioArtists.length} studio-artist relationships:`);
    if (allStudioArtists.length > 0) {
      allStudioArtists.forEach(sa => {
        console.log(`  - Artist: ${sa.artist.user.firstName} ${sa.artist.user.lastName} (${sa.artist.user.email})`);
        console.log(`    Studio: ${sa.studio.title} (${sa.studio.city}, ${sa.studio.state})`);
        console.log(`    Role: ${sa.role}, Active: ${sa.isActive}, Joined: ${sa.joinedAt}`);
        console.log('');
      });
    } else {
      console.log('  No studio-artist relationships found in database');
    }

    // 3. Check for inactive memberships
    if (allStudioArtists.length > 0) {
      console.log('⚠️ Inactive StudioArtist records:');
      const inactiveMemberships = allStudioArtists.filter(sa => !sa.isActive);
      if (inactiveMemberships.length > 0) {
        inactiveMemberships.forEach(sa => {
          console.log(`  - ${sa.artist.user.firstName} ${sa.artist.user.lastName} at ${sa.studio.title} (Left: ${sa.leftAt})`);
        });
      } else {
        console.log('  No inactive memberships found');
      }

      // 4. Check for duplicate memberships
      console.log('\n🔍 Checking for duplicate memberships...');
      const duplicateCheck = {};
      allStudioArtists.forEach(sa => {
        const key = `${sa.studioId}-${sa.artistId}`;
        if (!duplicateCheck[key]) {
          duplicateCheck[key] = [];
        }
        duplicateCheck[key].push(sa);
      });

      const duplicates = Object.values(duplicateCheck).filter(records => records.length > 1);
      if (duplicates.length > 0) {
        console.log('❌ Found duplicate memberships:');
        duplicates.forEach(duplicateRecords => {
          console.log(`  Studio: ${duplicateRecords[0].studio.title}`);
          console.log(`  Artist: ${duplicateRecords[0].artist.user.firstName} ${duplicateRecords[0].artist.user.lastName}`);
          duplicateRecords.forEach(record => {
            console.log(`    - ID: ${record.id}, Active: ${record.isActive}, Role: ${record.role}, Created: ${record.joinedAt}`);
          });
        });
      } else {
        console.log('✅ No duplicate memberships found');
      }
    }

    // 5. Check specific studio (Bain de Soleil)
    console.log('\n🎯 Checking Studio Bain de Soleil specifically...');
    const bainDeSoleil = await prisma.studio.findFirst({
      where: {
        title: {
          contains: 'BAIN DE SOLEIL',
          mode: 'insensitive'
        }
      }
    });

    if (bainDeSoleil) {
      console.log(`Found studio: ${bainDeSoleil.title}`);
      console.log(`Studio ID: ${bainDeSoleil.id}`);
      console.log(`Studio Active: ${bainDeSoleil.isActive}`);
      
      // Check if there are any studio-artist relationships for this studio
      const studioArtists = await prisma.studioArtist.findMany({
        where: { studioId: bainDeSoleil.id },
        include: {
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
      
      console.log(`Studio Artists: ${studioArtists.length}`);
      studioArtists.forEach(sa => {
        console.log(`  - ${sa.artist.user.firstName} ${sa.artist.user.lastName} (${sa.artist.user.email})`);
        console.log(`    Role: ${sa.role}, Active: ${sa.isActive}, Joined: ${sa.joinedAt}`);
        if (sa.leftAt) console.log(`    Left: ${sa.leftAt}`);
      });
    } else {
      console.log('Studio Bain de Soleil not found in database');
    }

    // 6. Check artist profiles that mention Bain de Soleil
    console.log('\n🎨 Checking artist profiles for Bain de Soleil references...');
    const artistsWithBainDeSoleil = await prisma.artistProfile.findMany({
      where: {
        studioName: {
          contains: 'BAIN DE SOLEIL',
          mode: 'insensitive'
        }
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (artistsWithBainDeSoleil.length > 0) {
      console.log(`Found ${artistsWithBainDeSoleil.length} artist profiles mentioning Bain de Soleil:`);
      artistsWithBainDeSoleil.forEach(artist => {
        console.log(`  - ${artist.user.firstName} ${artist.user.lastName} (${artist.user.email})`);
        console.log(`    Studio Name: ${artist.studioName}`);
        console.log(`    Profile ID: ${artist.id}`);
      });
    } else {
      console.log('No artist profiles mention Bain de Soleil');
    }

  } catch (error) {
    console.error('❌ Error investigating studio membership:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function fixStudioMembership() {
  try {
    console.log('🔧 Fixing Studio Membership Issues...\n');

    // 1. Clean up duplicate memberships (keep the most recent active one)
    console.log('🧹 Cleaning up duplicate memberships...');
    const duplicateCheck = {};
    const allStudioArtists = await prisma.studioArtist.findMany({
      orderBy: { joinedAt: 'desc' }
    });

    allStudioArtists.forEach(sa => {
      const key = `${sa.studioId}-${sa.artistId}`;
      if (!duplicateCheck[key]) {
        duplicateCheck[key] = [];
      }
      duplicateCheck[key].push(sa);
    });

    let cleanedCount = 0;
    for (const [key, records] of Object.entries(duplicateCheck)) {
      if (records.length > 1) {
        console.log(`  Cleaning duplicates for key: ${key}`);
        
        // Keep the first (most recent) record, deactivate the rest
        const [keepRecord, ...duplicateRecords] = records;
        
        for (const duplicate of duplicateRecords) {
          await prisma.studioArtist.update({
            where: { id: duplicate.id },
            data: {
              isActive: false,
              leftAt: new Date()
            }
          });
          cleanedCount++;
          console.log(`    Deactivated duplicate record: ${duplicate.id}`);
        }
      }
    }

    console.log(`✅ Cleaned up ${cleanedCount} duplicate memberships`);

    // 2. Reactivate any incorrectly deactivated memberships
    console.log('\n🔄 Reactivating incorrectly deactivated memberships...');
    const reactivatedCount = await prisma.studioArtist.updateMany({
      where: {
        isActive: false,
        leftAt: null // These shouldn't be inactive without a leftAt date
      },
      data: {
        isActive: true
      }
    });

    console.log(`✅ Reactivated ${reactivatedCount.count} memberships`);

    // 3. Ensure all active memberships have proper dates
    console.log('\n📅 Ensuring proper dates for active memberships...');
    const updatedCount = await prisma.studioArtist.updateMany({
      where: {
        isActive: true,
        joinedAt: null
      },
      data: {
        joinedAt: new Date()
      }
    });

    console.log(`✅ Updated ${updatedCount.count} memberships with join dates`);

    console.log('\n🎉 Studio membership cleanup completed!');

  } catch (error) {
    console.error('❌ Error fixing studio membership:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the investigation
if (process.argv.includes('--fix')) {
  fixStudioMembership();
} else {
  investigateStudioMembership();
}
