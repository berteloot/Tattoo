const express = require('express');
const { prisma } = require('../utils/prisma');

const router = express.Router();

/**
 * @route   GET /api/specialties
 * @desc    Get all specialties organized by categories
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const specialties = await prisma.specialty.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    // Group specialties by category
    const specialtiesByCategory = specialties.reduce((acc, specialty) => {
      if (!acc[specialty.category]) {
        acc[specialty.category] = [];
      }
      acc[specialty.category].push(specialty);
      return acc;
    }, {});

    res.json({
      success: true,
      data: { 
        specialties,
        specialtiesByCategory
      }
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