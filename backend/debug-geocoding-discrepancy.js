const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

async function debugGeocodingDiscrepancy() {
  console.log('🔍 DEBUGGING GEOCODING DISCREPANCY\n');

  try {
    // 1. Check geocoding status endpoint
    console.log('1️⃣ Fetching geocoding status...');
    const statusResponse = await axios.get(`${API_BASE_URL}/api/geocoding/status`);
    
    if (!statusResponse.data.success) {
      throw new Error('Failed to fetch geocoding status');
    }

    const status = statusResponse.data.data;
    console.log('📊 GEOCODING STATUS ENDPOINT');
    console.log('============================');
    console.log(`Total studios: ${status.total_studios}`);
    console.log(`Geocoded studios: ${status.geocoded_studios}`);
    console.log(`Missing coordinates: ${status.missing_coordinates}`);
    console.log(`Completion rate: ${status.percentage_complete}%\n`);

    // 2. Get all studios to analyze manually
    console.log('2️⃣ Fetching all studios for manual analysis...');
    const allStudiosResponse = await axios.get(`${API_BASE_URL}/api/studios?limit=1000`);
    
    if (!allStudiosResponse.data.success) {
      throw new Error('Failed to fetch all studios');
    }

    const allStudios = allStudiosResponse.data.data.studios || [];
    console.log(`Total studios from API: ${allStudios.length}`);

    // 3. Manual analysis
    const analysis = {
      total: allStudios.length,
      withCoordinates: 0,
      withoutCoordinates: 0,
      withNullLatitude: 0,
      withNullLongitude: 0,
      withBothNull: 0,
      withPartialNull: 0,
      studiosWithoutCoords: []
    };

    allStudios.forEach(studio => {
      const hasLatitude = studio.latitude !== null && studio.latitude !== undefined;
      const hasLongitude = studio.longitude !== null && studio.longitude !== undefined;
      
      if (hasLatitude && hasLongitude) {
        analysis.withCoordinates++;
      } else {
        analysis.withoutCoordinates++;
        analysis.studiosWithoutCoords.push(studio);
        
        if (!hasLatitude && !hasLongitude) {
          analysis.withBothNull++;
        } else {
          analysis.withPartialNull++;
        }
        
        if (!hasLatitude) analysis.withNullLatitude++;
        if (!hasLongitude) analysis.withNullLongitude++;
      }
    });

    console.log('📈 MANUAL ANALYSIS');
    console.log('==================');
    console.log(`Total studios: ${analysis.total}`);
    console.log(`With coordinates: ${analysis.withCoordinates}`);
    console.log(`Without coordinates: ${analysis.withoutCoordinates}`);
    console.log(`With both lat/lng null: ${analysis.withBothNull}`);
    console.log(`With partial null: ${analysis.withPartialNull}`);
    console.log(`With null latitude: ${analysis.withNullLatitude}`);
    console.log(`With null longitude: ${analysis.withNullLongitude}\n`);

    // 4. Show studios without coordinates
    if (analysis.studiosWithoutCoords.length > 0) {
      console.log('❌ STUDIOS WITHOUT COORDINATES');
      console.log('==============================');
      
      // Group by country
      const groupedByCountry = {};
      analysis.studiosWithoutCoords.forEach(studio => {
        const country = studio.country || 'Unknown Country';
        if (!groupedByCountry[country]) {
          groupedByCountry[country] = [];
        }
        groupedByCountry[country].push(studio);
      });

      Object.keys(groupedByCountry).sort().forEach(country => {
        const studios = groupedByCountry[country];
        console.log(`\n🌍 ${country.toUpperCase()} (${studios.length} studios):`);
        
        studios.slice(0, 10).forEach((studio, index) => {
          const address = [
            studio.address,
            studio.city,
            studio.state,
            studio.zipCode,
            studio.country
          ].filter(Boolean).join(', ');
          
          console.log(`  ${index + 1}. ${studio.title}`);
          console.log(`     Address: ${address}`);
          console.log(`     Lat: ${studio.latitude}, Lng: ${studio.longitude}`);
        });
        
        if (studios.length > 10) {
          console.log(`  ... and ${studios.length - 10} more studios`);
        }
      });

      // 5. Special focus on Paris, France
      console.log('\n🇫🇷 PARIS, FRANCE STUDIOS (SPECIAL CHECK)');
      console.log('==========================================');
      
      const parisStudios = analysis.studiosWithoutCoords.filter(studio => 
        (studio.city && studio.city.toLowerCase().includes('paris')) ||
        (studio.country && studio.country.toLowerCase().includes('france'))
      );

      if (parisStudios.length > 0) {
        console.log(`Found ${parisStudios.length} studios in Paris/France without coordinates:\n`);
        
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
          console.log(`   Lat: ${studio.latitude}, Lng: ${studio.longitude}`);
          console.log('');
        });
      } else {
        console.log('✅ No Paris/France studios found without coordinates');
      }
    }

    // 6. Check the pending endpoint again
    console.log('\n3️⃣ Checking pending endpoint again...');
    const pendingResponse = await axios.get(`${API_BASE_URL}/api/geocoding/pending?limit=200`);
    
    if (!pendingResponse.data.success) {
      throw new Error('Failed to fetch pending studios');
    }

    const pendingStudios = pendingResponse.data.data;
    console.log(`Pending endpoint returned: ${pendingStudios.length} studios`);

    // 7. Compare with manual analysis
    console.log('\n🔍 DISCREPANCY ANALYSIS');
    console.log('=======================');
    console.log(`Status endpoint says: ${status.missing_coordinates} missing`);
    console.log(`Manual analysis says: ${analysis.withoutCoordinates} missing`);
    console.log(`Pending endpoint says: ${pendingStudios.length} pending`);
    
    if (status.missing_coordinates !== analysis.withoutCoordinates) {
      console.log('❌ DISCREPANCY DETECTED!');
      console.log('The status endpoint and manual analysis don\'t match');
    }
    
    if (analysis.withoutCoordinates !== pendingStudios.length) {
      console.log('❌ DISCREPANCY DETECTED!');
      console.log('The manual analysis and pending endpoint don\'t match');
    }

    // 8. Check for edge cases
    console.log('\n🔍 EDGE CASES');
    console.log('=============');
    
    const edgeCases = allStudios.filter(studio => {
      const lat = studio.latitude;
      const lng = studio.longitude;
      
      return (
        (lat === 0 && lng === 0) ||
        (lat === '' && lng === '') ||
        (lat === '0' && lng === '0') ||
        (typeof lat === 'string' && lat.trim() === '') ||
        (typeof lng === 'string' && lng.trim() === '')
      );
    });

    if (edgeCases.length > 0) {
      console.log(`Found ${edgeCases.length} studios with edge case coordinates:`);
      edgeCases.slice(0, 5).forEach((studio, index) => {
        console.log(`  ${index + 1}. ${studio.title}`);
        console.log(`     Lat: "${studio.latitude}" (type: ${typeof studio.latitude})`);
        console.log(`     Lng: "${studio.longitude}" (type: ${typeof studio.longitude})`);
      });
    } else {
      console.log('✅ No edge cases found');
    }

  } catch (error) {
    console.error('❌ Error debugging geocoding discrepancy:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

debugGeocodingDiscrepancy();
