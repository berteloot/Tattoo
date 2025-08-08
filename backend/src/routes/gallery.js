const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { protect, authorize, artistOnly, artistOrAdmin } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');
const { uploadImage, deleteImage } = require('../utils/cloudinary');

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
      limit = 20,
      offset = 0
    } = req.query;

    const where = {
      isHidden: false
    };

    // If artistId is provided (artist viewing their own gallery), show all their items
    // Otherwise, only show approved items (public gallery view)
    if (artistId) {
      where.artistId = artistId;
      // Don't filter by isApproved for artist's own gallery
    } else {
      where.isApproved = true;
    }
    if (style) where.tattooStyle = style;
    if (location) where.bodyLocation = location;
    if (featured === 'true') where.isFeatured = true;

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
        }
      },
      orderBy: { createdAt: 'desc' },
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
        }
      }
    });

    if (!galleryItem) {
      return res.status(404).json({ success: false, error: 'Gallery item not found' });
    }

    res.json({ success: true, data: galleryItem });
  } catch (error) {
    console.error('Gallery item fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch gallery item' });
  }
});

// Create gallery item (ARTIST only)
router.post('/', 
  protect, 
  artistOnly, 
  handleUpload,
  [
    body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be less than 255 characters'),
    body('description').optional().trim(),
    body('tattooStyle').optional().trim(),
    body('bodyLocation').optional().trim(),
    body('tags').optional().trim().custom((value) => {
      if (value && value !== '') {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            throw new Error('Tags must be a valid JSON array');
          }
          return true;
        } catch (error) {
          throw new Error('Tags must be a valid JSON array');
        }
      }
      return true;
    }).withMessage('Tags must be a valid JSON array'),
    body('categories').optional().trim().custom((value) => {
      if (value && value !== '') {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            throw new Error('Categories must be a valid JSON array');
          }
          return true;
        } catch (error) {
          throw new Error('Categories must be a valid JSON array');
        }
      }
      return true;
    }).withMessage('Categories must be a valid JSON array')
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
          tattooStyle: req.body.tattooStyle,
          bodyLocation: req.body.bodyLocation,
          tags: req.body.tags ? JSON.parse(req.body.tags) : [],
          categories: req.body.categories ? JSON.parse(req.body.categories) : []
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
  artistOrAdmin, 
  handleUpload,
  [
    body('title').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Title must be less than 255 characters'),
    body('description').optional().trim(),
    body('tattooStyle').optional().trim(),
    body('bodyLocation').optional().trim(),
    body('tags').optional().trim().custom((value) => {
      if (value && value !== '') {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            throw new Error('Tags must be a valid JSON array');
          }
          return true;
        } catch (error) {
          throw new Error('Tags must be a valid JSON array');
        }
      }
      return true;
    }).withMessage('Tags must be a valid JSON array')
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
      if (req.body.tags) updateData.tags = JSON.parse(req.body.tags);

      // Handle image upload
      if (req.uploadedFile) {
        const uploadResult = await uploadImage(req.uploadedFile.buffer, 'tattoo-gallery');
        
        updateData.imageUrl = uploadResult.url;
        updateData.imagePublicId = uploadResult.public_id;
        updateData.imageWidth = uploadResult.width;
        updateData.imageHeight = uploadResult.height;
        updateData.imageFormat = uploadResult.format;
        updateData.imageBytes = uploadResult.bytes;
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
  artistOrAdmin, 
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

      // Delete from Cloudinary if public ID exists
      if (galleryItem.imagePublicId) {
        try {
          await deleteImage(galleryItem.imagePublicId);
        } catch (cloudinaryError) {
          console.error('Cloudinary delete error:', cloudinaryError);
          // Continue with database deletion even if Cloudinary delete fails
        }
      }

      await prisma.tattooGallery.delete({ where: { id } });

      res.json({ success: true, message: 'Gallery item deleted successfully' });
    } catch (error) {
      console.error('Gallery item deletion error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete gallery item' });
    }
  }
);

module.exports = router; 