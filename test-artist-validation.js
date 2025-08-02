const { processArtistData, createArtistProfileData, updateArtistProfileData } = require('./backend/src/utils/artistDataProcessor');

console.log('🧪 Testing Artist Data Processing...\n');

// Test 1: Valid data for creation
console.log('Test 1: Valid creation data');
try {
  const validData = {
    bio: 'I am a professional tattoo artist with 10 years of experience',
    city: 'Montreal',
    specialtyIds: ['spec1', 'spec2'],
    serviceIds: ['serv1']
  };
  
  const processed = processArtistData(validData, false);
  console.log('✅ Valid data processed successfully:', processed);
} catch (error) {
  console.log('❌ Valid data failed:', error.message);
}

// Test 2: Valid data for update
console.log('\nTest 2: Valid update data');
try {
  const updateData = {
    bio: 'Updated bio',
    city: 'Toronto',
    specialtyIds: [],
    serviceIds: []
  };
  
  const processed = processArtistData(updateData, true);
  console.log('✅ Update data processed successfully:', processed);
} catch (error) {
  console.log('❌ Update data failed:', error.message);
}

// Test 3: Invalid data (short bio)
console.log('\nTest 3: Invalid data (short bio)');
try {
  const invalidData = {
    bio: 'Short',
    city: 'Montreal'
  };
  
  const processed = processArtistData(invalidData, false);
  console.log('❌ Should have failed but didn\'t');
} catch (error) {
  console.log('✅ Correctly caught validation error:', error.message);
}

// Test 4: Empty arrays
console.log('\nTest 4: Empty arrays');
try {
  const emptyArraysData = {
    bio: 'Valid bio with enough characters',
    city: 'Montreal',
    specialtyIds: [],
    serviceIds: []
  };
  
  const processed = processArtistData(emptyArraysData, false);
  console.log('✅ Empty arrays processed successfully:', processed);
} catch (error) {
  console.log('❌ Empty arrays failed:', error.message);
}

// Test 5: Number parsing
console.log('\nTest 5: Number parsing');
try {
  const numberData = {
    bio: 'Valid bio with enough characters to meet the minimum requirement',
    city: 'Montreal',
    latitude: '45.5017',
    longitude: '-73.5673',
    hourlyRate: '150.50',
    minPrice: '100',
    maxPrice: '500'
  };
  
  const processed = processArtistData(numberData, false);
  console.log('✅ Number parsing successful:', {
    latitude: processed.latitude,
    longitude: processed.longitude,
    hourlyRate: processed.hourlyRate,
    minPrice: processed.minPrice,
    maxPrice: processed.maxPrice
  });
} catch (error) {
  console.log('❌ Number parsing failed:', error.message);
}

// Test 6: Prisma data creation
console.log('\nTest 6: Prisma data creation');
try {
  const processedData = {
    bio: 'Test bio',
    city: 'Test City',
    specialtyIds: ['spec1', 'spec2'],
    serviceIds: ['serv1']
  };
  
  const prismaData = createArtistProfileData(processedData, 'user123');
  console.log('✅ Prisma data created successfully:', prismaData);
} catch (error) {
  console.log('❌ Prisma data creation failed:', error.message);
}

// Test 7: Prisma update data
console.log('\nTest 7: Prisma update data');
try {
  const processedData = {
    bio: 'Updated bio',
    city: 'Updated City',
    specialtyIds: ['spec3'],
    serviceIds: ['serv2']
  };
  
  const updateData = updateArtistProfileData(processedData);
  console.log('✅ Prisma update data created successfully:', updateData);
} catch (error) {
  console.log('❌ Prisma update data creation failed:', error.message);
}

console.log('\n🎉 All tests completed!'); 