const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/specialties
 * @desc    Get all specialties
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const specialties = await prisma.specialty.findMany({
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: { specialties }
    });
  } catch (error) {
    console.error('Get specialties error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching specialties'
    });
  }
});

module.exports = router; 