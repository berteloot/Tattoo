const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMissingGeocodingStudios() {
  console.log('🔍 CHECKING STUDIOS MISSING GEOCODING\n');

  try {
    // 1. Get overall statistics
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

    console.log('📊 OVERALL STATISTICS');
    console.log('=====================');
    console.log(`Total active studios: ${totalStudios}`);
    console.log(`Geocoded studios: ${geocodedStudios}`);
    console.log(`Missing coordinates: ${missingCoordinates}`);
    console.log(`Completion rate: ${((geocodedStudios / totalStudios) * 100).toFixed(2)}%\n`);

    // 2. Get studios missing coordinates
    const missingStudios = await prisma.studio.findMany({
      where: {
        isActive: true,
        OR: [
          { latitude: null },
          { longitude: null }
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
        longitude: true,
        createdAt: true
      },
      orderBy: [
        { country: 'asc' },
        { city: 'asc' },
        { title: 'asc' }
      ]
    });

    console.log('❌ STUDIOS MISSING COORDINATES');
    console.log('==============================');
    
    if (missingStudios.length === 0) {
      console.log('✅ All studios are geocoded!');
      return;
    }

    // Group by country and city
    const groupedStudios = {};
    missingStudios.forEach(studio => {
      const country = studio.country || 'Unknown Country';
      const city = studio.city || 'Unknown City';
      
      if (!groupedStudios[country]) {
        groupedStudios[country] = {};
      }
      if (!groupedStudios[country][city]) {
        groupedStudios[country][city] = [];
      }
      
      groupedStudios[country][city].push(studio);
    });

    // Display grouped results
    Object.keys(groupedStudios).sort().forEach(country => {
      console.log(`\n🌍 ${country.toUpperCase()}`);
      console.log('─'.repeat(country.length + 2));
      
      Object.keys(groupedStudios[country]).sort().forEach(city => {
        const studios = groupedStudios[country][city];
        console.log(`\n  📍 ${city} (${studios.length} studios):`);
        
        studios.forEach((studio, index) => {
          const address = [
            studio.address,
            studio.city,
            studio.state,
            studio.zipCode,
            studio.country
          ].filter(Boolean).join(', ');
          
          console.log(`    ${index + 1}. ${studio.title}`);
          console.log(`       Address: ${address}`);
          console.log(`       Created: ${studio.createdAt.toISOString().split('T')[0]}`);
          console.log(`       Coordinates: ${studio.latitude || 'NULL'}, ${studio.longitude || 'NULL'}`);
        });
      });
    });

    // 3. Special focus on Paris, France
    console.log('\n🇫🇷 PARIS, FRANCE STUDIOS (SPECIAL CHECK)');
    console.log('==========================================');
    
    const parisStudios = missingStudios.filter(studio => 
      (studio.city && studio.city.toLowerCase().includes('paris')) ||
      (studio.country && studio.country.toLowerCase().includes('france'))
    );

    if (parisStudios.length > 0) {
      console.log(`Found ${parisStudios.length} studios in Paris/France missing coordinates:\n`);
      
      parisStudios.forEach((studio, index) => {
        const address = [
          studio.address,
          studio.city,
          studio.state,
          studio.zipCode,
          studio.country
        ].filter(Boolean).join(', ');
        
        console.log(`${index + 1}. ${studio.title}`);
        console.log(`   Address: ${address}`);
        console.log(`   Created: ${studio.createdAt.toISOString().split('T')[0]}`);
        console.log(`   Coordinates: ${studio.latitude || 'NULL'}, ${studio.longitude || 'NULL'}`);
        console.log('');
      });
    } else {
      console.log('✅ No Paris/France studios found in missing coordinates list');
    }

    // 4. Check for studios with empty addresses
    console.log('\n🔍 STUDIOS WITH EMPTY ADDRESSES');
    console.log('==============================');
    
    const emptyAddressStudios = await prisma.studio.findMany({
      where: {
        isActive: true,
        OR: [
          { address: null },
          { address: '' },
          { city: null },
          { city: '' }
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

    if (emptyAddressStudios.length > 0) {
      console.log(`Found ${emptyAddressStudios.length} studios with empty addresses:\n`);
      
      emptyAddressStudios.forEach((studio, index) => {
        console.log(`${index + 1}. ${studio.title}`);
        console.log(`   Address: ${studio.address || 'NULL'}`);
        console.log(`   City: ${studio.city || 'NULL'}`);
        console.log(`   State: ${studio.state || 'NULL'}`);
        console.log(`   Zip: ${studio.zipCode || 'NULL'}`);
        console.log(`   Country: ${studio.country || 'NULL'}`);
        console.log(`   Coordinates: ${studio.latitude || 'NULL'}, ${studio.longitude || 'NULL'}`);
        console.log('');
      });
    } else {
      console.log('✅ All studios have address information');
    }

    // 5. Recommendations
    console.log('\n🎯 RECOMMENDATIONS');
    console.log('==================');
    console.log(`• ${missingStudios.length} studios need geocoding`);
    
    if (parisStudios.length > 0) {
      console.log(`• ${parisStudios.length} Paris/France studios need special attention`);
      console.log('• Check if these studios have valid addresses');
      console.log('• Verify Google Maps API can geocode French addresses');
    }
    
    if (emptyAddressStudios.length > 0) {
      console.log(`• ${emptyAddressStudios.length} studios have empty addresses`);
      console.log('• These cannot be geocoded without address information');
      console.log('• Consider updating these studios with proper addresses');
    }
    
    console.log('\n• Go to: https://tattooed-world-backend.onrender.com/admin/geocoding');
    console.log('• Click "Start Geocoding" to process missing coordinates');
    console.log('• Check the geocoding logs for any errors');

  } catch (error) {
    console.error('❌ Error checking studios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissingGeocodingStudios();
