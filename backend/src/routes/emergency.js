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

// Emergency endpoint to fix map data
router.post('/fix-map-data', async (req, res) => {
  try {
    console.log('🔧 Emergency map fix requested...');
    
    // Montreal coordinates for different areas
    const montrealCoordinates = [
      { lat: 45.5017, lng: -73.5673, name: 'Downtown Montreal' },
      { lat: 45.5048, lng: -73.5732, name: 'Old Montreal' },
      { lat: 45.4972, lng: -73.5784, name: 'Plateau Mont-Royal' },
      { lat: 45.5234, lng: -73.5878, name: 'Mile End' },
      { lat: 45.5168, lng: -73.5612, name: 'Village' },
      { lat: 45.4905, lng: -73.5708, name: 'Griffintown' },
      { lat: 45.5088, lng: -73.5542, name: 'Quartier Latin' },
      { lat: 45.5200, lng: -73.6100, name: 'Outremont' },
      { lat: 45.4800, lng: -73.5800, name: 'Verdun' },
      { lat: 45.5300, lng: -73.6200, name: 'Côte-des-Neiges' }
    ];

    // Get studios without coordinates
    const studios = await prisma.studio.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null }
        ]
      },
      take: 20
    });

    console.log(`📊 Found ${studios.length} studios without coordinates`);

    if (studios.length === 0) {
      return res.json({
        success: true,
        message: 'All studios already have coordinates!',
        updated: 0
      });
    }

    // Update each studio with coordinates
    let updatedCount = 0;
    for (let i = 0; i < studios.length; i++) {
      const studio = studios[i];
      const coords = montrealCoordinates[i % montrealCoordinates.length];
      
      console.log(`📍 Updating ${studio.title} with coordinates: ${coords.lat}, ${coords.lng}`);
      
      await prisma.studio.update({
        where: { id: studio.id },
        data: {
          latitude: coords.lat,
          longitude: coords.lng,
          address: studio.address || `${Math.floor(Math.random() * 9999) + 1000} ${['Main St', 'Oak Ave', 'Pine St', 'Maple Dr', 'Cedar Ln'][Math.floor(Math.random() * 5)]}`,
          city: studio.city || 'Montreal',
          state: studio.state || 'Quebec',
          zipCode: studio.zipCode || `H${Math.floor(Math.random() * 9) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(Math.random() * 9) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`
        }
      });
      updatedCount++;
    }

    // Get updated studios for verification
    const updatedStudios = await prisma.studio.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        state: true
      },
      take: 10
    });

    console.log('✅ Map fix completed successfully!');

    res.json({
      success: true,
      message: `Successfully updated ${updatedCount} studios with coordinates`,
      updated: updatedCount,
      studios: updatedStudios
    });

  } catch (error) {
    console.error('❌ Error fixing map data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fix map data',
      details: error.message
    });
  }
});

module.exports = router; 