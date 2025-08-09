const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

class StudioGeocodingTrigger {
  constructor() {
    this.isProcessing = false;
    this.pendingStudios = [];
    this.batchSize = 5;
    this.delayBetweenRequests = 2000;
    this.maxRetries = 3;
  }

  /**
   * Trigger geocoding for a new studio
   */
  async triggerGeocodingForStudio(studioId) {
    try {
      console.log(`🔄 Auto-triggering geocoding for studio ID: ${studioId}`);
      
      // Add to pending queue
      this.pendingStudios.push(studioId);
      
      // Start processing if not already running
      if (!this.isProcessing) {
        this.processPendingStudios();
      }
      
    } catch (error) {
      console.error('❌ Error triggering geocoding:', error.message);
    }
  }

  /**
   * Process all pending studios
   */
  async processPendingStudios() {
    if (this.isProcessing || this.pendingStudios.length === 0) {
      return;
    }

    this.isProcessing = true;
    console.log(`🔄 Processing ${this.pendingStudios.length} pending studios...`);

    try {
      // Process in batches
      while (this.pendingStudios.length > 0) {
        const batch = this.pendingStudios.splice(0, this.batchSize);
        
        console.log(`📦 Processing batch of ${batch.length} studios...`);
        
        for (const studioId of batch) {
          await this.geocodeStudio(studioId);
          await this.delay(this.delayBetweenRequests);
        }
        
        // Wait between batches if there are more
        if (this.pendingStudios.length > 0) {
          console.log('⏳ Waiting 5 seconds before next batch...');
          await this.delay(5000);
        }
      }
      
    } catch (error) {
      console.error('❌ Error processing pending studios:', error.message);
    } finally {
      this.isProcessing = false;
      console.log('✅ Finished processing pending studios');
    }
  }

  /**
   * Geocode a single studio
   */
  async geocodeStudio(studioId) {
    try {
      // Fetch studio data
      const studio = await prisma.studio.findUnique({
        where: { id: studioId }
      });

      if (!studio) {
        console.log(`⚠️ Studio ${studioId} not found`);
        return;
      }

      // Check if studio needs geocoding
      if (this.studioNeedsGeocoding(studio)) {
        console.log(`🌍 Geocoding studio: ${studio.title}`);
        
        // Construct full address
        const fullAddress = this.constructFullAddress(studio);
        console.log(`📍 Address: ${fullAddress}`);
        
        // Geocode the address
        const geocodeResult = await this.geocodeAddress(fullAddress);
        
        if (geocodeResult.success && !geocodeResult.fallback) {
          // Update studio coordinates using raw SQL with proper PostgreSQL syntax
          await prisma.$executeRaw`
            UPDATE "studios" 
            SET "latitude" = ${geocodeResult.location.lat}, 
                "longitude" = ${geocodeResult.location.lng}, 
                "updated_at" = NOW() 
            WHERE "id" = ${studioId}
          `;
          
          console.log(`✅ Updated: ${studio.title} → ${geocodeResult.location.lat}, ${geocodeResult.location.lng}`);
        } else if (geocodeResult.fallback) {
          console.log(`⚠️ Using fallback coordinates for: ${studio.title}`);
        } else {
          console.log(`❌ Geocoding failed for: ${studio.title} - ${geocodeResult.error}`);
        }
      } else {
        console.log(`ℹ️ Studio ${studio.title} already has coordinates`);
      }
      
    } catch (error) {
      console.error(`❌ Error geocoding studio ${studioId}:`, error.message);
    }
  }

  /**
   * Check if studio needs geocoding
   */
  studioNeedsGeocoding(studio) {
    const hasNoCoordinates = !studio.latitude || !studio.longitude;
    const hasFallbackCoordinates = studio.latitude === 45.5017 && studio.longitude === -73.5673;
    const hasAddress = studio.address && studio.city;
    
    return (hasNoCoordinates || hasFallbackCoordinates) && hasAddress;
  }

  /**
   * Construct full address from studio data
   */
  constructFullAddress(studio) {
    const parts = [];
    
    if (studio.address) parts.push(studio.address);
    if (studio.city) parts.push(studio.city);
    if (studio.state) parts.push(studio.state);
    if (studio.zipCode) parts.push(studio.zipCode);
    if (studio.country) parts.push(studio.country);
    
    return parts.join(', ');
  }

  /**
   * Geocode address with retry logic
   */
  async geocodeAddress(address) {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.post(`${process.env.API_BASE_URL || 'http://localhost:3001'}/api/geocoding/geocode`, {
          address: address
        });
        
        return response.data;
      } catch (error) {
        if (error.response?.data?.error?.includes('Too many requests')) {
          console.log(`⚠️ Rate limit hit (attempt ${attempt}/${this.maxRetries})`);
          
          if (attempt === this.maxRetries) {
            return {
              success: false,
              error: 'Rate limit exceeded after retries'
            };
          }
          
          // Wait longer on rate limit (exponential backoff)
          const waitTime = 30000 * attempt; // 30s, 60s, 90s
          console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
          await this.delay(waitTime);
        } else {
          return {
            success: false,
            error: error.response?.data?.error || error.message
          };
        }
      }
    }
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get processing status
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      pendingCount: this.pendingStudios.length,
      pendingStudios: this.pendingStudios
    };
  }

  /**
   * Clear pending queue (for admin purposes)
   */
  clearPendingQueue() {
    this.pendingStudios = [];
    console.log('🗑️ Cleared pending studios queue');
  }
}

// Create singleton instance
const studioGeocodingTrigger = new StudioGeocodingTrigger();

module.exports = studioGeocodingTrigger; 