const express = require('express');
const { prisma } = require('../utils/prisma');
const { protect } = require('../middleware/auth');
const { validateArtistService } = require('../middleware/artistValidation');

const router = express.Router();

/**
 * @route   GET /api/artist-services
 * @desc    Get all artist services for the authenticated artist
 * @access  Private (ARTIST role only)
 */
router.get('/', protect, async (req, res) => {
  try {
    // Check if user has artist profile
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!artistProfile) {
      return res.status(403).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    const artistServices = await prisma.artistService.findMany({
      where: { artistId: artistProfile.id },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true
          }
        }
      },
      orderBy: { service: { name: 'asc' } }
    });

    res.json({
      success: true,
      data: { artistServices }
    });
  } catch (error) {
    console.error('Get artist services error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching artist services'
    });
  }
});

/**
 * @route   POST /api/artist-services
 * @desc    Create or update artist service pricing
 * @access  Private (ARTIST role only)
 */
router.post('/', protect, validateArtistService, async (req, res) => {
  try {
    const { serviceId, customPrice, customDuration } = req.body;

    // Check if user has artist profile
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!artistProfile) {
      return res.status(403).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Check if artist service already exists
    const existingArtistService = await prisma.artistService.findUnique({
      where: {
        artistId_serviceId: {
          artistId: artistProfile.id,
          serviceId: serviceId
        }
      }
    });

    let artistService;
    if (existingArtistService) {
      // Update existing artist service
      artistService = await prisma.artistService.update({
        where: { id: existingArtistService.id },
        data: {
          customPrice: customPrice !== undefined ? customPrice : null,
          customDuration: customDuration !== undefined ? customDuration : null,
          updatedAt: new Date()
        },
        include: {
          service: {
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
    } else {
      // Create new artist service
      artistService = await prisma.artistService.create({
        data: {
          artistId: artistProfile.id,
          serviceId: serviceId,
          customPrice: customPrice !== undefined ? customPrice : null,
          customDuration: customDuration !== undefined ? customDuration : null
        },
        include: {
          service: {
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
    }

    res.json({
      success: true,
      message: existingArtistService ? 'Artist service updated successfully' : 'Artist service created successfully',
      data: { artistService }
    });
  } catch (error) {
    console.error('Create/update artist service error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating/updating artist service'
    });
  }
});

/**
 * @route   PUT /api/artist-services/:id
 * @desc    Update artist service pricing
 * @access  Private (ARTIST role only, owner only)
 */
router.put('/:id', protect, validateArtistService, async (req, res) => {
  try {
    const { id } = req.params;
    const { customPrice, customDuration } = req.body;

    // Check if user has artist profile
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!artistProfile) {
      return res.status(403).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Check if artist service exists and belongs to user
    const existingArtistService = await prisma.artistService.findUnique({
      where: { id }
    });

    if (!existingArtistService) {
      return res.status(404).json({
        success: false,
        error: 'Artist service not found'
      });
    }

    if (existingArtistService.artistId !== artistProfile.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this artist service'
      });
    }

    const updatedArtistService = await prisma.artistService.update({
      where: { id },
      data: {
        customPrice: customPrice !== undefined ? customPrice : null,
        customDuration: customDuration !== undefined ? customDuration : null,
        updatedAt: new Date()
      },
      include: {
        service: {
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

    res.json({
      success: true,
      message: 'Artist service updated successfully',
      data: { artistService: updatedArtistService }
    });
  } catch (error) {
    console.error('Update artist service error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating artist service'
    });
  }
});

/**
 * @route   DELETE /api/artist-services/:id
 * @desc    Delete artist service pricing (revert to default)
 * @access  Private (ARTIST role only, owner only)
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user has artist profile
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!artistProfile) {
      return res.status(403).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Check if artist service exists and belongs to user
    const existingArtistService = await prisma.artistService.findUnique({
      where: { id }
    });

    if (!existingArtistService) {
      return res.status(404).json({
        success: false,
        error: 'Artist service not found'
      });
    }

    if (existingArtistService.artistId !== artistProfile.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this artist service'
      });
    }

    await prisma.artistService.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Artist service pricing removed successfully'
    });
  } catch (error) {
    console.error('Delete artist service error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting artist service'
    });
  }
});

/**
 * @route   GET /api/artist-services/artist/:artistId
 * @desc    Get all services for a specific artist (public)
 * @access  Public
 */
router.get('/artist/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;

    const artistServices = await prisma.artistService.findMany({
      where: { 
        artistId: artistId,
        isActive: true
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            duration: true
          }
        }
      },
      orderBy: { service: { name: 'asc' } }
    });

    res.json({
      success: true,
      data: { artistServices }
    });
  } catch (error) {
    console.error('Get artist services by artist ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching artist services'
    });
  }
});

module.exports = router;
