const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const contentFilter = require('../utils/contentFilter');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    }
  }
});

/**
 * @route   POST /api/reviews/upload-image
 * @desc    Upload image for review
 * @access  Private (CLIENT, ARTIST roles)
 */
router.post('/upload-image', protect, authorize('CLIENT', 'ARTIST'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // For now, we'll return a placeholder URL since we don't have cloud storage configured
    // In production, you would upload to Cloudinary, AWS S3, or similar
    const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // Alternative: Generate a unique filename and save to local storage
    // const filename = `review-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(req.file.originalname)}`;
    // const filepath = path.join(__dirname, '../../uploads/reviews', filename);
    // await fs.promises.writeFile(filepath, req.file.buffer);
    // const imageUrl = `/uploads/reviews/${filename}`;

    res.json({
      success: true,
      data: {
        imageUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// Content filtering is now handled by the shared contentFilter utility

// Rate limiting for review creation
const reviewRateLimit = new Map();

const checkRateLimit = (userId) => {
  const now = Date.now();
  const userReviews = reviewRateLimit.get(userId) || [];
  
  // Remove reviews older than 24 hours
  const recentReviews = userReviews.filter(time => now - time < 24 * 60 * 60 * 1000);
  
  // Limit to 3 reviews per 24 hours
  if (recentReviews.length >= 3) {
    return false;
  }
  
  // Add current review time
  recentReviews.push(now);
  reviewRateLimit.set(userId, recentReviews);
  return true;
};

/**
 * @route   GET /api/reviews
 * @desc    Get reviews with filtering and moderation
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
    .withMessage('Rating must be between 1 and 5'),
  query('sort')
    .optional()
    .isIn(['newest', 'oldest', 'rating', 'helpful'])
    .withMessage('Sort must be newest, oldest, rating, or helpful')
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
      rating,
      sort = 'newest'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause with moderation
    const where = {
      isHidden: false,
      isApproved: true // Only show approved reviews
    };

    if (recipientId) {
      where.recipientId = recipientId;
    }

    if (rating) {
      where.rating = parseInt(rating);
    }

    // Determine sort order
    let orderBy = {};
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'helpful':
        // For now, sort by rating as helpful votes aren't implemented yet
        orderBy = { rating: 'desc' };
        break;
      default: // newest
        orderBy = { createdAt: 'desc' };
    }

    // Get reviews with enhanced data
    const reviews = await prisma.review.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            createdAt: true // For account age verification
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
      orderBy
    });

    // Get total count for pagination
    const total = await prisma.review.count({ where });

    // Calculate average rating for the recipient if specified
    let averageRating = null;
    if (recipientId) {
      const ratingStats = await prisma.review.aggregate({
        where: { ...where, recipientId },
        _avg: { rating: true },
        _count: { rating: true }
      });
      averageRating = {
        average: ratingStats._avg.rating,
        count: ratingStats._count.rating
      };
    }

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        },
        averageRating
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
 * @desc    Create a new review with enhanced validation and moderation
 * @access  Private (CLIENT, ARTIST roles)
 */
router.post('/', protect, authorize('CLIENT', 'ARTIST'), [
  body('recipientId')
    .isString()
    .withMessage('Recipient ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,!?()]+$/)
    .withMessage('Title contains invalid characters'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
    .matches(/^[a-zA-Z0-9\s\-_.,!?()@#$%&*+=<>[\]{}|\\/:;"'`~]+$/)
    .withMessage('Comment contains invalid characters'),
  body('images')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Maximum 5 images allowed'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Invalid image URL')
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

    // Rate limiting check
    if (!checkRateLimit(req.user.id)) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. You can only submit 3 reviews per 24 hours.'
      });
    }

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

    if (recipient.role !== 'ARTIST' && recipient.role !== 'ARTIST_ADMIN') {
      return res.status(400).json({
        success: false,
        error: 'Can only review artists'
      });
    }

    // Prevent self-reviews
    if (req.user.id === recipientId) {
      return res.status(400).json({
        success: false,
        error: 'You cannot review yourself'
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

    // Content moderation checks
    const moderationFlags = [];
    let requiresModeration = false;

    // Check title content
    if (title) {
      const titleCheck = contentFilter.checkContent(title);
      if (!titleCheck.isValid) {
        moderationFlags.push('SPAM_TITLE');
        requiresModeration = true;
      }
    }

    // Check comment content
    if (comment) {
      const commentCheck = contentFilter.checkContent(comment);
      if (!commentCheck.isValid) {
        moderationFlags.push('SPAM_COMMENT');
        requiresModeration = true;
      }
    }

    // Check for inappropriate content (legacy check)
    if (contentFilter.isInappropriate(title) || contentFilter.isInappropriate(comment)) {
      moderationFlags.push('INAPPROPRIATE_CONTENT');
      requiresModeration = true;
    }

    // Check for shouting
    if (contentFilter.isShouting(title) || contentFilter.isShouting(comment)) {
      moderationFlags.push('EXCESSIVE_CAPS');
    }

    // Check for repetitive content
    if (contentFilter.isRepetitive(title) || contentFilter.isRepetitive(comment)) {
      moderationFlags.push('REPETITIVE_CONTENT');
    }

    // Check for suspicious rating patterns
    const userReviews = await prisma.review.findMany({
      where: { authorId: req.user.id },
      select: { rating: true }
    });

    if (userReviews.length > 0) {
      const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
      const ratingDiff = Math.abs(rating - avgRating);
      
      if (ratingDiff > 3) {
        moderationFlags.push('SUSPICIOUS_RATING');
        requiresModeration = true;
      }
    }

    // Check account age (new accounts are more likely to be fake)
    const accountAge = Date.now() - new Date(req.user.createdAt).getTime();
    const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);
    
    if (accountAgeDays < 1) { // Less than 1 day old
      moderationFlags.push('NEW_ACCOUNT');
      requiresModeration = true;
    }

    // Create review with moderation status
    const review = await prisma.review.create({
      data: {
        authorId: req.user.id,
        recipientId,
        rating,
        title: title || null,
        comment: comment || null,
        images,
        isApproved: !requiresModeration, // Auto-approve if no flags
        isVerified: false // Will be verified by admin if needed
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

    // Log moderation flags if any
    if (moderationFlags.length > 0) {
      console.log(`Review ${review.id} flagged for moderation:`, moderationFlags);
      
      // Create admin action log entry
      await prisma.adminAction.create({
        data: {
          adminId: req.user.id, // Using author as admin for logging
          action: 'REVIEW_FLAGGED',
          targetType: 'REVIEW',
          targetId: review.id,
          details: `Review flagged for moderation: ${moderationFlags.join(', ')}`
        }
      });
    }

    // Send notification to artist if review is approved
    if (!requiresModeration && emailService.isConfigured()) {
      try {
        await emailService.sendReviewNotification({
          to: recipient.email,
          artistName: `${recipient.firstName} ${recipient.lastName}`,
          reviewerName: `${req.user.firstName} ${req.user.lastName}`,
          rating,
          title,
          comment
        });
      } catch (emailError) {
        console.error('Failed to send review notification:', emailError);
      }
    }

    res.status(201).json({
      success: true,
      message: requiresModeration 
        ? 'Review submitted and pending moderation' 
        : 'Review created successfully',
      data: { 
        review,
        moderationFlags: moderationFlags.length > 0 ? moderationFlags : undefined
      }
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