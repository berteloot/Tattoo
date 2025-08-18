const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');
const { uploadImage, deleteImage, getThumbnailUrl } = require('../utils/cloudinary');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/flash
 * @desc    Get all flash items with filtering
 * @access  Public
 */
router.get('/', optionalAuth, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('artistId')
    .optional()
    .isString()
    .withMessage('Artist ID must be a string'),
  query('tags')
    .optional()
    .isString()
    .withMessage('Tags must be a string'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  query('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      page = 1,
      limit = 20,
      artistId,
      tags,
      minPrice,
      maxPrice,
      available
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (artistId) {
      where.artistId = artistId;
    }

    if (tags) {
      where.tags = {
        hasSome: tags.split(',').map(tag => tag.trim())
      };
    }

    if (minPrice !== undefined) {
      where.basePrice = {
        ...where.basePrice,
        gte: parseFloat(minPrice)
      };
    }

    if (maxPrice !== undefined) {
      where.basePrice = {
        ...where.basePrice,
        lte: parseFloat(maxPrice)
      };
    }

    if (available !== undefined) {
      where.isAvailable = available === 'true';
    }

    // Get flash items
    const flash = await prisma.flash.findMany({
      where,
      include: {
        artist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    // Get total count for pagination
    const total = await prisma.flash.count({ where });

    res.json({
      success: true,
      data: {
        flash,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get flash error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching flash'
    });
  }
});

/**
 * @route   GET /api/flash/:id
 * @desc    Get flash item by ID
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const flash = await prisma.flash.findUnique({
      where: { id },
      include: {
        artist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                email: true,
                phone: true
              }
            }
          }
        }
      }
    });

    if (!flash) {
      return res.status(404).json({
        success: false,
        error: 'Flash item not found'
      });
    }

    res.json({
      success: true,
      data: { flash }
    });
  } catch (error) {
    console.error('Get flash item error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching flash item'
    });
  }
});

/**
 * @route   POST /api/flash/upload
 * @desc    Upload image for flash item
 * @access  Private (ARTIST role)
 */
router.post('/upload', protect, authorize('ARTIST', 'ARTIST_ADMIN'), handleUpload, async (req, res) => {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary configuration missing');
      return res.status(500).json({
        success: false,
        error: 'Image upload service is not configured. Please contact support.'
      });
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadImage(req.uploadedFile.buffer, 'flash');
    
    if (!uploadResult || !uploadResult.url) {
      throw new Error('Failed to get upload result from Cloudinary');
    }
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageUrl: uploadResult.url,
        imagePublicId: uploadResult.public_id,
        imageWidth: uploadResult.width,
        imageHeight: uploadResult.height,
        imageFormat: uploadResult.format,
        imageBytes: uploadResult.bytes,
        thumbnailUrl: getThumbnailUrl(uploadResult.public_id)
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    
    // Ensure we always return a JSON response
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image'
    });
  }
});

/**
 * @route   POST /api/flash
 * @desc    Create new flash item (supports both URL and file upload)
 * @access  Private (ARTIST role)
 */
router.post('/', protect, authorize('ARTIST', 'ARTIST_ADMIN'), (req, res, next) => {
  console.log('🔍 Flash creation request body:', req.body);
  next();
}, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .custom((value) => {
      if (value === '') return true; // Allow empty strings
      if (value && value.length > 500) {
        throw new Error('Description must be less than 500 characters');
      }
      return true;
    })
    .withMessage('Description must be less than 500 characters'),
  body('imageUrl')
    .notEmpty()
    .withMessage('Image URL is required'),
  body('imagePublicId')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined || value === '') return true; // Allow null/undefined/empty
      if (typeof value === 'string') return true; // Allow strings
      throw new Error('Image public ID must be a string');
    })
    .withMessage('Image public ID must be a string'),
  body('basePrice')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true; // Allow empty/null values
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        throw new Error('Base price must be a positive number');
      }
      return true;
    })
    .withMessage('Base price must be a positive number'),
  body('complexity')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true; // Allow null/undefined
      if (['SIMPLE', 'MEDIUM', 'COMPLEX', 'MASTERPIECE'].includes(value)) return true;
      throw new Error('Complexity must be one of: SIMPLE, MEDIUM, COMPLEX, MASTERPIECE');
    })
    .withMessage('Complexity must be one of: SIMPLE, MEDIUM, COMPLEX, MASTERPIECE'),
  body('timeEstimate')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true; // Allow null/undefined
      const num = parseInt(value);
      if (isNaN(num) || num < 1) {
        throw new Error('Time estimate must be a positive integer');
      }
      return true;
    })
    .withMessage('Time estimate must be a positive integer'),
  body('isRepeatable')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true; // Allow null/undefined
      if (typeof value === 'boolean') return true; // Allow booleans
      throw new Error('isRepeatable must be a boolean');
    })
    .withMessage('isRepeatable must be a boolean'),
  body('sizePricing')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true; // Allow null/undefined
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) return true; // Allow objects
      throw new Error('Size pricing must be an object');
    })
    .withMessage('Size pricing must be an object'),
  body('tags')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true; // Allow null/undefined
      if (Array.isArray(value)) return true; // Allow arrays
      throw new Error('Tags must be an array');
    })
    .withMessage('Tags must be an array'),
  body('isAvailable')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true; // Allow null/undefined
      if (typeof value === 'boolean') return true; // Allow booleans
      throw new Error('isAvailable must be a boolean');
    })
    .withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Flash validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Check if user has an artist profile
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!artistProfile) {
      return res.status(400).json({
        success: false,
        error: 'Artist profile not found. Please create your artist profile first.'
      });
    }

    const {
      title,
      description,
      imageUrl,
      imagePublicId,
      imageWidth,
      imageHeight,
      imageFormat,
      imageBytes,
      basePrice,
      price, // Ignore this field as it's not in the schema
      complexity,
      timeEstimate,
      isRepeatable,
      sizePricing,
      tags = [],
      isAvailable = true
    } = req.body;

    const flash = await prisma.flash.create({
      data: {
        artistId: artistProfile.id,
        title,
        description,
        imageUrl,
        imagePublicId,
        imageWidth,
        imageHeight,
        imageFormat,
        imageBytes,
        basePrice: basePrice ? parseFloat(basePrice) : null,
        complexity: complexity || 'MEDIUM',
        timeEstimate: timeEstimate ? parseInt(timeEstimate) : 120,
        isRepeatable: isRepeatable !== undefined ? isRepeatable : true,
        sizePricing: sizePricing ? JSON.stringify(sizePricing) : null,
        tags,
        isAvailable
      },
      include: {
        artist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Flash item created successfully',
      data: { flash }
    });
  } catch (error) {
    console.error('Create flash error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating flash item'
    });
  }
});

/**
 * @route   PUT /api/flash/:id
 * @desc    Update flash item
 * @access  Private (ARTIST role, owner only)
 */
router.put('/:id', protect, authorize('ARTIST', 'ARTIST_ADMIN'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .custom((value) => {
      if (value === '') return true; // Allow empty strings
      if (value && value.length > 500) {
        throw new Error('Description must be less than 500 characters');
      }
      return true;
    })
    .withMessage('Description must be less than 500 characters'),
  body('imageUrl')
    .optional()
    .notEmpty()
    .withMessage('Image URL cannot be empty'),
  body('imagePublicId')
    .optional()
    .isString()
    .withMessage('Image public ID must be a string'),
  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;

    // Check if flash item exists and belongs to user
    const existingFlash = await prisma.flash.findUnique({
      where: { id },
      include: {
        artist: {
          select: { userId: true }
        }
      }
    });

    if (!existingFlash) {
      return res.status(404).json({
        success: false,
        error: 'Flash item not found'
      });
    }

    if (existingFlash.artist.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this flash item'
      });
    }

    const {
      title,
      description,
      imageUrl,
      imagePublicId,
      imageWidth,
      imageHeight,
      imageFormat,
      imageBytes,
      basePrice,
      tags,
      isAvailable
    } = req.body;

    // If updating image and there's an existing Cloudinary image, delete it
    if (imageUrl && existingFlash.imagePublicId && imagePublicId !== existingFlash.imagePublicId) {
      try {
        await deleteImage(existingFlash.imagePublicId);
      } catch (error) {
        console.error('Failed to delete old image:', error);
        // Continue with update even if deletion fails
      }
    }

    const updatedFlash = await prisma.flash.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(imagePublicId !== undefined && { imagePublicId }),
        ...(imageWidth !== undefined && { imageWidth }),
        ...(imageHeight !== undefined && { imageHeight }),
        ...(imageFormat !== undefined && { imageFormat }),
        ...(imageBytes !== undefined && { imageBytes }),
        ...(basePrice !== undefined && { basePrice: parseFloat(basePrice) }),
        ...(tags !== undefined && { tags }),
        ...(isAvailable !== undefined && { isAvailable })
      },
      include: {
        artist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Flash item updated successfully',
      data: { flash: updatedFlash }
    });
  } catch (error) {
    console.error('Update flash error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating flash item'
    });
  }
});

/**
 * @route   DELETE /api/flash/:id
 * @desc    Delete flash item
 * @access  Private (ARTIST role, owner only)
 */
router.delete('/:id', protect, authorize('ARTIST', 'ARTIST_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if flash item exists and belongs to user
    const existingFlash = await prisma.flash.findUnique({
      where: { id },
      include: {
        artist: {
          select: { userId: true }
        }
      }
    });

    if (!existingFlash) {
      return res.status(404).json({
        success: false,
        error: 'Flash item not found'
      });
    }

    if (existingFlash.artist.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this flash item'
      });
    }

    // Delete image from Cloudinary if it exists
    if (existingFlash.imagePublicId) {
      try {
        await deleteImage(existingFlash.imagePublicId);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
        // Continue with deletion even if image deletion fails
      }
    }

    await prisma.flash.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Flash item deleted successfully'
    });
  } catch (error) {
    console.error('Delete flash error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting flash item'
    });
  }
});

module.exports = router; 