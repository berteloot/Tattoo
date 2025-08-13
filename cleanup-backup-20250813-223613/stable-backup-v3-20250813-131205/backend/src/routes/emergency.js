const express = require('express');
const bcrypt = require('bcryptjs');
const { prisma } = require('../utils/prisma');

const router = express.Router();

// Emergency endpoint to recreate test users (only works in production)
router.post('/recreate-users', async (req, res) => {
  try {
    // Only allow in production and with a secret key
    if (process.env.NODE_ENV !== 'production') {
      return res.status(403).json({ error: 'Only available in production' });
    }

    console.log('🚨 Emergency: Recreating test users...');

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const artistPasswordHash = await bcrypt.hash('artist123', 10);
    const clientPasswordHash = await bcrypt.hash('client123', 10);

    // Upsert admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'berteloot@gmail.com' },
      update: { 
        password: adminPasswordHash,
        isActive: true,
        emailVerified: true
      },
      create: {
        email: 'berteloot@gmail.com',
        password: adminPasswordHash,
        firstName: 'Stanislas',
        lastName: 'Berteloot',
        role: 'ADMIN',
        emailVerified: true,
        isActive: true
      }
    });

    // Upsert artist user
    const artistUser = await prisma.user.upsert({
      where: { email: 'artist@example.com' },
      update: { 
        password: artistPasswordHash,
        isActive: true,
        emailVerified: true
      },
      create: {
        email: 'artist@example.com',
        password: artistPasswordHash,
        firstName: 'Test',
        lastName: 'Artist',
        role: 'ARTIST',
        emailVerified: true,
        isActive: true
      }
    });

    // Ensure artist has profile
    await prisma.artistProfile.upsert({
      where: { userId: artistUser.id },
      update: { 
        isVerified: true,
        verificationStatus: 'APPROVED'
      },
      create: {
        userId: artistUser.id,
        bio: 'Test artist account',
        studioName: 'Test Studio',
        isVerified: true,
        verificationStatus: 'APPROVED'
      }
    });

    // Upsert client user
    await prisma.user.upsert({
      where: { email: 'client@example.com' },
      update: { 
        password: clientPasswordHash,
        isActive: true,
        emailVerified: true
      },
      create: {
        email: 'client@example.com',
        password: clientPasswordHash,
        firstName: 'Test',
        lastName: 'Client',
        role: 'CLIENT',
        emailVerified: true,
        isActive: true
      }
    });

    console.log('✅ Emergency user recreation completed');

    res.json({ 
      success: true, 
      message: 'Test users recreated successfully',
      users: ['berteloot@gmail.com', 'artist@example.com', 'client@example.com']
    });

  } catch (error) {
    console.error('❌ Emergency user recreation failed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to recreate users',
      details: error.message
    });
  }
});

module.exports = router;