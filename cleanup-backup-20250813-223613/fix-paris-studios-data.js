const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixParisStudiosData() {
  console.log('🔧 FIXING PARIS STUDIOS DATA\n');

  try {
    // 1. Find all Paris studios with "null" address data
    const parisStudios = await prisma.studio.findMany({
      where: {
        OR: [
          { address: 'null' },
          { city: 'null' },
          { country: { contains: '75001' } },
          { country: { contains: '75002' } },
          { country: { contains: '75003' } },
          { country: { contains: '75004' } },
          { country: { contains: '75005' } },
          { country: { contains: '75006' } },
          { country: { contains: '75007' } },
          { country: { contains: '75008' } },
          { country: { contains: '75009' } },
          { country: { contains: '75010' } },
          { country: { contains: '75011' } },
          { country: { contains: '75012' } },
          { country: { contains: '75013' } },
          { country: { contains: '75014' } },
          { country: { contains: '75015' } },
          { country: { contains: '75016' } },
          { country: { contains: '75017' } },
          { country: { contains: '75018' } },
          { country: { contains: '75019' } },
          { country: { contains: '75020' } }
        ]
      },
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        latitude: true,
        longitude: true
      }
    });

    console.log(`Found ${parisStudios.length} Paris studios with data issues\n`);

    if (parisStudios.length === 0) {
      console.log('✅ No Paris studios with data issues found');
      return;
    }

    // 2. Show current data
    console.log('📋 CURRENT DATA (First 10 studios):');
    console.log('===================================');
    parisStudios.slice(0, 10).forEach((studio, index) => {
      console.log(`${index + 1}. ${studio.title}`);
      console.log(`   Address: "${studio.address}"`);
      console.log(`   City: "${studio.city}"`);
      console.log(`   State: "${studio.state}"`);
      console.log(`   Zip: "${studio.zipCode}"`);
      console.log(`   Country: "${studio.country}"`);
      console.log(`   Coordinates: ${studio.latitude}, ${studio.longitude}`);
      console.log('');
    });

    // 3. Fix the data
    console.log('🔧 FIXING STUDIO DATA...');
    let fixedCount = 0;

    for (const studio of parisStudios) {
      let needsUpdate = false;
      const updateData = {};

      // Extract postal code from country field
      const countryMatch = studio.country?.match(/^(\d{5})\s+(.+)$/);
      if (countryMatch) {
        const postalCode = countryMatch[1];
        const cityName = countryMatch[2];
        
        // Fix address field
        if (studio.address === 'null' || !studio.address) {
          updateData.address = `${postalCode} ${cityName}, France`;
          needsUpdate = true;
        }
        
        // Fix city field
        if (studio.city === 'null' || !studio.city) {
          updateData.city = cityName;
          needsUpdate = true;
        }
        
        // Fix zipCode field
        if (!studio.zipCode) {
          updateData.zipCode = postalCode;
          needsUpdate = true;
        }
        
        // Fix country field
        if (studio.country !== 'France') {
          updateData.country = 'France';
          needsUpdate = true;
        }
      }

      // Update if needed
      if (needsUpdate) {
        try {
          await prisma.studio.update({
            where: { id: studio.id },
            data: updateData
          });
          fixedCount++;
          console.log(`✅ Fixed: ${studio.title}`);
        } catch (error) {
          console.error(`❌ Error fixing ${studio.title}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 FIXED ${fixedCount} STUDIOS`);

    // 4. Show updated data
    console.log('\n📋 UPDATED DATA (First 10 studios):');
    console.log('====================================');
    const updatedStudios = await prisma.studio.findMany({
      where: {
        id: { in: parisStudios.slice(0, 10).map(s => s.id) }
      },
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        latitude: true,
        longitude: true
      }
    });

    updatedStudios.forEach((studio, index) => {
      console.log(`${index + 1}. ${studio.title}`);
      console.log(`   Address: "${studio.address}"`);
      console.log(`   City: "${studio.city}"`);
      console.log(`   State: "${studio.state}"`);
      console.log(`   Zip: "${studio.zipCode}"`);
      console.log(`   Country: "${studio.country}"`);
      console.log(`   Coordinates: ${studio.latitude}, ${studio.longitude}`);
      console.log('');
    });

    // 5. Check geocoding status after fix
    console.log('📊 GEOCODING STATUS AFTER FIX:');
    console.log('==============================');
    
    const totalStudios = await prisma.studio.count({
      where: { isActive: true }
    });
    
    const geocodedStudios = await prisma.studio.count({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null }
      }
    });
    
    const missingCoordinates = await prisma.studio.count({
      where: {
        isActive: true,
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      }
    });

    console.log(`Total studios: ${totalStudios}`);
    console.log(`Geocoded studios: ${geocodedStudios}`);
    console.log(`Missing coordinates: ${missingCoordinates}`);
    console.log(`Completion rate: ${((geocodedStudios / totalStudios) * 100).toFixed(2)}%`);

    // 6. Check how many Paris studios still need geocoding
    const parisStudiosNeedingGeocoding = await prisma.studio.count({
      where: {
        isActive: true,
        OR: [
          { latitude: null },
          { longitude: null }
        ],
        AND: [
          { address: { not: null } },
          { address: { not: '' } },
          { address: { not: 'null' } },
          { country: 'France' }
        ]
      }
    });

    console.log(`\n🇫🇷 Paris studios needing geocoding: ${parisStudiosNeedingGeocoding}`);

  } catch (error) {
    console.error('❌ Error fixing Paris studios data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixParisStudiosData();
