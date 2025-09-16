const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const { prisma } = require('../utils/prisma');

// All email template routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

/**
 * @route   GET /api/email-templates
 * @desc    Get all email templates
 * @access  Admin only
 */
router.get('/', async (req, res) => {
  try {
    const { type, isActive } = req.query;
    
    const where = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email templates',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/email-templates/:id
 * @desc    Get specific email template
 * @access  Admin only
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Email template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email template',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/email-templates
 * @desc    Create new email template
 * @access  Admin only
 */
router.post('/', [
  body('name')
    .notEmpty()
    .withMessage('Template name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Template name must be between 3 and 100 characters'),
  body('type')
    .notEmpty()
    .withMessage('Template type is required')
    .isIn(['EMAIL_VERIFICATION', 'WELCOME', 'PASSWORD_RESET', 'INCOMPLETE_PROFILE_REMINDER', 'ARTIST_VERIFICATION', 'REVIEW_NOTIFICATION', 'BOOKING_CONFIRMATION', 'ARTIST_TO_CLIENT', 'CLIENT_TO_ARTIST', 'CLIENT_TO_STUDIO', 'STUDIO_JOIN_REQUEST', 'STUDIO_JOIN_RESPONSE'])
    .withMessage('Invalid template type'),
  body('subject')
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('htmlContent')
    .notEmpty()
    .withMessage('HTML content is required')
    .isLength({ min: 50 })
    .withMessage('HTML content must be at least 50 characters'),
  body('variables')
    .optional()
    .isArray()
    .withMessage('Variables must be an array'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
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

    const { name, type, subject, htmlContent, textContent, variables, description, isActive } = req.body;

    // Check if template name already exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { name }
    });

    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        error: 'Template name already exists'
      });
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        type,
        subject,
        htmlContent,
        textContent: textContent || null,
        variables: variables || [],
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user.id,
        updatedBy: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create email template',
      details: error.message
    });
  }
});

/**
 * @route   PUT /api/email-templates/:id
 * @desc    Update email template
 * @access  Admin only
 */
router.put('/:id', [
  body('name')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Template name must be between 3 and 100 characters'),
  body('type')
    .optional()
    .isIn(['EMAIL_VERIFICATION', 'WELCOME', 'PASSWORD_RESET', 'INCOMPLETE_PROFILE_REMINDER', 'ARTIST_VERIFICATION', 'REVIEW_NOTIFICATION', 'BOOKING_CONFIRMATION', 'ARTIST_TO_CLIENT', 'CLIENT_TO_ARTIST', 'CLIENT_TO_STUDIO', 'STUDIO_JOIN_REQUEST', 'STUDIO_JOIN_RESPONSE'])
    .withMessage('Invalid template type'),
  body('subject')
    .optional()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('htmlContent')
    .optional()
    .isLength({ min: 50 })
    .withMessage('HTML content must be at least 50 characters'),
  body('variables')
    .optional()
    .isArray()
    .withMessage('Variables must be an array'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
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
    const updateData = req.body;

    // Check if template exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        error: 'Email template not found'
      });
    }

    // Check if new name conflicts with existing template
    if (updateData.name && updateData.name !== existingTemplate.name) {
      const nameConflict = await prisma.emailTemplate.findUnique({
        where: { name: updateData.name }
      });

      if (nameConflict) {
        return res.status(400).json({
          success: false,
          error: 'Template name already exists'
        });
      }
    }

    // Add updatedBy field
    updateData.updatedBy = req.user.id;

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      data: template
    });

  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update email template',
      details: error.message
    });
  }
});

/**
 * @route   DELETE /api/email-templates/:id
 * @desc    Delete email template
 * @access  Admin only
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if template exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return res.status(404).json({
        success: false,
        error: 'Email template not found'
      });
    }

    await prisma.emailTemplate.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Email template deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete email template',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/email-templates/:id/preview
 * @desc    Preview email template with sample data
 * @access  Admin only
 */
router.post('/:id/preview', [
  body('variables')
    .optional()
    .isObject()
    .withMessage('Variables must be an object')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { variables = {} } = req.body;

    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Email template not found'
      });
    }

    // Replace variables in template content
    let previewSubject = template.subject;
    let previewHtml = template.htmlContent;
    let previewText = template.textContent;

    // Replace variables in subject and content
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      previewSubject = previewSubject.replace(regex, value);
      previewHtml = previewHtml.replace(regex, value);
      if (previewText) {
        previewText = previewText.replace(regex, value);
      }
    });

    res.json({
      success: true,
      data: {
        subject: previewSubject,
        htmlContent: previewHtml,
        textContent: previewText,
        variables: template.variables
      }
    });

  } catch (error) {
    console.error('Error previewing email template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to preview email template',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/email-templates/:id/test
 * @desc    Send test email with template
 * @access  Admin only
 */
router.post('/:id/test', [
  body('testEmail')
    .isEmail()
    .withMessage('Valid test email is required'),
  body('variables')
    .optional()
    .isObject()
    .withMessage('Variables must be an object')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { testEmail, variables = {} } = req.body;

    const template = await prisma.emailTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Email template not found'
      });
    }

    // Import email service
    const emailService = require('../utils/emailService');

    // Replace variables in template content
    let testSubject = template.subject;
    let testHtml = template.htmlContent;
    let testText = template.textContent;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      testSubject = testSubject.replace(regex, value);
      testHtml = testHtml.replace(regex, value);
      if (testText) {
        testText = testText.replace(regex, value);
      }
    });

    // Send test email
    const result = await emailService.sendEmail(testEmail, testSubject, testHtml, testText);

    res.json({
      success: result.success,
      data: {
        messageId: result.messageId,
        error: result.error
      }
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test email',
      details: error.message
    });
  }
});

module.exports = router;
