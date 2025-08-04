const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { protect } = require('../middleware/auth');
const prisma = new PrismaClient();

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
router.get('/:id/artists', async (req, res) => {
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
                avatar: true,
                email: true
              }
            },
            specialties: {
              select: {
                id: true,
                name: true,
                category: true
              }
            }
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
    console.error('Error fetching studio artists:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studio artists'
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
        error: 'Only studio owners/managers or admins can add artists'
      });
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

// Get specific studio
router.get('/:id', async (req, res) => {
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