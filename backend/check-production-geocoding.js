const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function checkProductionGeocoding() {
  console.log('🔍 CHECKING PRODUCTION GEOCODING STATUS\n');

  try {
    // 1. Check geocoding status endpoint
    console.log('1️⃣ Fetching geocoding status...');
    const statusResponse = await axios.get(`${API_BASE_URL}/api/geocoding/status`);
    
    if (!statusResponse.data.success) {
      throw new Error('Failed to fetch geocoding status');
    }

    const status = statusResponse.data.data;
    console.log('📊 PRODUCTION GEOCODING STATUS');
    console.log('==============================');
    console.log(`Total studios: ${status.total_studios}`);
    console.log(`Geocoded studios: ${status.geocoded_studios}`);
    console.log(`Missing coordinates: ${status.missing_coordinates}`);
    console.log(`Completion rate: ${status.percentage_complete}%\n`);

    // 2. Get studios that need geocoding
    console.log('2️⃣ Fetching studios needing geocoding...');
    const pendingResponse = await axios.get(`${API_BASE_URL}/api/geocoding/pending?limit=200`);
    
    if (!pendingResponse.data.success) {
      throw new Error('Failed to fetch pending studios');
    }

    const pendingStudios = pendingResponse.data.data;
    console.log(`Found ${pendingStudios.length} studios needing geocoding\n`);

    // 3. Group by country and city
    const groupedStudios = {};
    pendingStudios.forEach(studio => {
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

    console.log('❌ STUDIOS MISSING COORDINATES');
    console.log('==============================');

    // Display grouped results
    Object.keys(groupedStudios).sort().forEach(country => {
      console.log(`\n🌍 ${country.toUpperCase()}`);
      console.log('─'.repeat(country.length + 2));
      
      Object.keys(groupedStudios[country]).sort().forEach(city => {
        const studios = groupedStudios[country][city];
        console.log(`\n  📍 ${city} (${studios.length} studios):`);
        
        studios.slice(0, 5).forEach((studio, index) => {
          console.log(`    ${index + 1}. ${studio.title}`);
          console.log(`       Address: ${studio.full_address}`);
        });
        
        if (studios.length > 5) {
          console.log(`    ... and ${studios.length - 5} more studios`);
        }
      });
    });

    // 4. Special focus on Paris, France
    console.log('\n🇫🇷 PARIS, FRANCE STUDIOS (SPECIAL CHECK)');
    console.log('==========================================');
    
    const parisStudios = pendingStudios.filter(studio => 
      (studio.city && studio.city.toLowerCase().includes('paris')) ||
      (studio.country && studio.country.toLowerCase().includes('france'))
    );

    if (parisStudios.length > 0) {
      console.log(`Found ${parisStudios.length} studios in Paris/France missing coordinates:\n`);
      
      parisStudios.forEach((studio, index) => {
        console.log(`${index + 1}. ${studio.title}`);
        console.log(`   Address: ${studio.full_address}`);
        console.log('');
      });
    } else {
      console.log('✅ No Paris/France studios found in missing coordinates list');
    }

    // 5. Check for studios with empty addresses
    const emptyAddressStudios = pendingStudios.filter(studio => 
      !studio.address || studio.address.trim() === '' ||
      !studio.city || studio.city.trim() === ''
    );

    console.log('\n🔍 STUDIOS WITH EMPTY ADDRESSES');
    console.log('==============================');
    
    if (emptyAddressStudios.length > 0) {
      console.log(`Found ${emptyAddressStudios.length} studios with empty addresses:\n`);
      
      emptyAddressStudios.slice(0, 10).forEach((studio, index) => {
        console.log(`${index + 1}. ${studio.title}`);
        console.log(`   Address: ${studio.address || 'NULL'}`);
        console.log(`   City: ${studio.city || 'NULL'}`);
        console.log(`   State: ${studio.state || 'NULL'}`);
        console.log(`   Zip: ${studio.zipCode || 'NULL'}`);
        console.log(`   Country: ${studio.country || 'NULL'}`);
        console.log('');
      });
      
      if (emptyAddressStudios.length > 10) {
        console.log(`... and ${emptyAddressStudios.length - 10} more studios with empty addresses`);
      }
    } else {
      console.log('✅ All studios have address information');
    }

    // 6. Get all studios to check total count
    console.log('\n3️⃣ Fetching all studios to verify count...');
    const allStudiosResponse = await axios.get(`${API_BASE_URL}/api/studios?limit=1000`);
    
    if (!allStudiosResponse.data.success) {
      throw new Error('Failed to fetch all studios');
    }

    const allStudios = allStudiosResponse.data.data.studios || [];
    console.log(`Total studios from API: ${allStudios.length}`);
    console.log(`Active studios: ${allStudios.filter(s => s.isActive).length}`);

    // 7. Recommendations
    console.log('\n🎯 RECOMMENDATIONS');
    console.log('==================');
    console.log(`• ${pendingStudios.length} studios need geocoding`);
    
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
    console.error('❌ Error checking production geocoding:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

checkProductionGeocoding();
