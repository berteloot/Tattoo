const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { prisma } = require('../utils/prisma');

const router = express.Router();

/**
 * @route   GET /api/messages/artist/:artistId
 * @desc    Get active messages for an artist (public endpoint)
 * @access  Public
 */
router.get('/artist/:artistId', [
  param('artistId').isString().withMessage('Artist ID must be a string')
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

    const { artistId } = req.params;

    // Get active messages that haven't expired
    const messages = await prisma.artistMessage.findMany({
      where: {
        artistId,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Error fetching artist messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

/**
 * @route   GET /api/messages/my-messages
 * @desc    Get all messages for the authenticated artist
 * @access  Private (Artist only)
 */
router.get('/my-messages', protect, authorize('ARTIST', 'ARTIST_ADMIN'), async (req, res) => {
  try {
    const user = req.user;

    // Get artist profile
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: user.id }
    });

    if (!artistProfile) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Get all messages for this artist
    const messages = await prisma.artistMessage.findMany({
      where: { artistId: artistProfile.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Error fetching artist messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
});

/**
 * @route   POST /api/messages
 * @desc    Create a new artist message
 * @access  Private (Artist only)
 */
router.post('/', protect, authorize('ARTIST', 'ARTIST_ADMIN'), [
  body('title').optional().isString().isLength({ max: 200 }).withMessage('Title must be a string with max 200 characters'),
  body('content').isString().isLength({ min: 1, max: 2000 }).withMessage('Content is required and must be max 2000 characters'),
  body('expiresAt').optional().isISO8601().withMessage('Expires at must be a valid date'),
  body('priority').optional().isInt({ min: 1, max: 3 }).withMessage('Priority must be 1, 2, or 3'),
  body('showOnCard').optional().isBoolean().withMessage('Show on card must be a boolean'),
  body('showOnProfile').optional().isBoolean().withMessage('Show on profile must be a boolean')
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

    const user = req.user;
    const { title, content, expiresAt, priority, showOnCard, showOnProfile } = req.body;

    // Get artist profile
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: user.id }
    });

    if (!artistProfile) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Check if artist has reached message limit (max 5 active messages)
    const activeMessagesCount = await prisma.artistMessage.count({
      where: {
        artistId: artistProfile.id,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      }
    });

    if (activeMessagesCount >= 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum of 5 active messages allowed. Please deactivate or wait for some messages to expire.'
      });
    }

    // Create message
    const message = await prisma.artistMessage.create({
      data: {
        artistId: artistProfile.id,
        title,
        content,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        priority: priority || 1,
        showOnCard: showOnCard !== undefined ? showOnCard : true,
        showOnProfile: showOnProfile !== undefined ? showOnProfile : true
      }
    });

    res.status(201).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    console.error('Error creating artist message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create message'
    });
  }
});

/**
 * @route   PUT /api/messages/:id
 * @desc    Update an artist message
 * @access  Private (Artist only - own messages)
 */
router.put('/:id', protect, authorize('ARTIST', 'ARTIST_ADMIN'), [
  param('id').isString().withMessage('Message ID must be a string'),
  body('title').optional().isString().isLength({ max: 200 }).withMessage('Title must be a string with max 200 characters'),
  body('content').optional().isString().isLength({ min: 1, max: 2000 }).withMessage('Content must be max 2000 characters'),
  body('expiresAt').optional().isISO8601().withMessage('Expires at must be a valid date'),
  body('priority').optional().isInt({ min: 1, max: 3 }).withMessage('Priority must be 1, 2, or 3'),
  body('showOnCard').optional().isBoolean().withMessage('Show on card must be a boolean'),
  body('showOnProfile').optional().isBoolean().withMessage('Show on profile must be a boolean'),
  body('isActive').optional().isBoolean().withMessage('Is active must be a boolean')
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

    const user = req.user;
    const { id } = req.params;
    const updateData = req.body;

    // Get artist profile
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: user.id }
    });

    if (!artistProfile) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Check if message exists and belongs to the artist
    const existingMessage = await prisma.artistMessage.findFirst({
      where: {
        id,
        artistId: artistProfile.id
      }
    });

    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or access denied'
      });
    }

    // Handle expiresAt conversion
    if (updateData.expiresAt) {
      updateData.expiresAt = new Date(updateData.expiresAt);
    }

    // Update message
    const message = await prisma.artistMessage.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: { message }
    });
  } catch (error) {
    console.error('Error updating artist message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update message'
    });
  }
});

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete an artist message
 * @access  Private (Artist only - own messages)
 */
router.delete('/:id', protect, authorize('ARTIST', 'ARTIST_ADMIN'), [
  param('id').isString().withMessage('Message ID must be a string')
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

    const user = req.user;
    const { id } = req.params;

    // Get artist profile
    const artistProfile = await prisma.artistProfile.findUnique({
      where: { userId: user.id }
    });

    if (!artistProfile) {
      return res.status(404).json({
        success: false,
        error: 'Artist profile not found'
      });
    }

    // Check if message exists and belongs to the artist
    const existingMessage = await prisma.artistMessage.findFirst({
      where: {
        id,
        artistId: artistProfile.id
      }
    });

    if (!existingMessage) {
      return res.status(404).json({
        success: false,
        error: 'Message not found or access denied'
      });
    }

    // Delete message
    await prisma.artistMessage.delete({
      where: { id }
    });

    res.json({
      success: true,
      data: { message: 'Message deleted successfully' }
    });
  } catch (error) {
    console.error('Error deleting artist message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete message'
    });
  }
});

module.exports = router;
