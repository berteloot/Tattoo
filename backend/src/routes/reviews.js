const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const emailService = require('../utils/emailService');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/reviews
 * @desc    Get reviews with filtering
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
  query('recipientId')
    .optional()
    .isString()
    .withMessage('Recipient ID must be a string'),
  query('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5')
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
      limit = 10,
      recipientId,
      rating
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      isHidden: false
    };

    if (recipientId) {
      where.recipientId = recipientId;
    }

    if (rating) {
      where.rating = parseInt(rating);
    }

    // Get reviews
    const reviews = await prisma.review.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    // Get total count for pagination
    const total = await prisma.review.count({ where });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching reviews'
    });
  }
});

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private (CLIENT role)
 */
router.post('/', protect, authorize('CLIENT'), [
  body('recipientId')
    .isString()
    .withMessage('Recipient ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
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

    const { recipientId, rating, title, comment, images = [] } = req.body;

    // Check if recipient exists and is an artist
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      include: {
        artistProfile: true
      }
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found'
      });
    }

    if (recipient.role !== 'ARTIST') {
      return res.status(400).json({
        success: false,
        error: 'Can only review artists'
      });
    }

    // Check if user has already reviewed this artist
    const existingReview = await prisma.review.findUnique({
      where: {
        authorId_recipientId: {
          authorId: req.user.id,
          recipientId
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this artist'
      });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        authorId: req.user.id,
        recipientId,
        rating,
        title,
        comment,
        images
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: { review }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating review'
    });
  }
});

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update review
 * @access  Private (author only)
 */
router.put('/:id', protect, [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array')
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

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    if (existingReview.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this review'
      });
    }

    const { rating, title, comment, images } = req.body;

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(rating !== undefined && { rating }),
        ...(title !== undefined && { title }),
        ...(comment !== undefined && { comment }),
        ...(images !== undefined && { images })
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review: updatedReview }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating review'
    });
  }
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review
 * @access  Private (author only)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    if (existingReview.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this review'
      });
    }

    await prisma.review.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting review'
    });
  }
});

module.exports = router; 