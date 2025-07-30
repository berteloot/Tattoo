const express = require('express');
const { prisma } = require('../utils/prisma');

const router = express.Router();

/**
 * @route   POST /api/setup/make-admin
 * @desc    Make berteloot@gmail.com an admin (temporary endpoint)
 * @access  Public (temporary)
 */
router.post('/make-admin', async (req, res) => {
  try {
    console.log('🔄 Making berteloot@gmail.com an admin...');
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'berteloot@gmail.com' }
    });

    if (!user) {
      console.log('❌ User berteloot@gmail.com not found. Creating new admin user...');
      
      // Create new admin user
      const newAdmin = await prisma.user.create({
        data: {
          email: 'berteloot@gmail.com',
          password: '$2a$10$dummy.hash.for.admin.user', // Will need to be reset
          firstName: 'Stanislas',
          lastName: 'Berteloot',
          role: 'ADMIN',
          isActive: true,
          isVerified: true,
          phone: '+1234567890'
        }
      });
      
      console.log('✅ Created new admin user:', newAdmin.email);
      
      res.json({
        success: true,
        message: 'Created new admin user',
        user: {
          email: newAdmin.email,
          role: newAdmin.role
        }
      });
      
    } else {
      console.log('✅ User found:', user.email);
      console.log('Current role:', user.role);
      
      if (user.role === 'ADMIN') {
        console.log('ℹ️  User is already an admin');
        
        res.json({
          success: true,
          message: 'User is already an admin',
          user: {
            email: user.email,
            role: user.role
          }
        });
      } else {
        // Update user to admin
        const updatedUser = await prisma.user.update({
          where: { email: 'berteloot@gmail.com' },
          data: {
            role: 'ADMIN',
            isActive: true,
            isVerified: true
          }
        });
        
        console.log('✅ Updated user to admin:', updatedUser.email);
        console.log('New role:', updatedUser.role);
        
        res.json({
          success: true,
          message: 'Updated user to admin',
          user: {
            email: updatedUser.email,
            role: updatedUser.role
          }
        });
      }
    }

    console.log('🎉 Admin setup completed!');
    
  } catch (error) {
    console.error('❌ Error making admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to make admin',
      details: error.message
    });
  }
});

module.exports = router; 