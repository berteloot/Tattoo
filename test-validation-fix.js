const { validateArtistProfile } = require('./backend/src/middleware/artistValidation');

console.log('🧪 Testing Validation Middleware Fix...\n');

// Test 1: Create validation (isUpdate = false)
console.log('Test 1: Create validation (isUpdate = false)');
try {
  const createValidation = validateArtistProfile(false);
  console.log('✅ Create validation middleware created successfully');
  console.log('Number of validation rules:', createValidation.length - 1); // -1 for the error handler
} catch (error) {
  console.log('❌ Create validation failed:', error.message);
}

// Test 2: Update validation (isUpdate = true)
console.log('\nTest 2: Update validation (isUpdate = true)');
try {
  const updateValidation = validateArtistProfile(true);
  console.log('✅ Update validation middleware created successfully');
  console.log('Number of validation rules:', updateValidation.length - 1); // -1 for the error handler
} catch (error) {
  console.log('❌ Update validation failed:', error.message);
}

// Test 3: Check if middleware functions are properly structured
console.log('\nTest 3: Middleware structure validation');
try {
  const validation = validateArtistProfile(false);
  
  // Check that the last item is the error handler function
  const lastItem = validation[validation.length - 1];
  if (typeof lastItem === 'function') {
    console.log('✅ Error handler function present');
  } else {
    console.log('❌ Error handler function missing');
  }
  
  // Check that other items are validation chains
  const validationChains = validation.slice(0, -1);
  const allAreChains = validationChains.every(chain => 
    chain && typeof chain === 'function' && chain.stack
  );
  
  if (allAreChains) {
    console.log('✅ All validation chains properly structured');
  } else {
    console.log('❌ Some validation chains malformed');
  }
  
} catch (error) {
  console.log('❌ Middleware structure test failed:', error.message);
}

console.log('\n🎉 Validation middleware tests completed!'); 