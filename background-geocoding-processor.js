const axios = require('axios');

const API_BASE_URL = 'https://tattooed-world-backend.onrender.com';

class BackgroundGeocodingProcessor {
  constructor() {
    this.batchSize = 5; // Process 5 studios at a time
    this.delayBetweenBatches = 3000; // 3 seconds between batches
    this.delayBetweenRequests = 1000; // 1 second between individual requests
    this.maxRetries = 3;
    this.processedCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
    this.skippedCount = 0;
  }

  async processAllStudios() {
    try {
      console.log('🔄 BACKGROUND GEOCODING PROCESSOR\n');
      console.log('📋 Configuration:');
      console.log(`   - Batch size: ${this.batchSize} studios`);
      console.log(`   - Delay between batches: ${this.delayBetweenBatches}ms`);
      console.log(`   - Delay between requests: ${this.delayBetweenRequests}ms`);
      console.log(`   - Max retries: ${this.maxRetries}`);
      console.log('');

      // Step 1: Fetch all studios
      console.log('1️⃣ Fetching all studios...');
      const studios = await this.fetchAllStudios();
      console.log(`📊 Found ${studios.length} total studios`);

      // Step 2: Filter studios that need geocoding
      const studiosToProcess = this.filterStudiosForGeocoding(studios);
      console.log(`📍 Found ${studiosToProcess.length} studios needing geocoding`);
      console.log('');

      if (studiosToProcess.length === 0) {
        console.log('✅ All studios already have coordinates!');
        return;
      }

      // Step 3: Process in batches
      console.log('2️⃣ Starting batch processing...');
      await this.processBatches(studiosToProcess);

      // Step 4: Summary
      this.printSummary();

    } catch (error) {
      console.error('❌ Background processing failed:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
      }
    }
  }

  async fetchAllStudios() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/studios?limit=1000`);
      
      if (!response.data.success) {
        throw new Error('Failed to fetch studios');
      }

      return response.data.data.studios || [];
    } catch (error) {
      console.error('❌ Failed to fetch studios:', error.message);
      throw error;
    }
  }

  filterStudiosForGeocoding(studios) {
    return studios.filter(studio => {
      // Check if studio has no coordinates or has fallback coordinates
      const hasNoCoordinates = !studio.latitude || !studio.longitude;
      const hasFallbackCoordinates = studio.latitude === 45.5017 && studio.longitude === -73.5673;
      
      // Check if studio has address information
      const hasAddress = studio.address && studio.city;
      
      return (hasNoCoordinates || hasFallbackCoordinates) && hasAddress;
    });
  }

  async processBatches(studios) {
    const totalBatches = Math.ceil(studios.length / this.batchSize);
    
    for (let i = 0; i < studios.length; i += this.batchSize) {
      const batchNumber = Math.floor(i / this.batchSize) + 1;
      const batch = studios.slice(i, i + this.batchSize);
      
      console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} studios)...`);
      
      // Process each studio in the batch
      for (const studio of batch) {
        await this.processStudio(studio);
        await this.delay(this.delayBetweenRequests);
      }
      
      // Wait between batches
      if (i + this.batchSize < studios.length) {
        console.log(`⏳ Waiting ${this.delayBetweenBatches/1000}s before next batch...`);
        await this.delay(this.delayBetweenBatches);
      }
    }
  }

  async processStudio(studio) {
    this.processedCount++;
    
    try {
      console.log(`🌍 [${this.processedCount}] Processing: ${studio.title}`);
      
      // Construct full address
      const fullAddress = this.constructFullAddress(studio);
      console.log(`📍 Address: ${fullAddress}`);
      
      // Geocode the address
      const geocodeResult = await this.geocodeAddress(fullAddress);
      
      if (geocodeResult.success && !geocodeResult.fallback) {
        // Update studio coordinates
        const updateResult = await this.updateStudioCoordinates(studio.id, geocodeResult.location);
        
        if (updateResult.success) {
          console.log(`✅ Updated: ${studio.title} → ${geocodeResult.location.lat}, ${geocodeResult.location.lng}`);
          this.successCount++;
        } else {
          console.log(`❌ Failed to update database: ${studio.title}`);
          this.errorCount++;
        }
      } else if (geocodeResult.fallback) {
        console.log(`⚠️ Using fallback coordinates for: ${studio.title}`);
        this.skippedCount++;
      } else {
        console.log(`❌ Geocoding failed for: ${studio.title} - ${geocodeResult.error}`);
        this.errorCount++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${studio.title}:`, error.message);
      this.errorCount++;
    }
  }

  constructFullAddress(studio) {
    const parts = [];
    
    if (studio.address) parts.push(studio.address);
    if (studio.city) parts.push(studio.city);
    if (studio.state) parts.push(studio.state);
    if (studio.zipCode) parts.push(studio.zipCode);
    if (studio.country) parts.push(studio.country);
    
    return parts.join(', ');
  }

  async geocodeAddress(address) {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/geocoding/geocode`, {
          address: address
        });
        
        return response.data;
      } catch (error) {
        if (attempt === this.maxRetries) {
          return {
            success: false,
            error: error.response?.data?.error || error.message
          };
        }
        
        // Wait before retry
        await this.delay(1000 * attempt);
      }
    }
  }

  async updateStudioCoordinates(studioId, location) {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/geocoding/update-studio-coordinates`, {
        studioId: studioId,
        latitude: location.lat,
        longitude: location.lng
      });
      
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printSummary() {
    console.log('\n📊 PROCESSING SUMMARY');
    console.log('=====================');
    console.log(`✅ Successfully processed: ${this.successCount}`);
    console.log(`⚠️ Skipped (fallback): ${this.skippedCount}`);
    console.log(`❌ Errors: ${this.errorCount}`);
    console.log(`📈 Total processed: ${this.processedCount}`);
    
    if (this.successCount > 0) {
      console.log('\n🎉 Some studios were successfully geocoded!');
      console.log('Check the map to see the updated locations.');
    }
    
    if (this.errorCount > 0) {
      console.log('\n⚠️ Some studios failed to process.');
      console.log('This might be due to:');
      console.log('  - Invalid API key');
      console.log('  - Network issues');
      console.log('  - Invalid addresses');
    }
    
    if (this.skippedCount > 0) {
      console.log('\n💡 Some studios used fallback coordinates.');
      console.log('To get precise coordinates:');
      console.log('  1. Check your GOOGLE_GEOCODE_API_KEY in Render');
      console.log('  2. Ensure the API key has Geocoding API enabled');
      console.log('  3. Verify billing is enabled in Google Cloud Console');
    }
  }
}

// Run the processor
const processor = new BackgroundGeocodingProcessor();
processor.processAllStudios(); 