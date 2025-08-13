#!/usr/bin/env node

/**
 * Direct Database Geocoding Update Script
 * 
 * This script bypasses the problematic API endpoint and updates studio coordinates
 * directly in the database using Prisma.
 * 
 * Usage:
 * 1. Run the frontend geocoding tool to get results
 * 2. Copy the JSON results to this script
 * 3. Run: node scripts/apply-geocoding-directly.js
 * 
 * This approach completely avoids the API issues and gives you direct control.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Your geocoding results from the frontend tool
// Replace this with your actual results
const GEOCODING_RESULTS = [
  // Example format (replace with your actual results):
  // {
  //   studioId: 'studio-id-1',
  //   latitude: 51.5074,
  //   longitude: -0.1278,
  //   formattedAddress: '123 Main St, London, UK',
  //   timestamp: '2024-01-01T00:00:00.000Z'
  // },
  // Add more results here...
];

async function applyGeocodingResults() {
  console.log('🗺️  Starting direct database geocoding update...');
  console.log(`📊 Found ${GEOCODING_RESULTS.length} results to apply`);
  
  if (GEOCODING_RESULTS.length === 0) {
    console.log('❌ No results to apply. Please add your geocoding results to the script.');
    return;
  }

  try {
    // Start transaction
    await prisma.$transaction(async (tx) => {
      let successCount = 0;
      let errorCount = 0;
      
      for (const result of GEOCODING_RESULTS) {
        try {
          // Validate the result
          if (!result.studioId || !result.latitude || !result.longitude) {
            console.log(`⚠️  Skipping invalid result:`, result);
            errorCount++;
            continue;
          }

          // Check if studio exists
          const studio = await tx.studio.findUnique({
            where: { id: result.studioId },
            select: { id: true, title: true, latitude: true, longitude: true }
          });

          if (!studio) {
            console.log(`❌ Studio not found: ${result.studioId}`);
            errorCount++;
            continue;
          }

          // Update the studio coordinates
          await tx.studio.update({
            where: { id: result.studioId },
            data: {
              latitude: result.latitude,
              longitude: result.longitude,
              updatedAt: new Date()
            }
          });

          console.log(`✅ Updated: ${studio.title} → ${result.latitude}, ${result.longitude}`);
          successCount++;
          
        } catch (error) {
          console.error(`❌ Failed to update studio ${result.studioId}:`, error.message);
          errorCount++;
        }
      }

      console.log(`\n📊 Update Summary:`);
      console.log(`✅ Successfully updated: ${successCount} studios`);
      console.log(`❌ Failed updates: ${errorCount} studios`);
      console.log(`📝 Total processed: ${GEOCODING_RESULTS.length} results`);
    });

    console.log('\n🎉 Geocoding update completed successfully!');
    
  } catch (error) {
    console.error('💥 Transaction failed:', error);
    console.log('🔄 Rolling back all changes...');
  } finally {
    await prisma.$disconnect();
  }
}

// Verify database connection and run the update
async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Run the geocoding update
    await applyGeocodingResults();
    
  } catch (error) {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { applyGeocodingResults };
