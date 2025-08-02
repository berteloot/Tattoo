const { processArtistData, createArtistProfileData, updateArtistProfileData } = require('./backend/src/utils/artistDataProcessor');

console.log('🧪 Testing Complete Field Mapping...\n');

// Test all possible form fields
const testFormData = {
  // Basic info
  bio: 'I am a professional tattoo artist with 10 years of experience in traditional and Japanese styles',
  studioName: 'Ink & Soul Studio',
  website: 'https://inkandsoul.com',
  
  // Social media
  instagram: '@inkandsoul',
  facebook: 'inkandsoulstudio',
  twitter: '@inkandsoul',
  youtube: 'inkandsoul',
  linkedin: 'inkandsoul',
  calendlyUrl: 'https://calendly.com/inkandsoul/consultation',
  
  // Location
  address: '123 Main Street',
  city: 'Montreal',
  state: 'Quebec',
  zipCode: 'H2X 1Y1',
  country: 'Canada',
  latitude: '45.5017',
  longitude: '-73.5673',
  
  // Pricing
  hourlyRate: '150.00',
  minPrice: '100.00',
  maxPrice: '500.00',
  
  // Relationships
  specialtyIds: ['spec1', 'spec2', 'spec3'],
  serviceIds: ['serv1', 'serv2']
};

console.log('Test 1: Complete form data processing');
try {
  const processed = processArtistData(testFormData, false);
  console.log('✅ All fields processed successfully');
  console.log('Processed data keys:', Object.keys(processed));
  
  // Check that all expected fields are present
  const expectedFields = [
    'bio', 'studioName', 'website', 'instagram', 'facebook', 'twitter', 
    'youtube', 'linkedin', 'calendlyUrl', 'address', 'city', 'state', 
    'zipCode', 'country', 'latitude', 'longitude', 'hourlyRate', 
    'minPrice', 'maxPrice', 'specialtyIds', 'serviceIds'
  ];
  
  const missingFields = expectedFields.filter(field => !(field in processed));
  if (missingFields.length === 0) {
    console.log('✅ All expected fields are present');
  } else {
    console.log('❌ Missing fields:', missingFields);
  }
  
  // Check data types
  console.log('\nData type verification:');
  console.log('Bio (string):', typeof processed.bio === 'string' ? '✅' : '❌');
  console.log('Latitude (number):', typeof processed.latitude === 'number' ? '✅' : '❌');
  console.log('Longitude (number):', typeof processed.longitude === 'number' ? '✅' : '❌');
  console.log('Hourly rate (number):', typeof processed.hourlyRate === 'number' ? '✅' : '❌');
  console.log('Specialty IDs (array):', Array.isArray(processed.specialtyIds) ? '✅' : '❌');
  
} catch (error) {
  console.log('❌ Processing failed:', error.message);
}

console.log('\nTest 2: Prisma create data');
try {
  const processed = processArtistData(testFormData, false);
  const prismaData = createArtistProfileData(processed, 'user123');
  
  console.log('✅ Prisma create data generated successfully');
  console.log('Prisma data keys:', Object.keys(prismaData));
  
  // Check that all database fields are mapped
  const expectedPrismaFields = [
    'userId', 'bio', 'studioName', 'website', 'instagram', 'facebook', 
    'twitter', 'youtube', 'linkedin', 'calendlyUrl', 'address', 'city', 
    'state', 'zipCode', 'country', 'latitude', 'longitude', 'hourlyRate', 
    'minPrice', 'maxPrice', 'specialties', 'services'
  ];
  
  const missingPrismaFields = expectedPrismaFields.filter(field => !(field in prismaData));
  if (missingPrismaFields.length === 0) {
    console.log('✅ All database fields are mapped');
  } else {
    console.log('❌ Missing database fields:', missingPrismaFields);
  }
  
} catch (error) {
  console.log('❌ Prisma create data failed:', error.message);
}

console.log('\nTest 3: Prisma update data');
try {
  const processed = processArtistData(testFormData, true);
  const updateData = updateArtistProfileData(processed);
  
  console.log('✅ Prisma update data generated successfully');
  console.log('Update data keys:', Object.keys(updateData));
  
  // Check that relationships are properly formatted
  if (updateData.specialties && updateData.specialties.set) {
    console.log('✅ Specialties relationship properly formatted');
  } else {
    console.log('❌ Specialties relationship missing or malformed');
  }
  
  if (updateData.services && updateData.services.set) {
    console.log('✅ Services relationship properly formatted');
  } else {
    console.log('❌ Services relationship missing or malformed');
  }
  
} catch (error) {
  console.log('❌ Prisma update data failed:', error.message);
}

console.log('\nTest 4: Empty/optional fields handling');
try {
  const emptyData = {
    bio: 'Valid bio with enough characters',
    city: 'Montreal',
    // All other fields are undefined/empty
  };
  
  const processed = processArtistData(emptyData, false);
  console.log('✅ Empty fields handled correctly');
  
  // Check that undefined fields are not included
  const undefinedFields = Object.entries(processed).filter(([key, value]) => value === undefined);
  if (undefinedFields.length === 0) {
    console.log('✅ No undefined fields in processed data');
  } else {
    console.log('❌ Undefined fields found:', undefinedFields.map(([key]) => key));
  }
  
} catch (error) {
  console.log('❌ Empty fields handling failed:', error.message);
}

console.log('\nTest 5: Field validation');
try {
  const invalidData = {
    bio: 'Short', // Too short
    city: '', // Empty
    latitude: 'invalid', // Not a number
    specialtyIds: 'not-an-array' // Not an array
  };
  
  const processed = processArtistData(invalidData, false);
  console.log('❌ Should have failed validation but didn\'t');
} catch (error) {
  console.log('✅ Validation correctly caught errors:', error.message);
}

console.log('\n🎉 Field mapping tests completed!');

// Summary of field mappings
console.log('\n📋 Complete Field Mapping Summary:');
console.log('Frontend Form Fields → Database Fields');
console.log('=====================================');
console.log('bio → bio');
console.log('studioName → studioName');
console.log('website → website');
console.log('instagram → instagram');
console.log('facebook → facebook');
console.log('twitter → twitter');
console.log('youtube → youtube');
console.log('linkedin → linkedin');
console.log('calendlyUrl → calendlyUrl');
console.log('address → address');
console.log('city → city');
console.log('state → state');
console.log('zipCode → zipCode');
console.log('country → country');
console.log('latitude → latitude');
console.log('longitude → longitude');
console.log('hourlyRate → hourlyRate');
console.log('minPrice → minPrice');
console.log('maxPrice → maxPrice');
console.log('specialtyIds → specialties (relationship)');
console.log('serviceIds → services (relationship)'); 