/**
 * Utility functions for processing artist profile data
 * Handles data sanitization, type conversion, and validation
 */

/**
 * Search for existing studio by name
 * @param {string} studioName - Studio name to search for
 * @returns {Object|null} - Studio object if found, null otherwise
 */
async function findStudioByName(studioName) {
  if (!studioName || typeof studioName !== 'string') return null;
  
  try {
    const { prisma } = require('./prisma');
    
    const studio = await prisma.studio.findFirst({
      where: {
        title: {
          equals: studioName.trim(),
          mode: 'insensitive'
        },
        isActive: true
      }
    });
    
    return studio;
  } catch (error) {
    console.error('Error searching for studio:', error);
    return null;
  }
}

// Export the function
module.exports.findStudioByName = findStudioByName;

/**
 * Sanitize and process artist profile data for database operations
 * @param {Object} data - Raw form data
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} - Processed data ready for database
 */
const processArtistData = (data, isUpdate = false) => {
  const processed = {};

  // Helper function to safely parse numbers
  const safeParseFloat = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  // Helper function to safely trim strings
  const safeTrim = (value) => {
    if (value === null || value === undefined) return null;
    const trimmed = value.toString().trim();
    return trimmed === '' ? null : trimmed;
  };

  // Process text fields
  if (data.bio !== undefined) {
    processed.bio = safeTrim(data.bio);
    // For updates, allow empty bio if it's being cleared
    if (!isUpdate && (!processed.bio || processed.bio.length < 10)) {
      throw new Error('Bio is required and must be at least 10 characters long');
    }
  }

  if (data.studioName !== undefined) {
    processed.studioName = safeTrim(data.studioName);
  }

  // Remove studioId processing since it doesn't exist in the schema
  // if (data.studioId !== undefined) {
  //   processed.studioId = safeTrim(data.studioId);
  // }

  if (data.website !== undefined) {
    processed.website = safeTrim(data.website);
  }

  if (data.instagram !== undefined) {
    processed.instagram = safeTrim(data.instagram);
  }

  if (data.facebook !== undefined) {
    processed.facebook = safeTrim(data.facebook);
  }

  if (data.twitter !== undefined) {
    processed.twitter = safeTrim(data.twitter);
  }

  if (data.youtube !== undefined) {
    processed.youtube = safeTrim(data.youtube);
  }

  if (data.linkedin !== undefined) {
    processed.linkedin = safeTrim(data.linkedin);
  }

  if (data.pinterest !== undefined) {
    processed.pinterest = safeTrim(data.pinterest);
  }

  if (data.calendlyUrl !== undefined) {
    processed.calendlyUrl = safeTrim(data.calendlyUrl);
  }

  if (data.address !== undefined) {
    processed.address = safeTrim(data.address);
  }

  if (data.city !== undefined) {
    processed.city = safeTrim(data.city);
  }

  if (data.state !== undefined) {
    processed.state = safeTrim(data.state);
  }

  if (data.zipCode !== undefined) {
    processed.zipCode = safeTrim(data.zipCode);
  }

  if (data.country !== undefined) {
    processed.country = safeTrim(data.country);
  }

  // Process numeric fields
  if (data.latitude !== undefined) {
    processed.latitude = safeParseFloat(data.latitude);
  }

  if (data.longitude !== undefined) {
    processed.longitude = safeParseFloat(data.longitude);
  }

  if (data.hourlyRate !== undefined) {
    processed.hourlyRate = safeParseFloat(data.hourlyRate);
  }

  if (data.minPrice !== undefined) {
    processed.minPrice = safeParseFloat(data.minPrice);
  }

  if (data.maxPrice !== undefined) {
    processed.maxPrice = safeParseFloat(data.maxPrice);
  }

  // Process profile picture fields
  if (data.profilePictureUrl !== undefined) {
    processed.profilePictureUrl = safeTrim(data.profilePictureUrl);
  }
  if (data.profilePicturePublicId !== undefined) {
    processed.profilePicturePublicId = safeTrim(data.profilePicturePublicId);
  }
  if (data.profilePictureWidth !== undefined) {
    processed.profilePictureWidth = parseInt(data.profilePictureWidth) || null;
  }
  if (data.profilePictureHeight !== undefined) {
    processed.profilePictureHeight = parseInt(data.profilePictureHeight) || null;
  }
  if (data.profilePictureFormat !== undefined) {
    processed.profilePictureFormat = safeTrim(data.profilePictureFormat);
  }
  if (data.profilePictureBytes !== undefined) {
    processed.profilePictureBytes = parseInt(data.profilePictureBytes) || null;
  }

  // Process arrays
  if (data.specialtyIds !== undefined) {
    processed.specialtyIds = Array.isArray(data.specialtyIds) ? data.specialtyIds : [];
  }

  if (data.serviceIds !== undefined) {
    processed.serviceIds = Array.isArray(data.serviceIds) ? data.serviceIds : [];
  }

  return processed;
};

/**
 * Create Prisma data object for artist profile creation
 * @param {Object} processedData - Processed form data
 * @param {string} userId - User ID
 * @returns {Object} - Prisma data object
 */
const createArtistProfileData = (processedData, userId) => {
  return {
    userId,
    bio: processedData.bio,
    studioName: processedData.studioName,
    // Remove studioId since it doesn't exist in the schema
    // studioId: processedData.studioId, // Add studioId for linking
    website: processedData.website,
    instagram: processedData.instagram,
    facebook: processedData.facebook,
    twitter: processedData.twitter,
    youtube: processedData.youtube,
    linkedin: processedData.linkedin,
    calendlyUrl: processedData.calendlyUrl,
    address: processedData.address,
    city: processedData.city,
    state: processedData.state,
    zipCode: processedData.zipCode,
    country: processedData.country,
    latitude: processedData.latitude,
    longitude: processedData.longitude,
    hourlyRate: processedData.hourlyRate,
    minPrice: processedData.minPrice,
    maxPrice: processedData.maxPrice,
    // Profile picture fields
    profilePictureUrl: processedData.profilePictureUrl,
    profilePicturePublicId: processedData.profilePicturePublicId,
    profilePictureWidth: processedData.profilePictureWidth,
    profilePictureHeight: processedData.profilePictureHeight,
    profilePictureFormat: processedData.profilePictureFormat,
    profilePictureBytes: processedData.profilePictureBytes,
    specialties: processedData.specialtyIds && processedData.specialtyIds.length > 0 ? {
      connect: processedData.specialtyIds.map(id => ({ id }))
    } : undefined,
    services: processedData.serviceIds && processedData.serviceIds.length > 0 ? {
      connect: processedData.serviceIds.map(id => ({ id }))
    } : undefined
  };
};

/**
 * Create Prisma data object for artist profile update
 * @param {Object} processedData - Processed form data
 * @returns {Object} - Prisma data object
 */
const updateArtistProfileData = (processedData) => {
  const updateData = {};

  // Only include fields that are defined (not undefined)
  if (processedData.bio !== undefined) updateData.bio = processedData.bio;
  if (processedData.studioName !== undefined) updateData.studioName = processedData.studioName;
  // Remove studioId since it doesn't exist in the schema
  // if (processedData.studioId !== undefined) updateData.studioId = processedData.studioId;
  if (processedData.website !== undefined) updateData.website = processedData.website;
  if (processedData.instagram !== undefined) updateData.instagram = processedData.instagram;
  if (processedData.facebook !== undefined) updateData.facebook = processedData.facebook;
  if (processedData.twitter !== undefined) updateData.twitter = processedData.twitter;
  if (processedData.youtube !== undefined) updateData.youtube = processedData.youtube;
  if (processedData.linkedin !== undefined) updateData.linkedin = processedData.linkedin;
  if (processedData.calendlyUrl !== undefined) updateData.calendlyUrl = processedData.calendlyUrl;
  if (processedData.address !== undefined) updateData.address = processedData.address;
  if (processedData.city !== undefined) updateData.city = processedData.city;
  if (processedData.state !== undefined) updateData.state = processedData.state;
  if (processedData.zipCode !== undefined) updateData.zipCode = processedData.zipCode;
  if (processedData.country !== undefined) updateData.country = processedData.country;
  if (processedData.latitude !== undefined) updateData.latitude = processedData.latitude;
  if (processedData.longitude !== undefined) updateData.longitude = processedData.longitude;
  if (processedData.hourlyRate !== undefined) updateData.hourlyRate = processedData.hourlyRate;
  if (processedData.minPrice !== undefined) updateData.minPrice = processedData.minPrice;
  if (processedData.maxPrice !== undefined) updateData.maxPrice = processedData.maxPrice;

  // Profile picture fields
  if (processedData.profilePictureUrl !== undefined) updateData.profilePictureUrl = processedData.profilePictureUrl;
  if (processedData.profilePicturePublicId !== undefined) updateData.profilePicturePublicId = processedData.profilePicturePublicId;
  if (processedData.profilePictureWidth !== undefined) updateData.profilePictureWidth = processedData.profilePictureWidth;
  if (processedData.profilePictureHeight !== undefined) updateData.profilePictureHeight = processedData.profilePictureHeight;
  if (processedData.profilePictureFormat !== undefined) updateData.profilePictureFormat = processedData.profilePictureFormat;
  if (processedData.profilePictureBytes !== undefined) updateData.profilePictureBytes = processedData.profilePictureBytes;

  // Handle relationships
  if (processedData.specialtyIds !== undefined && processedData.specialtyIds.length > 0) {
    updateData.specialties = {
      set: processedData.specialtyIds.map(id => ({ id }))
    };
  }

  if (processedData.serviceIds !== undefined && processedData.serviceIds.length > 0) {
    updateData.services = {
      set: processedData.serviceIds.map(id => ({ id }))
    };
  }

  return updateData;
};

module.exports = {
  processArtistData,
  createArtistProfileData,
  updateArtistProfileData,
  findStudioByName
}; 