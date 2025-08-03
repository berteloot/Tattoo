const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateArtistProfile } = require('../middleware/artistValidation');
const { processArtistData, createArtistProfileData, updateArtistProfileData } = require('../utils/artistDataProcessor');
const emailService = require('../utils/emailService');
const { prisma } = require('../utils/prisma');

const router = express.Router();

/**
 * @route   GET /api/artists
 * @desc    Get all artists with filtering and pagination
 * @access  Public
 */
router.get('/', optionalAuth, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('specialty')
    .optional()
    .isString()
    .withMessage('Specialty must be a string'),
  query('city')
    .optional()
    .isString()
    .withMessage('City must be a string'),
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Min rating must be between 0 and 5'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  query('lat')
    .optional()
    .isFloat()
    .withMessage('Latitude must be a number'),
  query('lng')
    .optional()
    .isFloat()
    .withMessage('Longitude must be a number'),
  query('radius')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Radius must be a positive number'),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean')
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
      specialty,
      city,
      minRating,
      maxPrice,
      lat,
      lng,
      radius,
      featured
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Test database connection
    try {
      await prisma.$connect();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Database connection failed'
      });
    }

    // Build where clause
    const where = {
      user: {
        role: 'ARTIST',
        isActive: true
      },
      isVerified: true
    };

    if (specialty) {
      where.specialties = {
        some: {
          name: {
            contains: specialty,
            mode: 'insensitive'
          }
        }
      };
    }

    if (city) {
      where.city = {
        contains: city,
        mode: 'insensitive'
      };
    }

    if (maxPrice) {
      where.OR = [
        { maxPrice: { lte: parseFloat(maxPrice) } },
        { hourlyRate: { lte: parseFloat(maxPrice) } }
      ];
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Get artists with their basic info and average rating
    const artists = await prisma.artistProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        specialties: {
          select: {
            id: true,
            name: true,
            category: true
          }
        },
        services: {
          select: {
            id: true,
            name: true,
            price: true
          }
        },
        _count: {
          select: {
            flash: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate average ratings for each artist
    const artistsWithRatings = await Promise.all(
      artists.map(async (artist) => {
        const reviews = await prisma.review.findMany({
          where: {
            recipientId: artist.user.id,
            isHidden: false
          },
          select: {
            rating: true
          }
        });

        const averageRating = reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          : 0;

        return {
          ...artist,
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: reviews.length
        };
      })
    );

    // Filter by minimum rating if specified
    const filteredArtists = minRating
      ? artistsWithRatings.filter(artist => artist.averageRating >= parseFloat(minRating))
      : artistsWithRatings;

    // Get total count for pagination
    const total = await prisma.artistProfile.count({ where });

    res.json({
      success: true,
      data: {
        artists: filteredArtists,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get artists error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    res.status(500).json({
      success: false,
      error: 'Server error while fetching artists'
    });
  }
});

/**
 * @route   GET /api/artists/:id
 * @desc    Get artist by ID with full profile
 * @access  Public
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const artist = await prisma.artistProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            createdAt: true
          }
        },
        specialties: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true
          }
        },
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true
          }
        },
        flash: {
          where: { isAvailable: true },
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            basePrice: true,
            tags: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        _count: {
          select: {
            flash: true
          }
        }
      }
    });

    if (!artist) {
      return res.status(404).json({
        success: false,
        error: 'Artist not found'
      });
    }

    // Get reviews
    const reviews = await prisma.review.findMany({
      where: {
        recipientId: artist.user.id,
        isHidden: false
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      data: {
        artist: {
          ...artist,
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: reviews.length
        },
        reviews
      }
    });
  } catch (error) {
    console.error('Get artist error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching artist'
    });
  }
});

/**
 * @route   POST /api/artists
 * @desc    Create artist profile
 * @access  Private (ARTIST role)
 */
router.post('/', protect, authorize('ARTIST', 'ARTIST_ADMIN'), validateArtistProfile(false), async (req, res) => {
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

    // Check if artist profile already exists
    const existingProfile = await prisma.artistProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: 'Artist profile already exists'
      });
    }

    // Process and validate the form data
    const processedData = processArtistData(req.body, false);
    
    // Create the artist profile data object
    const profileData = createArtistProfileData(processedData, req.user.id);

    const artistProfile = await prisma.artistProfile.create({
      data: profileData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        specialties: {
          select: {
            id: true,
            name: true,
            description: true,
            category: true
          }
        },
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Artist profile created successfully',
      data: { artistProfile }
    });
  } catch (error) {
    console.error('Create artist profile error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    
    // Handle specific validation errors from our processor
    if (error.message.includes('Bio is required') || error.message.includes('City is required')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while creating artist profile'
    });
  }
});

/**
 * @route   PUT /api/artists/:id
 * @desc    Update artist profile
 * @access  Private (ARTIST role, owner only)
 */
router.put('/:id', protect, validateArtistProfile(true), async (req, res) => {
  try {
    // Validation is now handled by the middleware

    const { id } = req.params;

    // Check if artist profile exists and belongs to user
    const existingProfile = await prisma.artistProfile.findUnique({
      where: { id }
    });

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    if (existingProfile.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this profile'
      });
    }

    // Process and validate the form data
    const processedData = processArtistData(req.body, true);
    
    // Create the update data object
    const updateData = updateArtistProfileData(processedData);

    const updatedProfile = await prisma.artistProfile.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        specialties: true,
        services: true
      }
    });

    res.json({
      success: true,
      message: 'Artist profile updated successfully',
      data: { artistProfile: updatedProfile }
    });
  } catch (error) {
    console.error('Update artist profile error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      profileId: req.params.id
    });
    
    // Handle specific validation errors from our processor
    if (error.message.includes('Bio is required') || error.message.includes('City is required')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error while updating artist profile'
    });
  }
});

/**
 * @route   POST /api/artists/:id/view
 * @desc    Track page view for artist profile
 * @access  Public
 */
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if artist profile exists
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            isActive: true
          }
        }
      }
    });

    if (!artistProfile) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Check if the user is active
    if (!artistProfile.user.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not available'
      });
    }

    // Update last viewed timestamp (profileViews column doesn't exist)
    const updatedProfile = await prisma.artistProfile.update({
      where: { id },
      data: {
        lastViewedAt: new Date()
      },
      select: {
        id: true,
        lastViewedAt: true
      }
    });

    console.log(`📊 Profile view tracked for artist ${id}`);

    res.json({
      success: true,
      message: 'Profile view tracked successfully',
      data: {
        lastViewedAt: updatedProfile.lastViewedAt
      }
    });
  } catch (error) {
    console.error('Track profile view error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while tracking profile view'
    });
  }
});

module.exports = router; 