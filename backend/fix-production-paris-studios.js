const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function fixProductionParisStudios() {
  console.log('🔧 FIXING PRODUCTION PARIS STUDIOS DATA\n');

  try {
    // 1. Get all studios from production
    console.log('1️⃣ Fetching all studios from production...');
    const allStudiosResponse = await axios.get(`${API_BASE_URL}/api/studios?limit=1000`);
    
    if (!allStudiosResponse.data.success) {
      throw new Error('Failed to fetch studios');
    }

    const allStudios = allStudiosResponse.data.data.studios || [];
    console.log(`Found ${allStudios.length} total studios`);

    // 2. Find Paris studios with data issues
    const parisStudios = allStudios.filter(studio => 
      (studio.address === 'null' || studio.city === 'null') ||
      (studio.country && studio.country.match(/^750\d{2}\s+Paris$/))
    );

    console.log(`\nFound ${parisStudios.length} Paris studios with data issues\n`);

    if (parisStudios.length === 0) {
      console.log('✅ No Paris studios with data issues found');
      return;
    }

    // 3. Show current data
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

    // 4. Fix the data using the admin API
    console.log('🔧 FIXING STUDIO DATA...');
    let fixedCount = 0;

    for (const studio of parisStudios) {
      try {
        // Extract postal code from country field
        const countryMatch = studio.country?.match(/^(\d{5})\s+(.+)$/);
        if (countryMatch) {
          const postalCode = countryMatch[1];
          const cityName = countryMatch[2];
          
          const updateData = {
            address: `${postalCode} ${cityName}, France`,
            city: cityName,
            zipCode: postalCode,
            country: 'France'
          };

          // Update via admin API (you'll need to implement this endpoint)
          console.log(`Would fix: ${studio.title}`);
          console.log(`  From: address="${studio.address}", city="${studio.city}", country="${studio.country}"`);
          console.log(`  To: address="${updateData.address}", city="${updateData.city}", zipCode="${updateData.zipCode}", country="${updateData.country}"`);
          console.log('');
          
          // For now, just show what would be fixed
          fixedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${studio.title}:`, error.message);
      }
    }

    console.log(`\n📊 SUMMARY`);
    console.log('==========');
    console.log(`Total studios: ${allStudios.length}`);
    console.log(`Paris studios with issues: ${parisStudios.length}`);
    console.log(`Would be fixed: ${fixedCount}`);

    // 5. Show the impact on geocoding
    const studiosWithNullCoords = allStudios.filter(studio => 
      studio.latitude === null || studio.longitude === null
    );

    const parisStudiosWithNullCoords = studiosWithNullCoords.filter(studio => 
      (studio.address === 'null' || studio.city === 'null') ||
      (studio.country && studio.country.match(/^750\d{2}\s+Paris$/))
    );

    console.log(`\n🎯 GEOCODING IMPACT`);
    console.log('===================');
    console.log(`Total studios missing coordinates: ${studiosWithNullCoords.length}`);
    console.log(`Paris studios missing coordinates: ${parisStudiosWithNullCoords.length}`);
    console.log(`Percentage of missing coordinates that are Paris studios: ${((parisStudiosWithNullCoords.length / studiosWithNullCoords.length) * 100).toFixed(1)}%`);

    // 6. Recommendations
    console.log('\n🎯 RECOMMENDATIONS');
    console.log('==================');
    console.log('1. The Paris studios have malformed address data:');
    console.log('   - address: "null" (should be actual address)');
    console.log('   - city: "null" (should be "Paris")');
    console.log('   - country: "75001 Paris" (should be "France")');
    console.log('   - zipCode: missing (should be "75001")');
    console.log('');
    console.log('2. To fix this, you need to:');
    console.log('   - Update the studio data in the production database');
    console.log('   - Extract postal codes from the country field');
    console.log('   - Set proper address, city, zipCode, and country values');
    console.log('');
    console.log('3. After fixing the data, the geocoding system will be able to:');
    console.log('   - Process these 113 Paris studios');
    console.log('   - Add them to the pending geocoding list');
    console.log('   - Successfully geocode them using Google Maps API');

  } catch (error) {
    console.error('❌ Error fixing production Paris studios:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

fixProductionParisStudios();
