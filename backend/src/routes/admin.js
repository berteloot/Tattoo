const express = require('express');
const { body, validationResult } = require('express-validator');
const { prisma } = require('../utils/prisma');
const { protect, adminOnly, requireOwnership } = require('../middleware/auth');

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
      prisma.user.count({ where: { role: 'ARTIST' } }),
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



module.exports = router; 