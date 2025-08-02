const express = require('express');
const { prisma } = require('../utils/prisma');
const bcrypt = require('bcryptjs');

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

/**
 * @route   POST /api/emergency/reset-password
 * @desc    Reset password for specific user (public endpoint for emergency)
 * @access  Public (for emergency use only)
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email and newPassword are required'
      });
    }
    
    console.log(`🔧 RESETTING PASSWORD FOR: ${email}`);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        emailVerified: true,
        isActive: true
      }
    });
    
    console.log(`✅ Password reset successful for: ${email}`);
    
    res.json({
      success: true,
      message: `Password reset successful for ${email}`,
      data: {
        email: user.email,
        role: user.role,
        emailVerified: true,
        isActive: true
      }
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during password reset'
    });
  }
});

module.exports = router; 