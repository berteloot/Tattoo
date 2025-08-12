const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { validateArtistProfile } = require('../middleware/artistValidation');
const { processArtistData, createArtistProfileData, updateArtistProfileData } = require('../utils/artistDataProcessor');
const emailService = require('../utils/emailService');
const { prisma } = require('../utils/prisma');
const { handleUpload } = require('../middleware/upload');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const { contactInfoLimiter, strictContactLimiter, detectScraping } = require('../middleware/antiScraping');
const contentFilter = require('../utils/contentFilter');

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
        role: {
          in: ['ARTIST', 'ARTIST_ADMIN']
        },
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
        messages: {
          where: {
            isActive: true,
            showOnCard: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          select: {
            id: true,
            title: true,
            content: true,
            priority: true,
            createdAt: true,
            expiresAt: true
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
          ],
          take: 1 // Only show the highest priority message on cards
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
 * @route   GET /api/artists/my-favorites
 * @desc    Get clients who have favorited the current artist
 * @access  Private (ARTIST only)
 */
router.get('/my-favorites', protect, async (req, res) => {
  try {
    const artistId = req.user.artistProfile?.id;

    if (!artistId) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Get all clients who have favorited this artist
    const favorites = await prisma.favorite.findMany({
      where: {
        artistId: artistId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get additional client information
    const clientsWithDetails = await Promise.all(
      favorites.map(async (favorite) => {
        // Get client's review count and average rating given
        const reviewsGiven = await prisma.review.findMany({
          where: {
            authorId: favorite.userId
          }
        });

        const averageRating = reviewsGiven.length > 0
          ? reviewsGiven.reduce((sum, review) => sum + review.rating, 0) / reviewsGiven.length
          : 0;

        return {
          ...favorite,
          client: {
            ...favorite.user,
            reviewCount: reviewsGiven.length,
            averageRating: Math.round(averageRating * 10) / 10,
            favoritedAt: favorite.createdAt
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalClients: clientsWithDetails.length,
        clients: clientsWithDetails
      }
    });
  } catch (error) {
    console.error('Error fetching favorite clients:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching favorite clients'
    });
  }
});

/**
 * @route   POST /api/artists/:id/contact
 * @desc    Send contact email to artist from client
 * @access  Public (with rate limiting)
 */
router.post('/:id/contact', [
  detectScraping,
  strictContactLimiter,
  body('subject').isString().notEmpty().withMessage('Subject is required'),
  body('message').isString().notEmpty().withMessage('Message is required'),
  body('senderName').isString().notEmpty().withMessage('Sender name is required'),
  body('senderEmail').isEmail().withMessage('Valid sender email is required'),
  body('senderPhone').optional().isString().withMessage('Phone must be a string')
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
    const { subject, message, senderName, senderEmail, senderPhone } = req.body;

    // Content filtering and spam detection
    const subjectCheck = contentFilter.checkContent(subject);
    const messageCheck = contentFilter.checkContent(message);
    const nameCheck = contentFilter.checkContent(senderName);

    if (!subjectCheck.isValid) {
      return res.status(400).json({
        success: false,
        error: `Subject ${subjectCheck.issues.join(', ')}. Please revise your message.`
      });
    }

    if (!messageCheck.isValid) {
      return res.status(400).json({
        success: false,
        error: `Message ${messageCheck.issues.join(', ')}. Please revise your message.`
      });
    }

    if (!nameCheck.isValid) {
      return res.status(400).json({
        success: false,
        error: `Name ${nameCheck.issues.join(', ')}. Please use a proper name.`
      });
    }

    // Check for disposable email domains
    if (contentFilter.isDisposableEmail(senderEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Please use a permanent email address. Temporary email services are not allowed.'
      });
    }

    // Get artist information
    const artist = await prisma.artistProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
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

    // Send email to artist
    try {
      const emailResult = await emailService.sendClientToArtistEmail({
        to: artist.user.email,
        artistName: `${artist.user.firstName} ${artist.user.lastName}`,
        clientName: senderName,
        clientEmail: senderEmail,
        clientPhone: senderPhone,
        subject: subject,
        message: message,
        studioName: artist.studioName || 'My Studio'
      });

      if (emailResult.success) {
        res.json({
          success: true,
          message: 'Message sent successfully! The artist will get back to you soon.'
        });
      } else {
        throw new Error(emailResult.error || 'Failed to send email');
      }
    } catch (emailError) {
      console.error('Error sending contact email to artist:', emailError);
      res.status(500).json({
        success: false,
        error: 'Failed to send message. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Error in artist contact endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing contact request'
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
        messages: {
          where: {
            isActive: true,
            showOnProfile: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          },
          select: {
            id: true,
            title: true,
            content: true,
            priority: true,
            createdAt: true,
            expiresAt: true
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
          ]
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
 * @route   GET /api/artists/my-favorites
 * @desc    Get clients who have favorited the current artist
 * @access  Private (ARTIST only)
 */
router.get('/my-favorites', protect, authorize('ARTIST', 'ARTIST_ADMIN'), async (req, res) => {
  try {
    // Handle both direct user object and nested user object
    const user = req.user.user || req.user;
    const artistId = user.artistProfile?.id;

    if (!artistId) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Get all clients who have favorited this artist
    const favorites = await prisma.favorite.findMany({
      where: {
        artistId: artistId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get additional client information
    const clientsWithDetails = await Promise.all(
      favorites.map(async (favorite) => {
        // Get client's review count and average rating given
        const reviewsGiven = await prisma.review.findMany({
          where: {
            authorId: favorite.userId
          }
        });

        const averageRating = reviewsGiven.length > 0
          ? reviewsGiven.reduce((sum, review) => sum + review.rating, 0) / reviewsGiven.length
          : 0;

        return {
          ...favorite,
          client: {
            ...favorite.user,
            reviewCount: reviewsGiven.length,
            averageRating: Math.round(averageRating * 10) / 10,
            favoritedAt: favorite.createdAt
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalClients: clientsWithDetails.length,
        clients: clientsWithDetails
      }
    });
  } catch (error) {
    console.error('Error fetching favorite clients:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching favorite clients'
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

/**
 * @route   GET /api/artists/:id/studios
 * @desc    Get studios for an artist
 * @access  Public
 */
router.get('/:id/studios', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if artist profile exists
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { id }
    });

    if (!artistProfile) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Get studios for this artist
    const studioArtists = await prisma.studioArtist.findMany({
      where: {
        artistId: id,
        isActive: true
      },
      include: {
        studio: {
          select: {
            id: true,
            title: true,
            slug: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            latitude: true,
            longitude: true,
            website: true,
            phoneNumber: true,
            email: true,
            isVerified: true,
            isFeatured: true,
            verificationStatus: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: studioArtists
    });
  } catch (error) {
    console.error('Get artist studios error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching artist studios'
    });
  }
});

/**
 * @route   POST /api/artists/email-favorites
 * @desc    Send email to clients who have favorited the artist
 * @access  Private (ARTIST only)
 */
router.post('/email-favorites', [
  protect,
  authorize('ARTIST', 'ARTIST_ADMIN'),
  body('subject').isString().notEmpty().withMessage('Subject is required'),
  body('message').isString().notEmpty().withMessage('Message is required'),
  body('clientIds').optional().isArray().withMessage('Client IDs must be an array'),
  body('sendToAll').optional().isBoolean().withMessage('Send to all must be a boolean')
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

    // Handle both direct user object and nested user object
    const user = req.user.user || req.user;
    const artistId = user.artistProfile?.id;
    const { subject, message, clientIds, sendToAll = false } = req.body;

    if (!artistId) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Get artist information
    const artist = await prisma.artistProfile.findUnique({
      where: { id: artistId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!artist) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Determine which clients to email
    let targetClients = [];
    
    if (sendToAll) {
      // Get all clients who have favorited this artist
      const allFavorites = await prisma.favorite.findMany({
        where: { artistId: artistId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
      targetClients = allFavorites.map(fav => fav.user);
    } else if (clientIds && clientIds.length > 0) {
      // Get specific clients who have favorited this artist
      const specificFavorites = await prisma.favorite.findMany({
        where: {
          artistId: artistId,
          userId: { in: clientIds }
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
      targetClients = specificFavorites.map(fav => fav.user);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either sendToAll must be true or clientIds must be provided'
      });
    }

    if (targetClients.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No clients found to email'
      });
    }

    // Send emails to each client
    const emailResults = [];
    const artistName = `${artist.user.firstName} ${artist.user.lastName}`;

    for (const client of targetClients) {
      try {
        const emailResult = await emailService.sendArtistToClientEmail({
          to: client.email,
          clientName: `${client.firstName} ${client.lastName}`,
          artistName: artistName,
          artistEmail: artist.user.email,
          subject: subject,
          message: message,
          studioName: artist.studioName || 'My Studio'
        });

        emailResults.push({
          clientId: client.id,
          clientName: `${client.firstName} ${client.lastName}`,
          clientEmail: client.email,
          success: emailResult.success,
          error: emailResult.error
        });
      } catch (error) {
        emailResults.push({
          clientId: client.id,
          clientName: `${client.firstName} ${client.lastName}`,
          clientEmail: client.email,
          success: false,
          error: error.message
        });
      }
    }

    // Count successful and failed emails
    const successfulEmails = emailResults.filter(result => result.success).length;
    const failedEmails = emailResults.filter(result => !result.success).length;

    res.json({
      success: true,
      data: {
        totalClients: targetClients.length,
        successfulEmails,
        failedEmails,
        results: emailResults,
        message: `Email sent to ${successfulEmails} out of ${targetClients.length} clients`
      }
    });
  } catch (error) {
    console.error('Error sending emails to favorite clients:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while sending emails'
    });
  }
});

/**
 * @route   POST /api/artists/profile-picture/upload
 * @desc    Upload artist profile picture
 * @access  Private (ARTIST only)
 */
router.post('/profile-picture/upload', protect, authorize('ARTIST', 'ADMIN', 'ARTIST_ADMIN'), handleUpload, async (req, res) => {
  try {
    console.log('🔍 Profile picture upload request:', {
      userId: req.user.id,
      userRole: req.user.role,
      hasArtistProfile: !!req.user.artistProfile,
      artistProfileId: req.user.artistProfile?.id
    });

    const { uploadedFile } = req;
    
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadImage(uploadedFile.buffer, 'artist-profiles', {
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    // Get image dimensions
    const dimensions = await getImageDimensions(uploadedFile.buffer);

    // Update the artist profile with the new image data
    const updatedProfile = await prisma.artistProfile.update({
      where: { userId: req.user.id },
      data: {
        profilePictureUrl: uploadResult.url,
        profilePicturePublicId: uploadResult.public_id,
        profilePictureWidth: dimensions.width,
        profilePictureHeight: dimensions.height,
        profilePictureFormat: uploadedFile.mimetype.split('/')[1],
        profilePictureBytes: uploadedFile.size
      }
    });

    console.log('✅ Profile picture uploaded successfully:', {
      userId: req.user.id,
      imageUrl: uploadResult.url,
      publicId: uploadResult.public_id
    });

    res.json({
      success: true,
      data: {
        url: uploadResult.url,
        publicId: uploadResult.public_id,
        width: dimensions.width,
        height: dimensions.height,
        format: uploadedFile.mimetype.split('/')[1],
        bytes: uploadedFile.size
      }
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload profile picture: ' + error.message
    });
  }
});

/**
 * @route   DELETE /api/artists/profile-picture
 * @desc    Remove artist profile picture
 * @access  Private (ARTIST only)
 */
router.delete('/profile-picture', protect, authorize('ARTIST', 'ADMIN'), async (req, res) => {
  try {
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: req.user.id },
      select: { profilePicturePublicId: true }
    });

        if (!artistProfile) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Delete from Cloudinary if public ID exists
    if (artistProfile.profilePicturePublicId) {
      try {
        await deleteImage(artistProfile.profilePicturePublicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Continue with database update even if Cloudinary delete fails
      }
    }

    // Update database to remove profile picture
    await prisma.artistProfile.update({
      where: { userId: req.user.id },
      data: {
        profilePictureUrl: null,
        profilePicturePublicId: null,
        profilePictureWidth: null,
        profilePictureHeight: null,
        profilePictureFormat: null,
        profilePictureBytes: null
      }
    });

    res.json({
      success: true,
      message: 'Profile picture removed successfully'
    });

  } catch (error) {
    console.error('Profile picture removal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove profile picture'
    });
  }
});

// Helper function to get image dimensions - Sharp disabled for deployment compatibility
// const sharp = require('sharp');
const getImageDimensions = async (buffer) => {
  try {
    // Sharp disabled to fix Render deployment issues
    // const metadata = await sharp(buffer).metadata();
    // return {
    //   width: metadata.width,
    //   height: metadata.height
    // };
    
    // Return default dimensions for now
    return { width: 800, height: 600 };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return { width: 0, height: 0 };
  }
};

module.exports = router; 