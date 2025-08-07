const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { protect, authorize } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');
const { uploadImage } = require('../utils/cloudinary');

const router = express.Router();
const prisma = new PrismaClient();

// Get all gallery items with filtering
router.get('/', async (req, res) => {
  try {
    const {
      artistId,
      style,
      location,
      featured,
      beforeAfter,
      limit = 20,
      offset = 0,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const where = {
      isApproved: true,
      isHidden: false,
      clientConsent: true
    };

    if (artistId) where.artistId = artistId;
    if (style) where.tattooStyle = style;
    if (location) where.bodyLocation = location;
    if (featured === 'true') where.isFeatured = true;
    if (beforeAfter === 'true') where.isBeforeAfter = true;

    const orderBy = {};
    orderBy[sort] = order;

    const galleryItems = await prisma.tattooGallery.findMany({
      where,
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
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            views: true
          }
        }
      },
      orderBy,
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.tattooGallery.count({ where });

    res.json({
      success: true,
      data: {
        items: galleryItems,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + parseInt(limit) < total
        }
      }
    });
  } catch (error) {
    console.error('Gallery fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch gallery items' });
  }
});

// Get single gallery item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const referrer = req.get('Referrer');

    const galleryItem = await prisma.tattooGallery.findUnique({
      where: { id },
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
        },
        comments: {
          where: {
            isApproved: true,
            isHidden: false
          },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            views: true
          }
        }
      }
    });

    if (!galleryItem) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }

    // Record view
    await prisma.tattooGalleryView.create({
      data: {
        galleryItemId: id,
        viewerIp: userIp,
        userAgent,
        referrer
      }
    });

    res.json({ success: true, data: galleryItem });
  } catch (error) {
    console.error('Gallery item fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch gallery item' });
  }
});

// Create gallery item (ARTIST only)
router.post('/', 
  protect, 
  authorize('ARTIST', 'ADMIN'), 
  handleUpload,
  [
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
    body('description').optional().trim(),
    body('tattooStyle').optional().trim(),
    body('bodyLocation').optional().trim(),
    body('tattooSize').optional().trim(),
    body('colorType').optional().trim(),
    body('sessionCount').optional().isInt({ min: 1 }).withMessage('Session count must be at least 1'),
    body('hoursSpent').optional().isInt({ min: 1 }).withMessage('Hours spent must be at least 1'),
    body('clientConsent').isBoolean().withMessage('Client consent is required'),
    body('clientAnonymous').isBoolean().withMessage('Client anonymous setting is required'),
    body('clientAgeVerified').isBoolean().withMessage('Client age verification is required'),
    body('isBeforeAfter').isBoolean().withMessage('Before/after setting is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('categories').optional().isArray().withMessage('Categories must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      if (!req.uploadedFile) {
        return res.status(400).json({ success: false, error: 'Image is required' });
      }

      // Get artist profile
      const artistProfile = await prisma.artistProfile.findUnique({
        where: { userId: req.user.id }
      });

      if (!artistProfile) {
        return res.status(400).json({ success: false, error: 'Artist profile not found' });
      }

      // Upload image to Cloudinary
      const uploadResult = await uploadImage(req.uploadedFile.buffer, 'tattoo-gallery');
      
      let beforeImageUrl = null;
      let afterImageUrl = null;
      let beforeImagePublicId = null;
      let afterImagePublicId = null;

      // Note: Before/after images would need to be handled separately with additional upload middleware
      // For now, we'll focus on the main image upload

      const galleryItem = await prisma.tattooGallery.create({
        data: {
          artistId: artistProfile.id,
          title: req.body.title,
          description: req.body.description,
          imageUrl: uploadResult.url,
          imagePublicId: uploadResult.public_id,
          imageWidth: uploadResult.width,
          imageHeight: uploadResult.height,
          imageFormat: uploadResult.format,
          imageBytes: uploadResult.bytes,
          thumbnailUrl: uploadResult.url.replace('/upload/', '/upload/c_thumb,w_300,h_300/'),
          tattooStyle: req.body.tattooStyle,
          bodyLocation: req.body.bodyLocation,
          tattooSize: req.body.tattooSize,
          colorType: req.body.colorType,
          sessionCount: parseInt(req.body.sessionCount) || 1,
          hoursSpent: req.body.hoursSpent ? parseInt(req.body.hoursSpent) : null,
          clientConsent: req.body.clientConsent === 'true',
          clientAnonymous: req.body.clientAnonymous === 'true',
          clientAgeVerified: req.body.clientAgeVerified === 'true',
          isBeforeAfter: req.body.isBeforeAfter === 'true',
          beforeImageUrl,
          beforeImagePublicId,
          afterImageUrl,
          afterImagePublicId,
          tags: req.body.tags ? JSON.parse(req.body.tags) : [],
          categories: req.body.categories ? JSON.parse(req.body.categories) : [],
          completedAt: req.body.completedAt ? new Date(req.body.completedAt) : null
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

      res.status(201).json({ success: true, data: galleryItem });
    } catch (error) {
      console.error('Gallery item creation error:', error);
      res.status(500).json({ success: false, error: 'Failed to create gallery item' });
    }
  }
);

// Update gallery item (owner or admin only)
router.put('/:id', 
  protect, 
  authorize('ARTIST', 'ADMIN'), 
  handleUpload,
  [
    body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Title must be less than 255 characters'),
    body('description').optional().trim(),
    body('tattooStyle').optional().trim(),
    body('bodyLocation').optional().trim(),
    body('tattooSize').optional().trim(),
    body('colorType').optional().trim(),
    body('sessionCount').optional().isInt({ min: 1 }).withMessage('Session count must be at least 1'),
    body('hoursSpent').optional().isInt({ min: 1 }).withMessage('Hours spent must be at least 1'),
    body('isHidden').optional().isBoolean().withMessage('Hidden setting must be boolean'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('categories').optional().isArray().withMessage('Categories must be an array')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { id } = req.params;

      // Check if gallery item exists and user has permission
      const existingItem = await prisma.tattooGallery.findUnique({
        where: { id },
        include: { artist: true }
      });

      if (!existingItem) {
        return res.status(404).json({ success: false, error: 'Gallery item not found' });
      }

      // Check permissions (owner or admin)
      const isOwner = existingItem.artist.userId === req.user.id;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, error: 'Not authorized to update this gallery item' });
      }

      const updateData = {};

      // Handle text fields
      if (req.body.title) updateData.title = req.body.title;
      if (req.body.description !== undefined) updateData.description = req.body.description;
      if (req.body.tattooStyle) updateData.tattooStyle = req.body.tattooStyle;
      if (req.body.bodyLocation) updateData.bodyLocation = req.body.bodyLocation;
      if (req.body.tattooSize) updateData.tattooSize = req.body.tattooSize;
      if (req.body.colorType) updateData.colorType = req.body.colorType;
      if (req.body.sessionCount) updateData.sessionCount = parseInt(req.body.sessionCount);
      if (req.body.hoursSpent) updateData.hoursSpent = parseInt(req.body.hoursSpent);
      if (req.body.tags) updateData.tags = JSON.parse(req.body.tags);
      if (req.body.categories) updateData.categories = JSON.parse(req.body.categories);
      if (req.body.completedAt) updateData.completedAt = new Date(req.body.completedAt);

      // Admin can update approval status
      if (isAdmin && req.body.isApproved !== undefined) {
        updateData.isApproved = req.body.isApproved === 'true';
      }

      // Handle image upload
      if (req.uploadedFile) {
        const uploadResult = await uploadImage(req.uploadedFile.buffer, 'tattoo-gallery');
        updateData.imageUrl = uploadResult.url;
        updateData.imagePublicId = uploadResult.public_id;
        updateData.imageWidth = uploadResult.width;
        updateData.imageHeight = uploadResult.height;
        updateData.imageFormat = uploadResult.format;
        updateData.imageBytes = uploadResult.bytes;
        updateData.thumbnailUrl = uploadResult.url.replace('/upload/', '/upload/c_thumb,w_300,h_300/');
      }

      const updatedItem = await prisma.tattooGallery.update({
        where: { id },
        data: updateData,
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

      res.json({ success: true, data: updatedItem });
    } catch (error) {
      console.error('Gallery item update error:', error);
      res.status(500).json({ success: false, error: 'Failed to update gallery item' });
    }
  }
);

// Delete gallery item (owner or admin only)
router.delete('/:id', 
  protect, 
  authorize('ARTIST', 'ADMIN'), 
  async (req, res) => {
    try {
      const { id } = req.params;

      const galleryItem = await prisma.tattooGallery.findUnique({
        where: { id },
        include: { artist: true }
      });

      if (!galleryItem) {
        return res.status(404).json({ success: false, error: 'Gallery item not found' });
      }

      // Check permissions
      const isOwner = galleryItem.artist.userId === req.user.id;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, error: 'Not authorized to delete this gallery item' });
      }

      await prisma.tattooGallery.delete({ where: { id } });

      res.json({ success: true, message: 'Gallery item deleted successfully' });
    } catch (error) {
      console.error('Gallery item deletion error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete gallery item' });
    }
  }
);

// Like/unlike gallery item
router.post('/:id/like', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const existingLike = await prisma.tattooGalleryLike.findUnique({
      where: {
        galleryItemId_userId: {
          galleryItemId: id,
          userId: req.user.id
        }
      }
    });

    if (existingLike) {
      // Unlike
      await prisma.tattooGalleryLike.delete({
        where: { id: existingLike.id }
      });
      res.json({ success: true, liked: false });
    } else {
      // Like
      await prisma.tattooGalleryLike.create({
        data: {
          galleryItemId: id,
          userId: req.user.id
        }
      });
      res.json({ success: true, liked: true });
    }
  } catch (error) {
    console.error('Gallery like error:', error);
    res.status(500).json({ success: false, error: 'Failed to toggle like' });
  }
});

// Add comment to gallery item
router.post('/:id/comments', 
  protect, 
  [
    body('comment').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: errors.array()[0].msg });
      }

      const { id } = req.params;
      const { comment } = req.body;

      const newComment = await prisma.tattooGalleryComment.create({
        data: {
          galleryItemId: id,
          userId: req.user.id,
          comment
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true
            }
          }
        }
      });

      res.status(201).json({ success: true, data: newComment });
    } catch (error) {
      console.error('Gallery comment error:', error);
      res.status(500).json({ success: false, error: 'Failed to add comment' });
    }
  }
);

// Get artist gallery statistics
router.get('/stats/artist/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;

    const stats = await prisma.tattooGallery.aggregate({
      where: {
        artistId,
        isApproved: true,
        isHidden: false
      },
      _count: {
        id: true
      },
      _avg: {
        hoursSpent: true
      },
      _sum: {
        hoursSpent: true
      }
    });

    const featuredCount = await prisma.tattooGallery.count({
      where: {
        artistId,
        isApproved: true,
        isHidden: false,
        isFeatured: true
      }
    });

    const beforeAfterCount = await prisma.tattooGallery.count({
      where: {
        artistId,
        isApproved: true,
        isHidden: false,
        isBeforeAfter: true
      }
    });

    const uniqueStyles = await prisma.tattooGallery.findMany({
      where: {
        artistId,
        isApproved: true,
        isHidden: false,
        tattooStyle: { not: null }
      },
      select: { tattooStyle: true },
      distinct: ['tattooStyle']
    });

    const uniqueLocations = await prisma.tattooGallery.findMany({
      where: {
        artistId,
        isApproved: true,
        isHidden: false,
        bodyLocation: { not: null }
      },
      select: { bodyLocation: true },
      distinct: ['bodyLocation']
    });

    res.json({
      success: true,
      data: {
        totalItems: stats._count.id,
        featuredItems: featuredCount,
        beforeAfterItems: beforeAfterCount,
        avgHoursPerPiece: stats._avg.hoursSpent,
        totalHoursWorked: stats._sum.hoursSpent,
        uniqueStyles: uniqueStyles.length,
        uniqueLocations: uniqueLocations.length
      }
    });
  } catch (error) {
    console.error('Gallery stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch gallery statistics' });
  }
});

module.exports = router; 