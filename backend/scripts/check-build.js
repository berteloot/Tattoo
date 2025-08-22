#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking frontend build output...');

const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
const assetsPath = path.join(frontendBuildPath, 'assets');

console.log('📁 Frontend build path:', frontendBuildPath);
console.log('📁 Assets path:', assetsPath);

// Check if build directory exists
if (!fs.existsSync(frontendBuildPath)) {
  console.error('❌ Frontend build directory not found!');
  console.error('   Run: cd frontend && npm run build');
  process.exit(1);
}

console.log('✅ Frontend build directory found');

// Check if assets directory exists
if (!fs.existsSync(assetsPath)) {
  console.error('❌ Assets directory not found!');
  console.error('   This indicates a build failure');
  process.exit(1);
}

console.log('✅ Assets directory found');

// List all assets
try {
  const assets = fs.readdirSync(assetsPath);
  console.log('📋 Assets found:', assets.length);
  
  assets.forEach(asset => {
    const assetPath = path.join(assetsPath, asset);
    const stats = fs.statSync(assetPath);
    const ext = path.extname(asset).toLowerCase();
    
    let mimeType = 'unknown';
    switch (ext) {
      case '.js':
        mimeType = 'application/javascript';
        break;
      case '.css':
        mimeType = 'text/css';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.svg':
        mimeType = 'image/svg+xml';
        break;
      case '.ico':
        mimeType = 'image/x-icon';
        break;
      case '.woff':
        mimeType = 'font/woff';
        break;
      case '.woff2':
        mimeType = 'font/woff2';
        break;
      case '.ttf':
        mimeType = 'font/ttf';
        break;
      case '.eot':
        mimeType = 'application/vnd.ms-fontobject';
        break;
    }
    
    console.log(`  📄 ${asset} (${mimeType}) - ${(stats.size / 1024).toFixed(2)} KB`);
  });
  
  // Check for critical files
  const hasCSS = assets.some(asset => asset.endsWith('.css'));
  const hasJS = assets.some(asset => asset.endsWith('.js'));
  
  if (!hasCSS) {
    console.warn('⚠️  No CSS files found in assets!');
  }
  
  if (!hasJS) {
    console.warn('⚠️  No JavaScript files found in assets!');
  }
  
  if (hasCSS && hasJS) {
    console.log('✅ Build appears complete with CSS and JS assets');
  }
  
} catch (error) {
  console.error('❌ Error reading assets directory:', error.message);
  process.exit(1);
}

// Check index.html
const indexHtmlPath = path.join(frontendBuildPath, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  
  // Check for asset references
  const cssMatches = indexHtml.match(/href="[^"]*\.css[^"]*"/g);
  const jsMatches = indexHtml.match(/src="[^"]*\.js[^"]*"/g);
  
  console.log('📄 index.html found');
  console.log('  🎨 CSS references:', cssMatches ? cssMatches.length : 0);
  console.log('  ⚡ JS references:', jsMatches ? jsMatches.length : 0);
  
  if (cssMatches) {
    cssMatches.forEach(match => {
      console.log(`    ${match}`);
    });
  }
  
  if (jsMatches) {
    jsMatches.forEach(match => {
      console.log(`    ${match}`);
    });
  }
} else {
  console.error('❌ index.html not found!');
}

console.log('✅ Build check completed');
