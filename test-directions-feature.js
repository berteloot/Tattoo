#!/usr/bin/env node

const https = require('https');

console.log('🧪 Testing Directions Feature Deployment...\n');

// Test frontend accessibility
console.log('1. Testing Frontend Accessibility...');
https.get('https://tattoo-app-frontend.onrender.com', (res) => {
  console.log(`   ✅ Frontend Status: ${res.statusCode} ${res.statusMessage}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Check if Google Maps is loaded
    const hasGoogleMaps = data.includes('google') || data.includes('maps');
    console.log(`   ${hasGoogleMaps ? '✅' : '❌'} Google Maps API: ${hasGoogleMaps ? 'Detected' : 'Not Found'}`);
    
    // Check if directions feature is present
    const hasDirections = data.includes('directions') || data.includes('navigation');
    console.log(`   ${hasDirections ? '✅' : '❌'} Directions Feature: ${hasDirections ? 'Detected' : 'Not Found'}`);
    
    // Check for environment variable references
    const hasEnvVar = data.includes('VITE_GOOGLE_MAPS_API_KEY');
    console.log(`   ${hasEnvVar ? '✅' : '❌'} Environment Variable: ${hasEnvVar ? 'Referenced' : 'Not Found'}`);
    
    // Check for specific Google Maps script loading
    const hasGoogleScript = data.includes('maps.googleapis.com') || data.includes('maps/api');
    console.log(`   ${hasGoogleScript ? '✅' : '❌'} Google Maps Script: ${hasGoogleScript ? 'Loading' : 'Not Loading'}`);
    
    // Show a snippet of the HTML to debug
    console.log('\n   📄 HTML Snippet (first 500 chars):');
    console.log(`   ${data.substring(0, 500).replace(/\n/g, '\n   ')}...`);
  });
}).on('error', (err) => {
  console.log(`   ❌ Frontend Error: ${err.message}`);
});

// Test backend API
console.log('\n2. Testing Backend API...');
https.get('https://tattoo-app-backend.onrender.com/health', (res) => {
  console.log(`   ✅ Backend Status: ${res.statusCode} ${res.statusMessage}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const health = JSON.parse(data);
      console.log(`   ✅ API Health: ${health.message}`);
    } catch (e) {
      console.log(`   ❌ API Response: ${data.substring(0, 100)}...`);
    }
  });
}).on('error', (err) => {
  console.log(`   ❌ Backend Error: ${err.message}`);
});

// Test artists API
console.log('\n3. Testing Artists API...');
https.get('https://tattoo-app-backend.onrender.com/api/artists?limit=1', (res) => {
  console.log(`   ✅ Artists API Status: ${res.statusCode} ${res.statusMessage}`);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const artists = JSON.parse(data);
      console.log(`   ✅ Artists Available: ${artists.data?.artists?.length || 0} artists`);
    } catch (e) {
      console.log(`   ❌ Artists API Response: ${data.substring(0, 100)}...`);
    }
  });
}).on('error', (err) => {
  console.log(`   ❌ Artists API Error: ${err.message}`);
});

console.log('\n📋 Summary:');
console.log('   - If Google Maps API shows "Not Found", check Google Cloud Console API key restrictions');
console.log('   - If Environment Variable shows "Not Found", the deployment needs to be redeployed');
console.log('   - If Google Maps Script shows "Not Loading", the API key is invalid or restricted');
console.log('\n🔧 To fix:');
console.log('   1. Add Render domains to Google Cloud Console API key restrictions:');
console.log('      https://tattoo-app-frontend.onrender.com/*');
console.log('      https://tattoo-app-backend.onrender.com/*');
console.log('   2. Ensure VITE_GOOGLE_MAPS_API_KEY is set in Render environment');
console.log('   3. Trigger a redeploy in Render dashboard'); 