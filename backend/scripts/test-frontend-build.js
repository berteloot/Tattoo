#!/usr/bin/env node

/**
 * Test script to verify frontend build status
 * This helps debug deployment issues where the React app is not being served
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing frontend build status...');
console.log('=====================================');

// Get current directory
const currentDir = process.cwd();
console.log('Current working directory:', currentDir);

// Try multiple possible frontend build paths
const possiblePaths = [
  path.join(currentDir, 'frontend/dist'),
  path.join(currentDir, '../frontend/dist'),
  path.join(currentDir, '../../frontend/dist'),
  path.join(currentDir, '../../../frontend/dist'),
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, '../../../frontend/dist')
];

console.log('\n🔍 Checking possible frontend build paths:');
let foundPath = null;

for (const buildPath of possiblePaths) {
  const exists = fs.existsSync(buildPath);
  console.log(`  ${exists ? '✅' : '❌'} ${buildPath}`);
  
  if (exists && !foundPath) {
    foundPath = buildPath;
    console.log(`    📁 Found at: ${buildPath}`);
    
    // Check contents
    try {
      const contents = fs.readdirSync(buildPath);
      console.log(`    📋 Contents: ${contents.join(', ')}`);
      
      // Check for critical files
      const hasIndexHtml = fs.existsSync(path.join(buildPath, 'index.html'));
      const hasAssetsDir = fs.existsSync(path.join(buildPath, 'assets'));
      
      console.log(`    📄 index.html: ${hasIndexHtml ? '✅' : '❌'}`);
      console.log(`    📁 assets directory: ${hasAssetsDir ? '✅' : '❌'}`);
      
      if (hasAssetsDir) {
        const assetsPath = path.join(buildPath, 'assets');
        const assets = fs.readdirSync(assetsPath);
        const cssFiles = assets.filter(f => f.endsWith('.css'));
        const jsFiles = assets.filter(f => f.endsWith('.js'));
        
        console.log(`    🎨 CSS files: ${cssFiles.length}`);
        console.log(`    ⚡ JS files: ${jsFiles.length}`);
        
        if (cssFiles.length > 0) {
          console.log(`    📝 CSS files: ${cssFiles.join(', ')}`);
        }
        if (jsFiles.length > 0) {
          console.log(`    📝 JS files: ${jsFiles.join(', ')}`);
        }
      }
      
      // Check file sizes
      if (hasIndexHtml) {
        const indexHtmlPath = path.join(buildPath, 'index.html');
        const stats = fs.statSync(indexHtmlPath);
        console.log(`    📊 index.html size: ${(stats.size / 1024).toFixed(2)} KB`);
        
        // Read and check index.html content
        const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
        const hasTitle = indexHtml.includes('<title>');
        const hasBody = indexHtml.includes('<body>');
        const hasScripts = indexHtml.includes('<script');
        
        console.log(`    🔍 index.html content check:`);
        console.log(`      - Has title: ${hasTitle ? '✅' : '❌'}`);
        console.log(`      - Has body: ${hasBody ? '✅' : '❌'}`);
        console.log(`      - Has scripts: ${hasScripts ? '✅' : '❌'}`);
      }
      
    } catch (error) {
      console.log(`    ❌ Error reading build directory: ${error.message}`);
    }
  }
}

if (!foundPath) {
  console.log('\n❌ No frontend build found at any expected location!');
  console.log('\n🔍 Checking parent directories:');
  
  // Check what's in the current directory and parent directories
  let checkDir = currentDir;
  for (let i = 0; i < 5; i++) {
    try {
      const contents = fs.readdirSync(checkDir);
      console.log(`  📁 ${checkDir}: ${contents.join(', ')}`);
      
      if (contents.includes('frontend')) {
        const frontendDir = path.join(checkDir, 'frontend');
        if (fs.existsSync(frontendDir)) {
          const frontendContents = fs.readdirSync(frontendDir);
          console.log(`    📁 frontend/: ${frontendContents.join(', ')}`);
          
          if (frontendContents.includes('dist')) {
            console.log(`    ✅ Found frontend/dist in ${checkDir}`);
          }
        }
      }
      
      checkDir = path.dirname(checkDir);
    } catch (error) {
      console.log(`  ❌ Error reading ${checkDir}: ${error.message}`);
      break;
    }
  }
  
  console.log('\n🚨 Frontend build issue detected!');
  console.log('This could be due to:');
  console.log('1. Build process failing during deployment');
  console.log('2. Incorrect build directory path');
  console.log('3. Build files not being copied to the correct location');
  console.log('\nCheck the Render deployment logs for build errors.');
  
  process.exit(1);
} else {
  console.log('\n✅ Frontend build found and verified!');
  console.log(`📁 Location: ${foundPath}`);
  console.log('🎯 The React app should be served correctly from this path.');
}

console.log('\n=====================================');
console.log('Frontend build test completed.');
