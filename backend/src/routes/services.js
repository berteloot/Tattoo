const express = require('express');
const { prisma } = require('../utils/prisma');

const router = express.Router();

/**
 * @route   GET /api/services
 * @desc    Get all services
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: { services }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching services'
    });
  }
});

module.exports = router; 