#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Vite build output...');

const buildDir = path.join(__dirname, '../dist');
const assetsDir = path.join(buildDir, 'assets');

// Check if build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found!');
  console.error('   Run: npm run build');
  process.exit(1);
}

console.log('✅ Build directory found');

// Check if assets directory exists
if (!fs.existsSync(assetsDir)) {
  console.error('❌ Assets directory not found!');
  console.error('   This indicates a build failure');
  process.exit(1);
}

console.log('✅ Assets directory found');

// List all assets
try {
  const assets = fs.readdirSync(assetsDir);
  console.log('📋 Assets found:', assets.length);
  
  if (assets.length === 0) {
    console.error('❌ No assets found in build!');
    process.exit(1);
  }
  
  // Categorize assets
  const cssFiles = assets.filter(f => f.endsWith('.css'));
  const jsFiles = assets.filter(f => f.endsWith('.js'));
  const imageFiles = assets.filter(f => /\.(png|jpg|jpeg|gif|svg|ico|webp)$/i.test(f));
  const fontFiles = assets.filter(f => /\.(woff|woff2|ttf|eot|otf)$/i.test(f));
  const otherFiles = assets.filter(f => !f.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|otf)$/i));
  
  console.log('\n📊 Asset breakdown:');
  console.log(`  🎨 CSS files: ${cssFiles.length}`);
  console.log(`  ⚡ JS files: ${jsFiles.length}`);
  console.log(`  🖼️  Image files: ${imageFiles.length}`);
  console.log(`  🔤 Font files: ${fontFiles.length}`);
  console.log(`  📄 Other files: ${otherFiles.length}`);
  
  // Check CSS files
  if (cssFiles.length > 0) {
    console.log('\n🎨 CSS files:');
    cssFiles.forEach(file => {
      const filePath = path.join(assetsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`  📄 ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
  } else {
    console.warn('⚠️  No CSS files found! This is a problem.');
  }
  
  // Check JS files
  if (jsFiles.length > 0) {
    console.log('\n⚡ JS files:');
    jsFiles.forEach(file => {
      const filePath = path.join(assetsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`  📄 ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
  } else {
    console.warn('⚠️  No JS files found! This is a problem.');
  }
  
  // Check for critical issues
  let hasIssues = false;
  
  if (cssFiles.length === 0) {
    console.error('❌ CRITICAL: No CSS files generated!');
    hasIssues = true;
  }
  
  if (jsFiles.length === 0) {
    console.error('❌ CRITICAL: No JS files generated!');
    hasIssues = true;
  }
  
  // Check index.html
  const indexHtmlPath = path.join(buildDir, 'index.html');
  if (fs.existsSync(indexHtmlPath)) {
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Check for asset references
    const cssMatches = indexHtml.match(/href="[^"]*\.css[^"]*"/g);
    const jsMatches = indexHtml.match(/src="[^"]*\.js[^"]*"/g);
    
    console.log('\n📄 index.html analysis:');
    console.log(`  🎨 CSS references: ${cssMatches ? cssMatches.length : 0}`);
    console.log(`  ⚡ JS references: ${jsMatches ? jsMatches.length : 0}`);
    
    if (cssMatches) {
      console.log('  CSS references:');
      cssMatches.forEach(match => {
        console.log(`    ${match}`);
      });
    }
    
    if (jsMatches) {
      console.log('  JS references:');
      jsMatches.forEach(match => {
        console.log(`    ${match}`);
      });
    }
    
    // Check for mismatched references
    if (cssMatches && cssMatches.length !== cssFiles.length) {
      console.warn(`⚠️  CSS reference count (${cssMatches.length}) doesn't match file count (${cssFiles.length})`);
      hasIssues = true;
    }
    
    if (jsMatches && jsMatches.length !== jsFiles.length) {
      console.warn(`⚠️  JS reference count (${jsMatches.length}) doesn't match file count (${jsFiles.length})`);
      hasIssues = true;
    }
  } else {
    console.error('❌ index.html not found!');
    hasIssues = true;
  }
  
  // Final assessment
  console.log('\n📊 Build verification summary:');
  if (hasIssues) {
    console.log('❌ Build has issues that need to be resolved');
    console.log('   Check the warnings and errors above');
    process.exit(1);
  } else {
    console.log('✅ Build appears to be correct and complete');
    console.log('   All assets are properly generated');
    console.log('   CSS and JS files are present');
    console.log('   index.html references are correct');
  }
  
} catch (error) {
  console.error('❌ Error analyzing build:', error.message);
  process.exit(1);
}
