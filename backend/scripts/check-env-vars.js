#!/usr/bin/env node

/**
 * Check Environment Variables
 * Run this script to verify environment variables are loaded correctly
 */

require('dotenv').config();

console.log('🔍 Environment Variables Check\n');

console.log('📧 Email Service Variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('- FROM_EMAIL:', process.env.FROM_EMAIL);
console.log('- SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set');

console.log('\n🌐 URL Construction Test:');
const frontendUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5173' 
  : (process.env.FRONTEND_URL || 'https://tattooedworld.org');

console.log('- Calculated FRONTEND_URL:', frontendUrl);
console.log('- Verification URL example:', `${frontendUrl}/verify-email?token=test123`);

console.log('\n🔧 Server Configuration:');
console.log('- PORT:', process.env.PORT);
console.log('- CORS_ORIGIN:', process.env.CORS_ORIGIN);

console.log('\n🏁 Environment check completed.');
