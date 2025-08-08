const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../utils/prisma');
const { protect, adminOnly, requireOwnership } = require('../middleware/auth');
const studioGeocodingTrigger = require('../utils/studioGeocodingTrigger');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Admin only
 */
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalArtists,
      pendingVerifications,
      totalReviews,
      totalFlash,
      recentAdminActions
    ] = await Promise.all([
      prisma.user.count(),
              prisma.user.count({ where: { role: { in: ['ARTIST', 'ARTIST_ADMIN'] } } }),
      prisma.artistProfile.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.review.count(),
      prisma.flash.count(),
      prisma.adminAction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { firstName: true, lastName: true } } }
      })
    ]);

    res.json({
      success: true,
      data: {
        statistics: {
          totalUsers,
          totalArtists,
          pendingVerifications,
          totalReviews,
          totalFlash
        },
        recentActions: recentAdminActions
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching dashboard data'
    });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Admin only
 */
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          artistProfile: {
            select: {
              id: true,
              studioName: true,
              verificationStatus: true,
              isVerified: true,
              isFeatured: true
            }
          },
          _count: {
            select: {
              reviewsGiven: true,
              reviewsReceived: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching users'
    });
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user status and role
 * @access  Admin only
 */
router.put('/users/:id', [
  body('isActive').optional().isBoolean(),
  body('role').optional().isIn(['CLIENT', 'ARTIST', 'ADMIN', 'ARTIST_ADMIN']),
  body('isVerified').optional().isBoolean(),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { isActive, role, isVerified, reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { artistProfile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admin from modifying themselves
    if (user.id === req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Cannot modify your own account'
      });
    }

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role) updateData.role = role;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        artistProfile: {
          select: {
            id: true,
            studioName: true,
            verificationStatus: true,
            isVerified: true,
            isFeatured: true
          }
        }
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'UPDATE_USER',
        targetType: 'USER',
        targetId: id,
        details: `Updated user: ${JSON.stringify(updateData)}${reason ? ` - Reason: ${reason}` : ''}`
      }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating user'
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Permanently delete a user (soft delete by setting isActive to false)
 * @access  Admin only
 */
router.delete('/users/:id', [
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { artistProfile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    // Soft delete by setting isActive to false
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: {
        artistProfile: {
          select: {
            id: true,
            studioName: true,
            verificationStatus: true,
            isVerified: true,
            isFeatured: true
          }
        }
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'DELETE_USER',
        targetType: 'USER',
        targetId: id,
        details: `User deactivated${reason ? ` - Reason: ${reason}` : ''}`
      }
    });

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: { user: deletedUser }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting user'
    });
  }
});

/**
 * @route   POST /api/admin/users/:id/restore
 * @desc    Restore a deactivated user
 * @access  Admin only
 */
router.post('/users/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { artistProfile: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const restoredUser = await prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: {
        artistProfile: {
          select: {
            id: true,
            studioName: true,
            verificationStatus: true,
            isVerified: true,
            isFeatured: true
          }
        }
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'RESTORE_USER',
        targetType: 'USER',
        targetId: id,
        details: 'User account restored'
      }
    });

    res.json({
      success: true,
      message: 'User restored successfully',
      data: { user: restoredUser }
    });
  } catch (error) {
    console.error('Restore user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error restoring user'
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id/permanent
 * @desc    Permanently delete a user and all associated data
 * @access  Admin only
 */
router.delete('/users/:id/permanent', [
  body('reason').notEmpty().withMessage('Reason is required for permanent deletion')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { 
        artistProfile: true,
        reviewsGiven: true,
        reviewsReceived: true,
        _count: {
          select: {
            reviewsGiven: true,
            reviewsReceived: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    // Prevent deletion of other admins (optional safety measure)
    if (user.role === 'ADMIN' && user.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete other admin accounts'
      });
    }

    console.log(`🔄 Starting permanent deletion of user: ${user.email} (ID: ${id})`);
    console.log(`📊 User data to be deleted: ${user._count.reviewsGiven} reviews given, ${user._count.reviewsReceived} reviews received`);

    // Use a transaction to ensure all related data is deleted
    const result = await prisma.$transaction(async (tx) => {
      // Delete all reviews given by this user
      await tx.review.deleteMany({
        where: { authorId: id }
      });

      // Delete all reviews received by this user
      await tx.review.deleteMany({
        where: { recipientId: id }
      });

      // Delete all flash items by this user
      if (user.artistProfile) {
        await tx.flash.deleteMany({
          where: { artistId: user.artistProfile.id }
        });
      }

      // Delete artist profile if it exists
      if (user.artistProfile) {
        await tx.artistProfile.delete({
          where: { userId: id }
        });
      }

      // Finally, delete the user
      const deletedUser = await tx.user.delete({
        where: { id }
      });

      return deletedUser;
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'PERMANENT_DELETE_USER',
        targetType: 'USER',
        targetId: id,
        details: `User permanently deleted - Reason: ${reason}`
      }
    });

    console.log(`✅ User permanently deleted: ${user.email} (ID: ${id})`);

    res.json({
      success: true,
      message: 'User permanently deleted successfully',
      data: { 
        user: result,
        deletedData: {
          reviewsGiven: user._count.reviewsGiven,
          reviewsReceived: user._count.reviewsReceived,
          hadArtistProfile: !!user.artistProfile
        }
      }
    });
  } catch (error) {
    console.error('Permanent delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Error permanently deleting user'
    });
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get detailed user information
 * @access  Admin only
 */
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // First, try to get basic user info
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        artistProfile: {
          select: {
            id: true,
            studioName: true,
            verificationStatus: true,
            isVerified: true,
            isFeatured: true
          }
        },
        _count: {
          select: {
            reviewsGiven: true,
            reviewsReceived: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching user details'
    });
  }
});

/**
 * @route   GET /api/admin/artists
 * @desc    Get all artists with filtering and pagination
 * @access  Admin only
 */
router.get('/artists', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, verificationStatus, isFeatured, isVerified } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    // Search filter
    if (search) {
      where.OR = [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { studioName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Verification status filter
    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }

    // Featured filter
    if (isFeatured !== undefined && isFeatured !== '' && isFeatured !== null) {
      where.isFeatured = isFeatured === 'true';
    }

    // Verified filter
    if (isVerified !== undefined && isVerified !== '' && isVerified !== null) {
      where.isVerified = isVerified === 'true';
    }

    const [artists, total] = await Promise.all([
      prisma.artistProfile.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.artistProfile.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        artists,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get artists error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching artists'
    });
  }
});

/**
 * @route   GET /api/admin/artists/pending
 * @desc    Get pending artist verifications
 * @access  Admin only
 */
router.get('/artists/pending', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [artists, total] = await Promise.all([
      prisma.artistProfile.findMany({
        where: { verificationStatus: 'PENDING' },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.artistProfile.count({ where: { verificationStatus: 'PENDING' } })
    ]);

    res.json({
      success: true,
      data: {
        artists,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get pending artists error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching pending artists'
    });
  }
});

/**
 * @route   PUT /api/admin/artists/:id/verify
 * @desc    Verify or reject artist profile
 * @access  Admin only
 */
router.put('/artists/:id/verify', [
  body('status').isIn(['APPROVED', 'REJECTED', 'SUSPENDED']),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    const artist = await prisma.artistProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!artist) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    const updateData = {
      verificationStatus: status,
      verificationNotes: notes,
      verifiedAt: new Date(),
      verifiedBy: req.user.id
    };

    if (status === 'APPROVED') {
      updateData.isVerified = true;
    }

    const updatedArtist = await prisma.artistProfile.update({
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
        }
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'VERIFY_ARTIST',
        targetType: 'ARTIST',
        targetId: id,
        details: `Artist verification ${status.toLowerCase()}: ${notes || 'No notes'}`
      }
    });

    res.json({
      success: true,
      message: `Artist ${status.toLowerCase()} successfully`,
      data: { artist: updatedArtist }
    });
  } catch (error) {
    console.error('Verify artist error:', error);
    res.status(500).json({
      success: false,
      error: 'Error verifying artist'
    });
  }
});

/**
 * @route   PUT /api/admin/artists/:id/feature
 * @desc    Feature or unfeature an artist
 * @access  Admin only
 */
router.put('/artists/:id/feature', [
  body('isFeatured').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { isFeatured } = req.body;

    const artist = await prisma.artistProfile.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!artist) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    const updatedArtist = await prisma.artistProfile.update({
      where: { id },
      data: { isFeatured },
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

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: isFeatured ? 'FEATURE_ARTIST' : 'UNFEATURE_ARTIST',
        targetType: 'ARTIST',
        targetId: id,
        details: `Artist ${isFeatured ? 'featured' : 'unfeatured'}`
      }
    });

    res.json({
      success: true,
      message: `Artist ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: { artist: updatedArtist }
    });
  } catch (error) {
    console.error('Feature artist error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating artist feature status'
    });
  }
});

/**
 * @route   GET /api/admin/reviews
 * @desc    Get all reviews with moderation options
 * @access  Admin only
 */
router.get('/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 20, isApproved, isHidden } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (isApproved !== undefined) where.isApproved = isApproved === 'true';
    if (isHidden !== undefined) where.isHidden = isHidden === 'true';

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          recipient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.review.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching reviews'
    });
  }
});

/**
 * @route   PUT /api/admin/reviews/:id/moderate
 * @desc    Moderate a review (approve/hide)
 * @access  Admin only
 */
router.put('/reviews/:id/moderate', [
  body('isApproved').optional().isBoolean(),
  body('isHidden').optional().isBoolean(),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { isApproved, isHidden, reason } = req.body;

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        author: { select: { firstName: true, lastName: true } },
        recipient: { select: { firstName: true, lastName: true } }
      }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    const updateData = {};
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    if (isHidden !== undefined) updateData.isHidden = isHidden;

    const updatedReview = await prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { firstName: true, lastName: true } },
        recipient: { select: { firstName: true, lastName: true } }
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'MODERATE_REVIEW',
        targetType: 'REVIEW',
        targetId: id,
        details: `Review moderation: approved=${isApproved}, hidden=${isHidden}, reason=${reason || 'No reason'}`
      }
    });

    res.json({
      success: true,
      message: 'Review moderated successfully',
      data: { review: updatedReview }
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      error: 'Error moderating review'
    });
  }
});

/**
 * @route   GET /api/admin/content
 * @desc    Get all flash items with filtering and pagination for admin
 * @access  Admin only
 */
router.get('/content', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, artist, isApproved, isHidden } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }
    
    if (artist) {
      where.artist = {
        user: {
          OR: [
            { firstName: { contains: artist, mode: 'insensitive' } },
            { lastName: { contains: artist, mode: 'insensitive' } }
          ]
        }
      };
    }
    
    if (isApproved !== undefined) {
      where.isApproved = isApproved === 'true';
    }
    
    if (isHidden !== undefined) {
      where.isHidden = isHidden === 'true';
    }

    const [flashItems, total] = await Promise.all([
      prisma.flash.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          artist: {
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
          }
        }
      }),
      prisma.flash.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        flashItems,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching content'
    });
  }
});

/**
 * @route   PUT /api/admin/content/:id/moderate
 * @desc    Moderate flash item (approve/hide)
 * @access  Admin only
 */
router.put('/content/:id/moderate', [
  body('isApproved').optional().isBoolean(),
  body('isHidden').optional().isBoolean(),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { isApproved, isHidden, reason } = req.body;

    const flashItem = await prisma.flash.findUnique({
      where: { id },
      include: {
        artist: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    if (!flashItem) {
      return res.status(404).json({
        success: false,
        error: 'Flash item not found'
      });
    }

    const updateData = {};
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    if (isHidden !== undefined) updateData.isHidden = isHidden;

    const updatedFlashItem = await prisma.flash.update({
      where: { id },
      data: updateData,
      include: {
        artist: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'MODERATE_CONTENT',
        targetType: 'FLASH',
        targetId: id,
        details: `Content moderation: approved=${isApproved}, hidden=${isHidden}, reason=${reason || 'No reason'}`
      }
    });

    res.json({
      success: true,
      message: 'Content moderated successfully',
      data: { flashItem: updatedFlashItem }
    });
  } catch (error) {
    console.error('Moderate content error:', error);
    res.status(500).json({
      success: false,
      error: 'Error moderating content'
    });
  }
});

/**
 * @route   DELETE /api/admin/content/:id
 * @desc    Delete flash item
 * @access  Admin only
 */
router.delete('/content/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const flashItem = await prisma.flash.findUnique({
      where: { id },
      include: {
        artist: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    if (!flashItem) {
      return res.status(404).json({
        success: false,
        error: 'Flash item not found'
      });
    }

    await prisma.flash.delete({
      where: { id }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'DELETE_CONTENT',
        targetType: 'FLASH',
        targetId: id,
        details: `Content deleted: ${flashItem.title}`
      }
    });

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting content'
    });
  }
});

/**
 * @route   GET /api/admin/content/export
 * @desc    Export content data as CSV
 * @access  Admin only
 */
router.get('/content/export', async (req, res) => {
  try {
    const flashItems = await prisma.flash.findMany({
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
      },
      orderBy: { createdAt: 'desc' }
    });

    // Create CSV content
    const csvHeader = 'ID,Title,Description,Price,Tags,Artist,Studio,Status,Visibility,Created At\n';
    const csvRows = flashItems.map(item => {
      const artistName = `${item.artist?.user?.firstName || ''} ${item.artist?.user?.lastName || ''}`.trim();
      const tags = Array.isArray(item.tags) ? item.tags.join(';') : '';
      const status = item.isApproved ? 'Approved' : 'Pending';
      const visibility = item.isHidden ? 'Hidden' : 'Visible';
      
      return [
        item.id,
        `"${item.title?.replace(/"/g, '""') || ''}"`,
        `"${item.description?.replace(/"/g, '""') || ''}"`,
        item.price || 0,
        `"${tags}"`,
        `"${artistName}"`,
        `"${item.artist?.studioName || ''}"`,
        status,
        visibility,
        item.createdAt.toISOString()
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="content-export.csv"');
    res.send(csvContent);

  } catch (error) {
    console.error('Export content error:', error);
    res.status(500).json({
      success: false,
      error: 'Error exporting content'
    });
  }
});

/**
 * @route   GET /api/admin/actions
 * @desc    Get admin action log
 * @access  Admin only
 */
router.get('/actions', async (req, res) => {
  try {
    const { page = 1, limit = 50, action, targetType } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (action) where.action = action;
    if (targetType) where.targetType = targetType;

    const [actions, total] = await Promise.all([
      prisma.adminAction.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      prisma.adminAction.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        actions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get admin actions error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching admin actions'
    });
  }
});

/**
 * @route   POST /api/admin/quick-fix-verification
 * @desc    Quick fix to disable email verification for existing users
 * @access  Admin only
 */
router.post('/quick-fix-verification', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    // Get all users
    const users = await prisma.user.findMany();

    // Update all users to be verified
    const updatePromises = users.map(user => 
      prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          isActive: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null
        }
      })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `Email verification disabled for ${users.length} users`,
      data: {
        usersFixed: users.length,
        users: users.map(u => ({ id: u.id, email: u.email, role: u.role }))
      }
    });

  } catch (error) {
    console.error('Quick fix error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during quick fix'
    });
  }
});

/**
 * @route   POST /api/admin/fix-test-accounts
 * @desc    Fix test accounts for production (temporary)
 * @access  Admin only
 */
router.post('/fix-test-accounts', protect, adminOnly, async (req, res) => {
  try {
    console.log('🔄 Fixing test accounts in production...')
    
    // Update all test accounts to have emailVerified: true
    const testEmails = [
      'admin@tattoolocator.com',
      'client@example.com', 
      'artist@example.com',
      'lisa@example.com',
      'david@example.com',
      'emma@example.com',
      'marcus@example.com',
      'pending@example.com'
    ]
    
    const updatedUsers = await prisma.user.updateMany({
      where: {
        email: {
          in: testEmails
        }
      },
      data: {
        emailVerified: true
      }
    })
    
    console.log(`✅ Updated ${updatedUsers.count} test accounts`)
    
    // Verify the updates
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: testEmails
        }
      },
      select: {
        email: true,
        emailVerified: true,
        role: true
      }
    })
    
    res.json({
      success: true,
      message: `Updated ${updatedUsers.count} test accounts`,
      data: {
        updatedCount: updatedUsers.count,
        users: users
      }
    })
    
  } catch (error) {
    console.error('❌ Error fixing test accounts:', error)
    res.status(500).json({
      success: false,
      error: 'Server error while fixing test accounts'
    })
  }
})

/**
 * @route   POST /api/admin/upload-studios-csv
 * @desc    Upload and process CSV file with studio data
 * @access  Admin only
 */
router.post('/upload-studios-csv', protect, adminOnly, async (req, res) => {
  try {
    const { csvData } = req.body;
    
    if (!csvData) {
      return res.status(400).json({
        success: false,
        error: 'CSV data is required'
      });
    }

    // Parse CSV data
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Validate required headers
    const requiredHeaders = ['title', 'address', 'city', 'state'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required headers: ${missingHeaders.join(', ')}`,
        requiredHeaders,
        providedHeaders: headers
      });
    }

    const results = {
      total: lines.length - 1,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };

    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        // Parse CSV line (handle commas in quoted fields)
        const values = parseCSVLine(line);
        
        if (values.length !== headers.length) {
          results.failed++;
          results.errors.push(`Line ${i + 1}: Column count mismatch`);
          continue;
        }

        // Create studio data object
        const studioData = {};
        headers.forEach((header, index) => {
          studioData[header] = values[index]?.trim() || null;
        });

        // Generate slug from title
        const slug = studioData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');

        // Check for existing studio with same title or slug (duplicate detection)
        const existingStudio = await prisma.studio.findFirst({
          where: {
            OR: [
              { title: { equals: studioData.title, mode: 'insensitive' } },
              { slug: { equals: slug, mode: 'insensitive' } }
            ]
          }
        });

        if (existingStudio) {
          results.skipped++;
          results.errors.push(`Line ${i + 1}: Studio "${studioData.title}" already exists (ID: ${existingStudio.id})`);
          continue;
        }

        // Validate and create studio
        const studio = await prisma.studio.create({
          data: {
            title: studioData.title,
            slug: slug,
            website: studioData.website || null,
            phoneNumber: studioData.phone || studioData.phonenumber || null,
            email: studioData.email || null,
            facebookUrl: studioData.facebook || studioData.facebookurl || null,
            instagramUrl: studioData.instagram || studioData.instagramurl || null,
            twitterUrl: studioData.twitter || studioData.twitterurl || null,
            linkedinUrl: studioData.linkedin || studioData.linkedinurl || null,
            youtubeUrl: studioData.youtube || studioData.youtubeurl || null,
            latitude: studioData.latitude ? parseFloat(studioData.latitude) : null,
            longitude: studioData.longitude ? parseFloat(studioData.longitude) : null,
            address: studioData.address,
            city: studioData.city,
            state: studioData.state,
            zipCode: studioData.zipcode || studioData.zip || null,
            country: studioData.country || 'USA',
            isActive: true,
            isVerified: false,
            isFeatured: false,
            verificationStatus: 'PENDING'
          }
        });

        results.successful++;

      } catch (error) {
        results.failed++;
        results.errors.push(`Line ${i + 1}: ${error.message}`);
      }
    }

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'UPLOAD_STUDIOS_CSV',
        targetType: 'STUDIO',
        targetId: 'bulk-upload',
        details: `Uploaded ${results.successful} studios from CSV. ${results.failed} failed, ${results.skipped} skipped (duplicates).`
      }
    });

    res.json({
      success: true,
      message: `CSV upload completed. ${results.successful} studios created, ${results.failed} failed, ${results.skipped} skipped (duplicates).`,
      data: results
    });

  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process CSV upload'
    });
  }
});

/**
 * @route   GET /api/admin/studios-csv-template
 * @desc    Get CSV template for studio upload
 * @access  Admin only
 */
router.get('/studios-csv-template', protect, adminOnly, async (req, res) => {
  try {
    const template = `title,address,city,state,zipcode,country,phone,email,website,facebook,instagram,twitter,linkedin,youtube,latitude,longitude
"Studio Name","123 Main St","New York","NY","10001","USA","555-123-4567","studio@example.com","https://studio.com","https://facebook.com/studio","https://instagram.com/studio","https://twitter.com/studio","https://linkedin.com/studio","https://youtube.com/studio","40.7128","-74.0060"`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="studios-template.csv"');
    res.send(template);

  } catch (error) {
    console.error('Template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate template'
    });
  }
});

// Helper function to parse CSV line with quoted fields
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values.map(v => v.replace(/^"|"$/g, '')); // Remove surrounding quotes
}

/**
 * @route   GET /api/admin/studios
 * @desc    Get all studios with filtering and pagination
 * @access  Admin only
 */
router.get('/studios', protect, adminOnly, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      verified, 
      featured,
      status 
    } = req.query;
    
    const where = {};
    
    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (verified !== undefined && verified !== '' && verified !== null) {
      where.isVerified = verified === 'true';
    }
    
    if (featured !== undefined && featured !== '' && featured !== null) {
      where.isFeatured = featured === 'true';
    }
    
    if (status && status.trim() !== '') {
      where.verificationStatus = status;
    }
    
    const [studios, total] = await Promise.all([
      prisma.studio.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.studio.count({ where })
    ]);

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
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studios',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/admin/studios/:id
 * @desc    Get specific studio details
 * @access  Admin only
 */
router.get('/studios/:id', protect, adminOnly, async (req, res) => {
  try {
    const studio = await prisma.studio.findUnique({
      where: { id: req.params.id },
      include: {
        artists: {
          include: {
            artist: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        },
        claimedByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        verifiedByUser: {
          select: {
            firstName: true,
            lastName: true
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

/**
 * @route   PUT /api/admin/studios/:id/verify
 * @desc    Verify or reject a studio
 * @access  Admin only
 */
router.put('/studios/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const { isVerified, verificationNotes } = req.body;
    
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
 * @route   PUT /api/admin/studios/:id/feature
 * @desc    Feature or unfeature a studio
 * @access  Admin only
 */
router.put('/studios/:id/feature', protect, adminOnly, async (req, res) => {
  try {
    const { isFeatured } = req.body;
    
    const studio = await prisma.studio.update({
      where: { id: req.params.id },
      data: {
        isFeatured
      }
    });
    
    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'FEATURE_STUDIO',
        targetType: 'STUDIO',
        targetId: req.params.id,
        details: `Studio ${isFeatured ? 'featured' : 'unfeatured'}`
      }
    });
    
    res.json({
      success: true,
      data: studio,
      message: `Studio ${isFeatured ? 'featured' : 'unfeatured'} successfully`
    });
  } catch (error) {
    console.error('Error featuring studio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to feature studio'
    });
  }
});

/**
 * @route   PUT /api/admin/studios/:id
 * @desc    Update studio information
 * @access  Admin only
 */
router.put('/studios/:id', protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      website,
      phoneNumber,
      email,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      linkedinUrl,
      youtubeUrl,
      address,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude,
      isActive
    } = req.body;
    
    const studio = await prisma.studio.update({
      where: { id: req.params.id },
      data: {
        title,
        website,
        phoneNumber,
        email,
        facebookUrl,
        instagramUrl,
        twitterUrl,
        linkedinUrl,
        youtubeUrl,
        address,
        city,
        state,
        zipCode,
        country,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isActive
      }
    });
    
    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'UPDATE_STUDIO',
        targetType: 'STUDIO',
        targetId: req.params.id,
        details: 'Studio information updated'
      }
    });
    
    res.json({
      success: true,
      data: studio,
      message: 'Studio updated successfully'
    });
  } catch (error) {
    console.error('Error updating studio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update studio'
    });
  }
});

/**
 * @route   POST /api/admin/studios/bulk-verify
 * @desc    Bulk verify multiple studios
 * @access  Admin only
 */
router.post('/studios/bulk-verify', protect, adminOnly, async (req, res) => {
  try {
    const { studioIds, isVerified, verificationNotes } = req.body;
    
    if (!studioIds || !Array.isArray(studioIds) || studioIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Studio IDs array is required'
      });
    }
    
    const results = await Promise.allSettled(
      studioIds.map(async (studioId) => {
        const studio = await prisma.studio.update({
          where: { id: studioId },
          data: {
            isVerified,
            verificationStatus: isVerified ? 'APPROVED' : 'REJECTED',
            verifiedAt: isVerified ? new Date() : null,
            verifiedBy: isVerified ? req.user.id : null
          }
        });
        
        return studio;
      })
    );
    
    // Log admin actions separately to avoid affecting the main operation
    const successfulUpdates = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
    
    for (const studio of successfulUpdates) {
      try {
        await prisma.adminAction.create({
          data: {
            adminId: req.user.id,
            action: 'BULK_VERIFY_STUDIO',
            targetType: 'STUDIO',
            targetId: studio.id,
            details: `Bulk ${isVerified ? 'approved' : 'rejected'}: ${studio.title}`
          }
        });
      } catch (error) {
        console.error('Failed to log admin action for studio:', studio.id, error);
      }
    }
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    res.json({
      success: true,
      data: {
        total: studioIds.length,
        successful,
        failed
      },
      message: `Bulk verification completed. ${successful} studios updated, ${failed} failed.`
    });
  } catch (error) {
    console.error('Error bulk verifying studios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk verify studios'
    });
  }
});

/**
 * @route   POST /api/admin/studios/bulk-feature
 * @desc    Bulk feature multiple studios
 * @access  Admin only
 */
router.post('/studios/bulk-feature', protect, adminOnly, async (req, res) => {
  try {
    const { studioIds, isFeatured } = req.body;
    
    if (!studioIds || !Array.isArray(studioIds) || studioIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Studio IDs array is required'
      });
    }
    
    const results = await Promise.allSettled(
      studioIds.map(async (studioId) => {
        const studio = await prisma.studio.update({
          where: { id: studioId },
          data: {
            isFeatured
          }
        });
        
        return studio;
      })
    );
    
    // Log admin actions separately to avoid affecting the main operation
    const successfulUpdates = results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
    
    for (const studio of successfulUpdates) {
      try {
        await prisma.adminAction.create({
          data: {
            adminId: req.user.id,
            action: 'BULK_FEATURE_STUDIO',
            targetType: 'STUDIO',
            targetId: studio.id,
            details: `Bulk ${isFeatured ? 'featured' : 'unfeatured'}: ${studio.title}`
          }
        });
      } catch (error) {
        console.error('Failed to log admin action for studio:', studio.id, error);
      }
    }
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;
    
    res.json({
      success: true,
      data: {
        total: studioIds.length,
        successful,
        failed
      },
      message: `Bulk featuring completed. ${successful} studios updated, ${failed} failed.`
    });
  } catch (error) {
    console.error('Error bulk featuring studios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk feature studios'
    });
  }
});

/**
 * @route   POST /api/admin/studios
 * @desc    Create a new studio
 * @access  Admin only
 */
router.post('/studios', protect, adminOnly, async (req, res) => {
  try {
    const {
      title,
      website,
      phoneNumber,
      email,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      linkedinUrl,
      youtubeUrl,
      address,
      city,
      state,
      zipCode,
      country,
      latitude,
      longitude
    } = req.body;
    
    // Validate required fields
    if (!title || !address || !city || !state) {
      return res.status(400).json({
        success: false,
        error: 'Title, address, city, and state are required'
      });
    }
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    const studio = await prisma.studio.create({
      data: {
        title,
        slug,
        website,
        phoneNumber,
        email,
        facebookUrl,
        instagramUrl,
        twitterUrl,
        linkedinUrl,
        youtubeUrl,
        address,
        city,
        state,
        zipCode,
        country: country || 'USA',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        isActive: true,
        isVerified: false,
        isFeatured: false,
        verificationStatus: 'PENDING'
      }
    });
    
    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'CREATE_STUDIO',
        targetType: 'STUDIO',
        targetId: studio.id,
        details: `Studio created: ${title}`
      }
    });
    
    res.json({
      success: true,
      data: studio,
      message: 'Studio created successfully'
    });
  } catch (error) {
    console.error('Error creating studio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create studio'
    });
  }
});

/**
 * @route   POST /api/admin/studios/bulk-delete
 * @desc    Permanently delete multiple studios
 * @access  Admin only
 */
router.post('/studios/bulk-delete', protect, adminOnly, async (req, res) => {
  try {
    const { studioIds } = req.body;
    
    if (!studioIds || !Array.isArray(studioIds) || studioIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Studio IDs array is required'
      });
    }
    
    // First, delete related studio artists for all studios
    await prisma.studioArtist.deleteMany({
      where: {
        studioId: {
          in: studioIds
        }
      }
    });
    
    // Then delete all studios
    const deletedStudios = await prisma.studio.deleteMany({
      where: {
        id: {
          in: studioIds
        }
      }
    });
    
    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'BULK_DELETE_STUDIOS',
        targetType: 'STUDIO',
        targetId: null,
        details: `Bulk deleted ${deletedStudios.count} studios`
      }
    });
    
    res.json({
      success: true,
      data: {
        deletedCount: deletedStudios.count
      },
      message: `Successfully deleted ${deletedStudios.count} studios`
    });
  } catch (error) {
    console.error('Error bulk deleting studios:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete studios'
    });
  }
});

/**
 * @route   DELETE /api/admin/studios/:id
 * @desc    Permanently delete a studio
 * @access  Admin only
 */
router.delete('/studios/:id', protect, adminOnly, async (req, res) => {
  try {
    // First, delete related studio artists
    await prisma.studioArtist.deleteMany({
      where: {
        studioId: req.params.id
      }
    });
    
    // Then delete the studio
    const studio = await prisma.studio.delete({
      where: { id: req.params.id }
    });
    
    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'DELETE_STUDIO',
        targetType: 'STUDIO',
        targetId: req.params.id,
        details: `Studio permanently deleted: ${studio.title}`
      }
    });
    
    res.json({
      success: true,
      data: studio,
      message: 'Studio permanently deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting studio:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete studio'
    });
  }
});

/**
 * @route   GET /api/admin/geocoding/status
 * @desc    Get automated geocoding system status
 * @access  Admin only
 */
router.get('/geocoding/status', async (req, res) => {
  try {
    const status = studioGeocodingTrigger.getStatus();
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting geocoding status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get geocoding status'
    });
  }
});

/**
 * @route   POST /api/admin/geocoding/trigger
 * @desc    Manually trigger geocoding for a studio
 * @access  Admin only
 */
router.post('/geocoding/trigger', [
  body('studioId').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Studio ID is required'
      });
    }

    const { studioId } = req.body;
    
    // Verify studio exists
    const studio = await prisma.studio.findUnique({
      where: { id: studioId }
    });
    
    if (!studio) {
      return res.status(404).json({
        success: false,
        error: 'Studio not found'
      });
    }
    
    // Trigger geocoding
    await studioGeocodingTrigger.triggerGeocodingForStudio(studioId);
    
    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'TRIGGER_GEOCODING',
        targetType: 'STUDIO',
        targetId: studioId,
        details: `Manually triggered geocoding for studio: ${studio.title}`
      }
    });
    
    res.json({
      success: true,
      message: `Geocoding triggered for studio: ${studio.title}`
    });
  } catch (error) {
    console.error('Error triggering geocoding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger geocoding'
    });
  }
});

/**
 * @route   POST /api/admin/geocoding/clear-queue
 * @desc    Clear the pending geocoding queue
 * @access  Admin only
 */
router.post('/geocoding/clear-queue', async (req, res) => {
  try {
    const status = studioGeocodingTrigger.getStatus();
    const clearedCount = status.pendingCount;
    
    studioGeocodingTrigger.clearPendingQueue();
    
    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'CLEAR_GEOCODING_QUEUE',
        targetType: 'SYSTEM',
        targetId: null,
        details: `Cleared geocoding queue with ${clearedCount} pending studios`
      }
    });
    
    res.json({
      success: true,
      message: `Cleared geocoding queue with ${clearedCount} pending studios`
    });
  } catch (error) {
    console.error('Error clearing geocoding queue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear geocoding queue'
    });
  }
});

/**
 * @route   POST /api/admin/geocoding/process-all
 * @desc    Process all studios that need geocoding
 * @access  Admin only
 */
router.post('/geocoding/process-all', async (req, res) => {
  try {
    // Find all studios that need geocoding
    const studiosNeedingGeocoding = await prisma.studio.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
          {
            AND: [
              { latitude: 45.5017 },
              { longitude: -73.5673 }
            ]
          }
        ],
        AND: [
          { address: { not: null } },
          { city: { not: null } }
        ]
      },
      select: { id: true, title: true }
    });
    
    // Add all to the queue
    for (const studio of studiosNeedingGeocoding) {
      studioGeocodingTrigger.triggerGeocodingForStudio(studio.id);
    }
    
    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'PROCESS_ALL_GEOCODING',
        targetType: 'SYSTEM',
        targetId: null,
        details: `Triggered geocoding for ${studiosNeedingGeocoding.length} studios`
      }
    });
    
    res.json({
      success: true,
      message: `Triggered geocoding for ${studiosNeedingGeocoding.length} studios`,
      data: {
        studiosCount: studiosNeedingGeocoding.length,
        studios: studiosNeedingGeocoding
      }
    });
  } catch (error) {
    console.error('Error processing all geocoding:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process all geocoding'
    });
  }
});

/**
 * @route   GET /api/admin/gallery
 * @desc    Get all tattoo gallery items with filtering and pagination
 * @access  Admin only
 */
router.get('/gallery', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, artist, isApproved, isHidden } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }
    
    if (artist) {
      where.artist = {
        user: {
          OR: [
            { firstName: { contains: artist, mode: 'insensitive' } },
            { lastName: { contains: artist, mode: 'insensitive' } }
          ]
        }
      };
    }
    
    if (isApproved !== undefined) {
      where.isApproved = isApproved === 'true';
    }
    
    if (isHidden !== undefined) {
      where.isHidden = isHidden === 'true';
    }

    const [galleryItems, total] = await Promise.all([
      prisma.tattooGallery.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          artist: {
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
          }
        }
      }),
      prisma.tattooGallery.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        galleryItems,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching gallery items'
    });
  }
});

/**
 * @route   PUT /api/admin/gallery/:id/moderate
 * @desc    Moderate gallery item (approve/hide)
 * @access  Admin only
 */
router.put('/gallery/:id/moderate', [
  body('isApproved').optional().isBoolean(),
  body('isHidden').optional().isBoolean(),
  body('clientConsent').optional().isBoolean(),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { isApproved, isHidden, clientConsent, reason } = req.body;

    const galleryItem = await prisma.tattooGallery.findUnique({
      where: { id },
      include: {
        artist: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        error: 'Gallery item not found'
      });
    }

    const updateData = {};
    if (isApproved !== undefined) updateData.isApproved = isApproved;
    if (isHidden !== undefined) updateData.isHidden = isHidden;
    if (clientConsent !== undefined) updateData.clientConsent = clientConsent;

    const updatedGalleryItem = await prisma.tattooGallery.update({
      where: { id },
      data: updateData,
      include: {
        artist: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'MODERATE_GALLERY',
        targetType: 'GALLERY',
        targetId: id,
        details: `Gallery moderation: approved=${isApproved}, hidden=${isHidden}, consent=${clientConsent}, reason=${reason || 'No reason'}`
      }
    });

    res.json({
      success: true,
      message: 'Gallery item moderated successfully',
      data: { galleryItem: updatedGalleryItem }
    });
  } catch (error) {
    console.error('Moderate gallery error:', error);
    res.status(500).json({
      success: false,
      error: 'Error moderating gallery item'
    });
  }
});

/**
 * @route   PUT /api/admin/gallery/approve-all
 * @desc    Approve all unapproved gallery items
 * @access  Admin only
 */
router.put('/gallery/approve-all', async (req, res) => {
  try {
    // Get all unapproved gallery items
    const unapprovedItems = await prisma.tattooGallery.findMany({
      where: {
        OR: [
          { isApproved: false },
          { clientConsent: false }
        ]
      },
      include: {
        artist: {
          include: {
            user: { select: { firstName: true, lastName: true } }
          }
        }
      }
    });

    if (unapprovedItems.length === 0) {
      return res.json({
        success: true,
        message: 'No unapproved gallery items found',
        data: { count: 0 }
      });
    }

    // Approve all items
    const result = await prisma.tattooGallery.updateMany({
      where: {
        OR: [
          { isApproved: false },
          { clientConsent: false }
        ]
      },
      data: {
        isApproved: true,
        clientConsent: true
      }
    });

    // Log admin action
    await prisma.adminAction.create({
      data: {
        adminId: req.user.id,
        action: 'APPROVE_ALL_GALLERY',
        targetType: 'GALLERY',
        targetId: 'BULK',
        details: `Approved ${result.count} gallery items in bulk`
      }
    });

    res.json({
      success: true,
      message: `Successfully approved ${result.count} gallery items`,
      data: { 
        count: result.count,
        items: unapprovedItems.map(item => ({
          id: item.id,
          title: item.title,
          artist: `${item.artist.user.firstName} ${item.artist.user.lastName}`
        }))
      }
    });
  } catch (error) {
    console.error('Approve all gallery error:', error);
    res.status(500).json({
      success: false,
      error: 'Error approving gallery items'
    });
  }
});

module.exports = router; 