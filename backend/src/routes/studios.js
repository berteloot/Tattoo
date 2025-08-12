const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const studioGeocodingTrigger = require('../utils/studioGeocodingTrigger');
const { studioArtistLimiter, contactInfoLimiter, strictContactLimiter, detectScraping } = require('../middleware/antiScraping');
const emailService = require('../utils/emailService');
const contentFilter = require('../utils/contentFilter');
const prisma = new PrismaClient();

// Create a new studio
router.post('/', protect, async (req, res) => {
  try {
    const { title, slug, website, phoneNumber, email, address, city, state, zipCode, country } = req.body;
    
    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Studio title is required'
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
        isVerified: false,
        isFeatured: false,
        verificationStatus: 'PENDING',
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
      limit = 20 
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
    
    const studios = await prisma.studio.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: {
        title: 'asc'
      }
    });

    // Get artist counts for each studio
    const studiosWithArtistCounts = await Promise.all(
      studios.map(async (studio) => {
        const artistCount = await prisma.studioArtist.count({
          where: {
            studioId: studio.id,
            isActive: true
          }
        });
        
        return {
          ...studio,
          _count: {
            artists: artistCount
          }
        };
      })
    );
    
    const total = await prisma.studio.count({ where });
    
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
    const studio = await prisma.studio.findUnique({
      where: { id: req.params.id }
    });
    
    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }
    
    // Query the StudioArtist table to get actual linked artists
    const studioArtists = await prisma.studioArtist.findMany({
      where: {
        studioId: req.params.id,
        isActive: true
      }
    });
    
    // Get the actual artist profiles and user data
    const artistsWithProfiles = await Promise.all(
      studioArtists.map(async (sa) => {
        const artistProfile = await prisma.artistProfile.findUnique({
          where: { id: sa.artistId },
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
        });
        
        if (!artistProfile) return null;
        
        return {
          id: sa.artistId,
          role: sa.role,
          joinedAt: sa.joinedAt,
          user: artistProfile.user,
          profile: {
            id: artistProfile.id,
            bio: artistProfile.bio,
            studioName: artistProfile.studioName,
            website: artistProfile.website,
            instagram: artistProfile.instagram,
            isVerified: artistProfile.isVerified,
            isFeatured: artistProfile.isFeatured
          }
        };
      })
    );
    
    // Filter out any null results and get the final artists array
    const artists = artistsWithProfiles.filter(Boolean);
    
    console.log(`📊 Found ${artists.length} artists for studio ${studio.title}`);
    
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
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const { userId } = req.user; // From auth middleware
    
    // Check if user is an artist
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { artistProfile: true }
    });
    
    if (!user || (user.role !== 'ARTIST' && user.role !== 'ARTIST_ADMIN')) {
      return res.status(403).json({
        success: false,
        error: 'Only artists can leave studios'
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
    
    // Check if artist is a member of this studio
    const studioArtist = await prisma.studioArtist.findUnique({
      where: {
        studioId_artistId: {
          studioId: req.params.id,
          artistId: user.artistProfile.id
        }
      }
    });
    
    if (!studioArtist) {
      return res.status(404).json({
        success: false,
        error: 'You are not a member of this studio'
      });
    }
    
    // Don't allow owners to leave (they need to transfer ownership first)
    if (studioArtist.role === 'OWNER') {
      return res.status(400).json({
        success: false,
        error: 'Studio owners cannot leave. Please transfer ownership first.'
      });
    }
    
    // Leave the studio
    await prisma.studioArtist.update({
      where: {
        studioId_artistId: {
          studioId: req.params.id,
          artistId: user.artistProfile.id
        }
      },
      data: {
        isActive: false,
        leftAt: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Successfully left the studio'
    });
  } catch (error) {
    console.error('Error leaving studio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave studio'
    });
  }
});

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