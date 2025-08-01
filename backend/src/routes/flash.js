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
      where.price = {
        ...where.price,
        gte: parseFloat(minPrice)
      };
    }

    if (maxPrice !== undefined) {
      where.price = {
        ...where.price,
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
router.post('/upload', protect, authorize('ARTIST'), handleUpload, async (req, res) => {
  try {
    // Upload image to Cloudinary
    const uploadResult = await uploadImage(req.uploadedFile.buffer, 'flash');
    
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
router.post('/', protect, authorize('ARTIST'), [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('imageUrl')
    .notEmpty()
    .withMessage('Image URL is required'),
  body('imagePublicId')
    .optional()
    .isString()
    .withMessage('Image public ID must be a string'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
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
      price,
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
        price: price ? parseFloat(price) : null,
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
router.put('/:id', protect, authorize('ARTIST'), [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('imageUrl')
    .optional()
    .notEmpty()
    .withMessage('Image URL cannot be empty'),
  body('imagePublicId')
    .optional()
    .isString()
    .withMessage('Image public ID must be a string'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
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
      price,
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
        ...(price !== undefined && { price: parseFloat(price) }),
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
router.delete('/:id', protect, authorize('ARTIST'), async (req, res) => {
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