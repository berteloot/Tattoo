// Utility functions for handling placeholder images
// Best practice: Use a consistent placeholder system across the app

// The placeholder image URL - now using local SVG
const PLACEHOLDER_IMAGE_URL = '/placeholder-artist.svg';

// Fallback placeholder URLs in case the primary one fails
const FALLBACK_PLACEHOLDER_URLS = [
  '/placeholder-artist.svg',
  'https://via.placeholder.com/400x400/3B82F6/FFFFFF?text=Artist',
  'https://via.placeholder.com/400x400/6366F1/FFFFFF?text=Profile'
];

/**
 * Get the appropriate image source for an artist
 * @param {string} profilePictureUrl - The artist's profile picture URL
 * @param {Object} user - The artist's user object with firstName and lastName
 * @param {string} fallbackType - Type of fallback: 'placeholder' or 'initials'
 * @returns {string} The image source URL
 */
export const getArtistImageSource = (profilePictureUrl, user, fallbackType = 'placeholder') => {
  // If artist has a profile picture, use it
  if (profilePictureUrl && profilePictureUrl.trim() !== '') {
    console.log('Using artist profile picture:', profilePictureUrl);
    return profilePictureUrl;
  }
  
  // If no profile picture, use placeholder
  if (fallbackType === 'placeholder') {
    console.log('Using placeholder image for artist:', user?.firstName, user?.lastName);
    return PLACEHOLDER_IMAGE_URL;
  }
  
  // Fallback to initials (for components that prefer text-based fallbacks)
  return null;
};

/**
 * Get artist initials for text-based fallbacks
 * @param {Object} user - The artist's user object
 * @returns {string} The artist's initials
 */
export const getArtistInitials = (user) => {
  if (!user) return '?';
  
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  } else if (firstName) {
    return firstName[0].toUpperCase();
  } else if (lastName) {
    return lastName[0].toUpperCase();
  }
  
  return '?';
};

/**
 * Check if an image URL is valid
 * @param {string} url - The image URL to check
 * @returns {boolean} True if the URL is valid
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Basic URL validation
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get a safe image source with fallback
 * @param {string} profilePictureUrl - The artist's profile picture URL
 * @param {Object} user - The artist's user object
 * @returns {string} A safe image source URL
 */
export const getSafeImageSource = (profilePictureUrl, user) => {
  try {
    // If artist has a valid profile picture, use it
    if (profilePictureUrl && isValidImageUrl(profilePictureUrl)) {
      return profilePictureUrl;
    }
    
    // Otherwise use placeholder
    return PLACEHOLDER_IMAGE_URL;
  } catch (error) {
    console.error('Error getting image source:', error);
    return PLACEHOLDER_IMAGE_URL;
  }
};

/**
 * Get a consistent placeholder image for any missing artist images
 * @returns {string} The placeholder image URL
 */
export const getPlaceholderImage = () => PLACEHOLDER_IMAGE_URL;
