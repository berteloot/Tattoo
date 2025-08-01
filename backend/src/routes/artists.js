const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
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
router.post('/', protect, authorize('ARTIST', 'ARTIST_ADMIN'), [
  body('bio')
    .trim()
    .notEmpty()
    .withMessage('Bio is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Bio must be between 10 and 1000 characters'),
  body('studioName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Studio name must be less than 100 characters'),
  body('website')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(value)) {
          throw new Error('Website must be a valid URL starting with http:// or https://');
        }
      }
      return true;
    })
    .withMessage('Website must be a valid URL'),
  body('instagram')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Instagram handle must be less than 50 characters'),
  body('calendlyUrl')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(value)) {
          throw new Error('Calendly URL must be a valid URL starting with http:// or https://');
        }
      }
      return true;
    })
    .withMessage('Calendly URL must be a valid URL'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),
  body('zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code must be less than 20 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters'),
  body('latitude')
    .optional()
    .custom((value) => {
      if (value && value.toString().trim() !== '') {
        const num = parseFloat(value);
        if (isNaN(num) || num < -90 || num > 90) {
          throw new Error('Latitude must be between -90 and 90');
        }
      }
      return true;
    })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .custom((value) => {
      if (value && value.toString().trim() !== '') {
        const num = parseFloat(value);
        if (isNaN(num) || num < -180 || num > 180) {
          throw new Error('Longitude must be between -180 and 180');
        }
      }
      return true;
    })
    .withMessage('Longitude must be between -180 and 180'),
  body('hourlyRate')
    .optional()
    .custom((value) => {
      if (value && value.toString().trim() !== '') {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
          throw new Error('Hourly rate must be a positive number');
        }
      }
      return true;
    })
    .withMessage('Hourly rate must be a positive number'),
  body('minPrice')
    .optional()
    .custom((value) => {
      if (value && value.toString().trim() !== '') {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
          throw new Error('Minimum price must be a positive number');
        }
      }
      return true;
    })
    .withMessage('Minimum price must be a positive number'),
  body('maxPrice')
    .optional()
    .custom((value) => {
      if (value && value.toString().trim() !== '') {
        const num = parseFloat(value);
        if (isNaN(num) || num < 0) {
          throw new Error('Maximum price must be a positive number');
        }
      }
      return true;
    })
    .withMessage('Maximum price must be a positive number'),
  body('specialtyIds')
    .optional()
    .isArray()
    .withMessage('Specialty IDs must be an array'),
  body('serviceIds')
    .optional()
    .isArray()
    .withMessage('Service IDs must be an array')
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

    const {
      bio,
      studioName,
      website,
      instagram,
      calendlyUrl,
      address,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude,
      hourlyRate,
      minPrice,
      maxPrice,
      specialtyIds = [],
      serviceIds = []
    } = req.body;

    const artistProfile = await prisma.artistProfile.create({
      data: {
        userId: req.user.id,
        bio: bio?.trim() || null,
        studioName: studioName?.trim() || null,
        website: website?.trim() || null,
        instagram: instagram?.trim() || null,
        calendlyUrl: calendlyUrl?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        state: state?.trim() || null,
        zipCode: zipCode?.trim() || null,
        country: country?.trim() || null,
        latitude: latitude && latitude.toString().trim() !== '' ? parseFloat(latitude) : null,
        longitude: longitude && longitude.toString().trim() !== '' ? parseFloat(longitude) : null,
        hourlyRate: hourlyRate && hourlyRate.toString().trim() !== '' ? parseFloat(hourlyRate) : null,
        minPrice: minPrice && minPrice.toString().trim() !== '' ? parseFloat(minPrice) : null,
        maxPrice: maxPrice && maxPrice.toString().trim() !== '' ? parseFloat(maxPrice) : null,
        specialties: {
          connect: specialtyIds.map(id => ({ id }))
        },
        services: {
          connect: serviceIds.map(id => ({ id }))
        }
      },
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
router.put('/:id', protect, authorize('ARTIST', 'ARTIST_ADMIN'), [
  body('bio')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Bio must be less than 1000 characters'),
  body('studioName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Studio name must be less than 100 characters'),
  body('website')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(value)) {
          throw new Error('Website must be a valid URL starting with http:// or https://');
        }
      }
      return true;
    })
    .withMessage('Website must be a valid URL'),
  body('instagram')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Instagram handle must be less than 50 characters'),
  body('calendlyUrl')
    .optional()
    .custom((value) => {
      if (value && value.trim() !== '') {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(value)) {
          throw new Error('Calendly URL must be a valid URL starting with http:// or https://');
        }
      }
      return true;
    })
    .withMessage('Calendly URL must be a valid URL'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must be less than 200 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be less than 100 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be less than 100 characters'),
  body('zipCode')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Zip code must be less than 20 characters'),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must be less than 100 characters'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  body('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  body('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  body('specialtyIds')
    .optional()
    .isArray()
    .withMessage('Specialty IDs must be an array'),
  body('serviceIds')
    .optional()
    .isArray()
    .withMessage('Service IDs must be an array')
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

    const {
      bio,
      studioName,
      website,
      instagram,
      calendlyUrl,
      address,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude,
      hourlyRate,
      minPrice,
      maxPrice,
      specialtyIds,
      serviceIds
    } = req.body;

    const updatedProfile = await prisma.artistProfile.update({
      where: { id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(studioName !== undefined && { studioName }),
        ...(website !== undefined && { website }),
        ...(instagram !== undefined && { instagram }),
        ...(calendlyUrl !== undefined && { calendlyUrl }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(zipCode !== undefined && { zipCode }),
        ...(country !== undefined && { country }),
        ...(latitude !== undefined && { latitude: parseFloat(latitude) }),
        ...(longitude !== undefined && { longitude: parseFloat(longitude) }),
        ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
        ...(minPrice !== undefined && { minPrice: parseFloat(minPrice) }),
        ...(maxPrice !== undefined && { maxPrice: parseFloat(maxPrice) }),
        ...(specialtyIds !== undefined && {
          specialties: {
            set: specialtyIds.map(id => ({ id }))
          }
        }),
        ...(serviceIds !== undefined && {
          services: {
            set: serviceIds.map(id => ({ id }))
          }
        })
      },
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
    res.status(500).json({
      success: false,
      error: 'Server error while updating artist profile'
    });
  }
});

module.exports = router; 