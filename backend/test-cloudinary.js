require('dotenv').config();
const { cloudinary } = require('./src/utils/cloudinary');

console.log('Testing Cloudinary configuration...\n');

// Check if environment variables are set
const requiredVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY', 
  'CLOUDINARY_API_SECRET'
];

console.log('Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 8)}...`);
  } else {
    console.log(`❌ ${varName}: Not set`);
  }
});

console.log('\nCloudinary Configuration:');
console.log(`Cloud Name: ${cloudinary.config().cloud_name || 'Not set'}`);
console.log(`API Key: ${cloudinary.config().api_key ? 'Set' : 'Not set'}`);
console.log(`API Secret: ${cloudinary.config().api_secret ? 'Set' : 'Not set'}`);

// Test Cloudinary connection
async function testConnection() {
  try {
    console.log('\nTesting Cloudinary connection...');
    
    // Try to get account info (this will fail if credentials are wrong)
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('Response:', result);
    
  } catch (error) {
    console.log('❌ Cloudinary connection failed:');
    console.log('Error:', error.message);
    
    if (error.message.includes('Invalid signature')) {
      console.log('\n💡 This usually means your API secret is incorrect.');
    } else if (error.message.includes('Invalid API key')) {
      console.log('\n💡 This usually means your API key is incorrect.');
    } else if (error.message.includes('cloud_name')) {
      console.log('\n💡 This usually means your cloud name is incorrect.');
    }
  }
}

testConnection(); 