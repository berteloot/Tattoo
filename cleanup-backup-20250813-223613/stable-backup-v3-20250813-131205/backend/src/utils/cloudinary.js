const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary with optimization
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} folder - The folder to upload to (e.g., 'flash', 'profiles')
 * @param {Object} options - Additional options for transformation
 * @returns {Promise<Object>} Upload result with URL and public_id
 */
const uploadImage = async (fileBuffer, folder = 'flash', options = {}) => {
  try {
    const uploadOptions = {
      folder: `tattoo-app/${folder}`,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit' }, // Max dimensions
        { quality: 'auto', fetch_format: 'auto' }, // Auto optimize
        { strip: true } // Remove metadata
      ],
      ...options
    };

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(fileBuffer);
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Generate optimized URL for different use cases
 * @param {string} publicId - The public ID of the image
 * @param {string} transformation - The transformation to apply
 * @returns {string} Optimized URL
 */
const getOptimizedUrl = (publicId, transformation = '') => {
  return cloudinary.url(publicId, {
    transformation: transformation,
    secure: true
  });
};

/**
 * Generate thumbnail URL for flash items
 * @param {string} publicId - The public ID of the image
 * @returns {string} Thumbnail URL
 */
const getThumbnailUrl = (publicId) => {
  return cloudinary.url(publicId, {
    transformation: [
      { width: 300, height: 300, crop: 'fill', gravity: 'auto' },
      { quality: 'auto', fetch_format: 'auto' }
    ],
    secure: true
  });
};

module.exports = {
  uploadImage,
  deleteImage,
  getOptimizedUrl,
  getThumbnailUrl,
  cloudinary
}; 