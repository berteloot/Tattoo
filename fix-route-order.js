const fs = require('fs');

// Read the current file
const filePath = 'backend/src/routes/artists.js';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Fixing route order in artists.js...');

// Remove the first /my-favorites route (before /:id)
const firstRoutePattern = /\/\*\*\s*\n\s*\*\s*@route\s+GET \/api\/artists\/my-favorites[\s\S]*?router\.get\('\/my-favorites'[\s\S]*?\}\);[\s\S]*?\n\s*\*\*\//;

if (firstRoutePattern.test(content)) {
  content = content.replace(firstRoutePattern, '');
  console.log('✅ Removed first /my-favorites route');
} else {
  console.log('⚠️ First /my-favorites route not found');
}

// Write the fixed content back
fs.writeFileSync(filePath, content);
console.log('✅ Route order fixed!'); 