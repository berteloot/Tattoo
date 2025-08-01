const express = require('express');
const { prisma } = require('../utils/prisma');

const router = express.Router();

/**
 * @route   POST /api/emergency/fix-verification
 * @desc    Emergency fix to disable email verification (public endpoint)
 * @access  Public (for emergency use only)
 */
router.post('/fix-verification', async (req, res) => {
  try {
    console.log('🚨 EMERGENCY FIX: Disabling email verification for all users');
    
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

    console.log(`✅ Emergency fix completed: ${users.length} users updated`);

    res.json({
      success: true,
      message: `Emergency fix completed: ${users.length} users updated`,
      data: {
        usersFixed: users.length,
        users: users.map(u => ({ id: u.id, email: u.email, role: u.role }))
      }
    });

  } catch (error) {
    console.error('Emergency fix error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during emergency fix'
    });
  }
});

module.exports = router; 