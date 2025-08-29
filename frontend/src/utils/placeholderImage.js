// Utility functions for handling placeholder images
// Best practice: Use a consistent placeholder system across the app

// The placeholder image URL from the user's request
const PLACEHOLDER_IMAGE_URL = 'https://cdn.zappy.app/2e848430c26afdc6d3ef89f37e722a2e.jpeg';

/**
 * Get the appropriate image source for an artist
 * @param {string} profilePictureUrl - The artist's profile picture URL
 * @param {Object} user - The artist's user object with firstName and lastName
 * @param {string} fallbackType - Type of fallback: 'placeholder' or 'initials'
 * @returns {string} The image source URL
 */
export const getArtistImageSource = (profilePictureUrl, user, fallbackType = 'placeholder') => {
  if (profilePictureUrl && profilePictureUrl.trim() !== '') {
    return profilePictureUrl;
  }
  
  if (fallbackType === 'placeholder') {
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
 * Get a consistent placeholder image for any missing artist images
 * @returns {string} The placeholder image URL
 */
export const getPlaceholderImage = () => PLACEHOLDER_IMAGE_URL;
