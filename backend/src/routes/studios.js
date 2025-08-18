const express = require('express');
const router = express.Router();
const { prisma } = require('../utils/prisma');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const studioGeocodingTrigger = require('../utils/studioGeocodingTrigger');
const { studioArtistLimiter, contactInfoLimiter, strictContactLimiter, detectScraping } = require('../middleware/antiScraping');
const emailService = require('../utils/emailService');
const contentFilter = require('../utils/contentFilter');

// Create a new studio
router.post('/', protect, async (req, res) => {
  try {
    const { title, slug, website, phoneNumber, email, address, city, state, zipCode, country } = req.body;
    
    // Log the received data for debugging
    console.log('📝 Studio creation request:', {
      title, address, city, state, country, zipCode,
      hasTitle: !!title, hasAddress: !!address, hasCity: !!city, hasState: !!state, hasCountry: !!country
    });
    
    // Validate required fields
    if (!title || !title.trim()) {
      console.log('❌ Validation failed: Missing title');
      return res.status(400).json({
        success: false,
        error: 'Studio title is required'
      });
    }
    
    if (!address || !address.trim()) {
      console.log('❌ Validation failed: Missing address');
      return res.status(400).json({
        success: false,
        error: 'Studio address is required'
      });
    }
    
    if (!city || !city.trim()) {
      console.log('❌ Validation failed: Missing city');
      return res.status(400).json({
        success: false,
        error: 'Studio city is required'
      });
    }
    
    if (!state || !state.trim()) {
      console.log('❌ Validation failed: Missing state');
      return res.status(400).json({
        success: false,
        error: 'Studio state/province is required'
      });
    }
    
    if (!country || !country.trim()) {
      console.log('❌ Validation failed: Missing country');
      return res.status(400).json({
        success: false,
        error: 'Studio country is required'
      });
    }
    
    // Generate slug if not provided
    const studioSlug = slug || title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Check if studio with same title or slug already exists
    const existingStudio = await prisma.studio.findFirst({
      where: {
        OR: [
          { title: { equals: title, mode: 'insensitive' } },
          { slug: { equals: studioSlug, mode: 'insensitive' } }
        ]
      }
    });
    
    if (existingStudio) {
      return res.status(400).json({
        success: false,
        error: 'A studio with this name already exists'
      });
    }
    
    // Create the studio
    const studio = await prisma.studio.create({
      data: {
        title: title.trim(),
        slug: studioSlug,
        website: website || null,
        phoneNumber: phoneNumber || null,
        email: email || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        country: country || null,
        isActive: true,
        isVerified: true, // Auto-approve new studios
        isFeatured: false,
        verificationStatus: 'APPROVED', // Auto-approve new studios
        claimedBy: req.user.id,
        claimedAt: new Date()
      }
    });
    
    // Trigger automatic geocoding for the new studio
    try {
      await studioGeocodingTrigger.triggerGeocodingForStudio(studio.id);
    } catch (geocodingError) {
      console.error('Warning: Auto-geocoding failed for new studio:', geocodingError.message);
      // Don't fail the studio creation if geocoding fails
    }

    res.status(201).json({
      success: true,
      data: {
        studio
      },
      message: 'Studio created successfully. Geocoding will be processed automatically.'
    });
  } catch (error) {
    console.error('Error creating studio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create studio'
    });
  }
});

// Get all studios with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      verified, 
      featured, 
      page = 1, 
      limit = 20,
      all = false
    } = req.query;
    
    const where = {
      isActive: true
    };
    
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    if (verified !== undefined) {
      where.isVerified = verified === 'true';
    }
    
    if (featured !== undefined) {
      where.isFeatured = featured === 'true';
    }
    
    // If all=true, fetch all studios without pagination for map display
    const queryOptions = {
      where,
      orderBy: {
        title: 'asc'
      }
    };
    
    if (all !== 'true') {
      queryOptions.skip = (page - 1) * limit;
      queryOptions.take = parseInt(limit);
    }
    
    const studios = await prisma.studio.findMany({
      ...queryOptions,
      include: {
        _count: {
          select: {
            studioArtists: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    });

    // Add hasCoordinates property to each studio
    const studiosWithArtistCounts = studios.map(studio => ({
      ...studio,
      hasCoordinates: !!(studio.latitude && studio.longitude)
    }));
    
    const total = await prisma.studio.count({ where });
    
    // Add caching headers for better performance
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.set('ETag', `studios-${total}-${Date.now()}`);
    
    res.json({
      success: true,
      data: {
        studios: studiosWithArtistCounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching studios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studios'
    });
  }
});

// Get artists for a studio
router.get('/:id/artists', detectScraping, studioArtistLimiter, async (req, res) => {
  try {
    // Query the StudioArtist table to get actual linked artists with all related data
    const studioArtists = await prisma.studioArtist.findMany({
      where: {
        studioId: req.params.id,
        isActive: true
      },
      include: {
        artist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });
    
    // Transform the data to match the expected structure
    const artists = studioArtists
      .filter(sa => sa.artist) // Filter out any null artist profiles
      .map(sa => ({
        id: sa.artistId,
        role: sa.role,
        joinedAt: sa.joinedAt,
        artist: {
          id: sa.artist.id,
          user: sa.artist.user,
          bio: sa.artist.bio,
          studioName: sa.artist.studioName,
          website: sa.artist.website,
          instagram: sa.artist.instagram,
          isVerified: sa.artist.isVerified,
          isFeatured: sa.artist.isFeatured
        }
      }));
    
    console.log(`📊 Found ${artists.length} artists for studio ${artists[0]?.artist?.studioName}`);
    console.log('🔍 Studio artists data structure:', JSON.stringify(artists, null, 2));
    
    // Add caching headers for better performance
    res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    res.set('ETag', `studio-artists-${req.params.id}-${artists.length}`);
    
    res.json({
      success: true,
      data: artists
    });
  } catch (error) {
    console.error('Error fetching studio artists:', error);
    // Return empty array instead of error to prevent frontend crashes
    res.json({
      success: true,
      data: []
    });
  }
});

// Artist leaves studio (self-service)


// Claim studio (for artists)
router.post('/:id/claim', protect, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    // Check if user is an artist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true }
    });
    
    if (!user || (user.role !== 'ARTIST' && user.role !== 'ARTIST_ADMIN')) {
      return res.status(403).json({
        success: false,
        error: 'Only artists can claim studios'
      });
    }
    
    if (!user.artistProfile) {
      return res.status(400).json({
        success: false,
        error: 'You must have an artist profile to claim a studio'
      });
    }
    
    const studio = await prisma.studio.findUnique({
      where: { id: req.params.id }
    });
    
    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }
    
    if (studio.claimedBy) {
      return res.status(400).json({
        success: false,
        error: 'Studio is already claimed'
      });
    }
    
    // Claim the studio
    const updatedStudio = await prisma.studio.update({
      where: { id: req.params.id },
      data: {
        claimedBy: userId,
        claimedAt: new Date(),
        verificationStatus: 'PENDING'
      }
    });
    
    // Add artist to studio
    await prisma.studioArtist.create({
      data: {
        studioId: req.params.id,
        artistId: user.artistProfile.id,
        role: 'OWNER'
      }
    });
    
    res.json({
      success: true,
      data: updatedStudio,
      message: 'Studio claim request submitted successfully'
    });
  } catch (error) {
    console.error('Error claiming studio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim studio'
    });
  }
});

// Add artist to studio
router.post('/:id/artists', protect, async (req, res) => {
  try {
    const { artistId, role = 'ARTIST' } = req.body;
    
    // Check if studio exists
    const studio = await prisma.studio.findUnique({
      where: { id: req.params.id }
    });
    
    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }
    
    // Allow ADMIN, ARTIST, and ARTIST_ADMIN users to link themselves to studios
    // Only restrict if user is trying to add someone else (and they're not admin)
    if (req.user.role !== 'ADMIN' && artistId !== req.user.artistProfile?.id) {
      // Check if user is studio owner/manager
      const userStudioMembership = await prisma.studioArtist.findFirst({
        where: {
          studioId: req.params.id,
          artistId: req.user.artistProfile?.id,
          role: { in: ['OWNER', 'MANAGER'] }
        }
      });
      
      if (!userStudioMembership) {
        return res.status(403).json({
          success: false,
          error: 'Only studio owners/managers or admins can add other artists'
        });
      }
    }
    
    // Check if artist is already in studio
    const existingMembership = await prisma.studioArtist.findUnique({
      where: {
        studioId_artistId: {
          studioId: req.params.id,
          artistId: artistId
        }
      }
    });
    
    if (existingMembership) {
      return res.status(400).json({
        success: false,
        error: 'Artist is already a member of this studio'
      });
    }
    
    // Add artist to studio
    const studioArtist = await prisma.studioArtist.create({
      data: {
        studioId: req.params.id,
        artistId: artistId,
        role: role
      },
      include: {
        artist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: studioArtist,
      message: 'Artist added to studio successfully'
    });
  } catch (error) {
    console.error('Error adding artist to studio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add artist to studio'
    });
  }
});

// Remove artist from studio (admin/owner only)
router.delete('/:id/artists/:artistId', protect, async (req, res) => {
  try {
    const { artistId } = req.params;
    
    // Check if user has permission (studio owner or admin)
    const studio = await prisma.studio.findUnique({
      where: { id: req.params.id },
      include: {
        artists: {
          where: {
            artistId: req.user.artistProfile?.id,
            role: { in: ['OWNER', 'MANAGER'] }
          }
        }
      }
    });
    
    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }
    
    if (req.user.role !== 'ADMIN' && studio.artists.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Only studio owners/managers or admins can remove artists'
      });
    }
    
    // Remove artist from studio
    await prisma.studioArtist.update({
      where: {
        studioId_artistId: {
          studioId: req.params.id,
          artistId: artistId
        }
      },
      data: {
        isActive: false,
        leftAt: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Artist removed from studio successfully'
    });
  } catch (error) {
    console.error('Error removing artist from studio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove artist from studio'
    });
  }
});

// Admin: Verify studio claim
router.put('/:id/verify', protect, async (req, res) => {
  try {
    const { isVerified, verificationNotes } = req.body;
    
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const studio = await prisma.studio.update({
      where: { id: req.params.id },
      data: {
        isVerified,
        verificationStatus: isVerified ? 'APPROVED' : 'REJECTED',
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      }
    });
    
    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'VERIFY_STUDIO',
        targetType: 'STUDIO',
        targetId: req.params.id,
        details: `Studio verification ${isVerified ? 'approved' : 'rejected'}: ${verificationNotes || ''}`
      }
    });
    
    res.json({
      success: true,
      data: studio,
      message: `Studio ${isVerified ? 'verified' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error verifying studio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify studio'
    });
  }
});

/**
 * @route   POST /api/studios/:id/contact
 * @desc    Send contact email to studio from client
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

    // Get studio information
    const studio = await prisma.studio.findUnique({
      where: { id }
    });

    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }

    if (!studio.email) {
      return res.status(400).json({
        success: false,
        error: 'This studio does not have a contact email available'
      });
    }

    // Send email to studio
    try {
      const emailResult = await emailService.sendClientToStudioEmail({
        to: studio.email,
        studioName: studio.title,
        clientName: senderName,
        clientEmail: senderEmail,
        clientPhone: senderPhone,
        subject: subject,
        message: message,
        studioAddress: studio.address ? `${studio.address}, ${studio.city}, ${studio.state}` : `${studio.city}, ${studio.state}`
      });

      if (emailResult.success) {
        res.json({
          success: true,
          message: 'Message sent successfully! The studio will get back to you soon.'
        });
      } else {
        throw new Error(emailResult.error || 'Failed to send email');
      }
    } catch (emailError) {
      console.error('Error sending contact email to studio:', emailError);
      res.status(500).json({
        success: false,
        error: 'Failed to send message. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Error in studio contact endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing contact request'
    });
  }
});

// Join studio immediately (for artists who want to join a studio)
router.post('/:id/join', protect, async (req, res) => {
  try {
    // Check if user has an artist profile
    if (!req.user.artistProfile) {
      return res.status(400).json({
        success: false,
        error: 'You must have an artist profile to join a studio'
      });
    }

    const { id } = req.params;
    const { role = 'ARTIST' } = req.body; // Default role is ARTIST

    // Check if studio exists
    const studio = await prisma.studio.findUnique({
      where: { id }
    });

    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }

    // Check if studio is active
    if (!studio.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Studio is not currently active'
      });
    }

    // Check if artist is already a member of this studio
    const existingMembership = await prisma.studioArtist.findFirst({
      where: {
        studioId: id,
        artistId: req.user.artistProfile.id,
        isActive: true
      }
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this studio'
      });
    }

    // Join the studio immediately
    const studioMembership = await prisma.studioArtist.create({
      data: {
        studioId: id,
        artistId: req.user.artistProfile.id,
        role: role,
        isActive: true,
        joinedAt: new Date()
      },
      include: {
        studio: {
          select: {
            id: true,
            title: true,
            city: true,
            state: true
          }
        },
        artist: {
          select: {
            id: true,
            user: {
              select: {
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
      data: studioMembership,
      message: `Successfully joined ${studio.title}!`
    });
  } catch (error) {
    console.error('Error joining studio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join studio'
    });
  }
});

// Leave a studio
router.post('/:id/leave', protect, async (req, res) => {
  try {
    console.log('🔍 Leave studio request - User:', req.user.id);
    console.log('🔍 Leave studio request - Artist Profile:', req.user.artistProfile?.id);
    console.log('🔍 Leave studio request - Studio ID:', req.params.id);
    
    // Check if Prisma client is connected
    try {
      await prisma.$connect();
      console.log('✅ Prisma client connected successfully');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return res.status(500).json({
        success: false,
        error: 'Database connection failed'
      });
    }
    
    // Check if user has an artist profile
    if (!req.user.artistProfile) {
      console.log('❌ User does not have artist profile');
      return res.status(400).json({
        success: false,
        error: 'You must have an artist profile to leave a studio'
      });
    }

    const { id } = req.params;

    // Check if studio exists
    const studio = await prisma.studio.findUnique({
      where: { id }
    });

    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }

    // Check if artist is a member of this studio
    console.log('🔍 Checking studio membership for studio:', id, 'and artist:', req.user.artistProfile.id);
    const existingMembership = await prisma.studioArtist.findFirst({
      where: {
        studioId: id,
        artistId: req.user.artistProfile.id,
        isActive: true
      }
    });

    console.log('🔍 Existing membership found:', existingMembership);

    if (!existingMembership) {
      console.log('❌ User is not a member of this studio');
      return res.status(400).json({
        success: false,
        error: 'You are not a member of this studio'
      });
    }

    // Deactivate the membership (soft delete)
    console.log('🔍 Deactivating studio membership:', existingMembership.id);
    await prisma.studioArtist.update({
      where: { id: existingMembership.id },
      data: {
        isActive: false,
        leftAt: new Date()
      }
    });

    console.log('✅ Successfully left studio:', studio.title);
    res.json({
      success: true,
      message: `Successfully left ${studio.title}`
    });
  } catch (error) {
    console.error('❌ Error leaving studio:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
    
    // Check for specific Prisma errors
    if (error.code) {
      console.error('❌ Prisma error code:', error.code);
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to leave studio',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Get pending join requests for a studio (studio owners/managers only)
router.get('/:id/join-requests', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if studio exists
    const studio = await prisma.studio.findUnique({
      where: { id }
    });

    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }

    // Check if user has permission to view join requests
    const userMembership = await prisma.studioArtist.findFirst({
      where: {
        studioId: id,
        artistId: req.user.artistProfile?.id,
        role: { in: ['OWNER', 'MANAGER'] },
        isActive: true
      }
    });

    if (req.user.role !== 'ADMIN' && !userMembership) {
      return res.status(403).json({
        success: false,
        error: 'Only studio owners/managers or admins can view join requests'
      });
    }

    // Get pending join requests
    const joinRequests = await prisma.studioJoinRequest.findMany({
      where: {
        studioId: id,
        status: 'PENDING'
      },
      include: {
        artist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            },
            specialties: {
              select: {
                name: true,
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        requestedAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        studio: {
          id: studio.id,
          title: studio.title
        },
        joinRequests
      }
    });
  } catch (error) {
    console.error('Error fetching studio join requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch join requests'
    });
  }
});

// Approve/reject join request (studio owners/managers only)
router.put('/:id/join-requests/:requestId', protect, async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const { action, message } = req.body; // action: 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Action must be either APPROVE or REJECT'
      });
    }

    // Check if studio exists
    const studio = await prisma.studio.findUnique({
      where: { id }
    });

    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }

    // Check if user has permission to approve/reject requests
    const userMembership = await prisma.studioArtist.findFirst({
      where: {
        studioId: id,
        artistId: req.user.artistProfile?.id,
        role: { in: ['OWNER', 'MANAGER'] },
        isActive: true
      }
    });

    if (req.user.role !== 'ADMIN' && !userMembership) {
      return res.status(403).json({
        success: false,
        error: 'Only studio owners/managers or admins can approve/reject join requests'
      });
    }

    // Get the join request
    const joinRequest = await prisma.studioJoinRequest.findUnique({
      where: { id: requestId },
      include: {
        artist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!joinRequest) {
      return res.status(404).json({
        success: false,
        error: 'Join request not found'
      });
    }

    if (joinRequest.studioId !== id) {
      return res.status(400).json({
        success: false,
        error: 'Join request does not belong to this studio'
      });
    }

    if (joinRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        error: 'Join request is no longer pending'
      });
    }

    // Update the join request status
    const updatedRequest = await prisma.studioJoinRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        respondedAt: new Date(),
        responseMessage: message || null,
        respondedBy: req.user.id
      }
    });

    // If approved, add artist to studio
    if (action === 'APPROVE') {
      await prisma.studioArtist.create({
        data: {
          studioId: id,
          artistId: joinRequest.artistId,
          role: 'ARTIST',
          isActive: true,
          joinedAt: new Date()
        }
      });
    }

    // Send notification email to the artist
    try {
      const studioName = studio.title;
      const responderName = `${req.user.firstName} ${req.user.lastName}`;
      
      await emailService.sendStudioJoinRequestResponseEmail({
        to: joinRequest.artist.user.email,
        artistName: `${joinRequest.artist.user.firstName} ${joinRequest.artist.user.lastName}`,
        studioName: studioName,
        responderName: responderName,
        action: action,
        message: message || null
      });
    } catch (emailError) {
      console.error('Error sending join request response email:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      data: updatedRequest,
      message: `Join request ${action.toLowerCase()}d successfully`
    });
  } catch (error) {
    console.error('Error processing studio join request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process join request'
    });
  }
});

// Get specific studio
router.get('/:id', detectScraping, studioArtistLimiter, async (req, res) => {
  try {
    const studio = await prisma.studio.findUnique({
      where: { id: req.params.id }
    });
    
    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }
    
    res.json({
      success: true,
      data: studio
    });
  } catch (error) {
    console.error('Error fetching studio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studio'
    });
  }
});

module.exports = router; 