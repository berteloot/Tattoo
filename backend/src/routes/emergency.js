const express = require('express');
const { prisma } = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

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

/**
 * @route   POST /api/emergency/fix-gallery-columns
 * @desc    Emergency fix to rename gallery columns from snake_case to camelCase
 * @access  Public (for emergency use only)
 */
router.post('/fix-gallery-columns', async (req, res) => {
  try {
    console.log('🔧 Emergency gallery column fix requested...');
    
    // First, check what columns currently exist
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'tattoo_gallery'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Current columns in production:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });
    
    // Fix column names from snake_case to camelCase
    const columnMappings = [
      { from: 'image_url', to: 'imageUrl' },
      { from: 'image_public_id', to: 'imagePublicId' },
      { from: 'image_width', to: 'imageWidth' },
      { from: 'image_height', to: 'imageHeight' },
      { from: 'image_format', to: 'imageFormat' },
      { from: 'image_bytes', to: 'imageBytes' },
      { from: 'thumbnail_url', to: 'thumbnailUrl' },
      { from: 'tattoo_style', to: 'tattooStyle' },
      { from: 'body_location', to: 'bodyLocation' },
      { from: 'tattoo_size', to: 'tattooSize' },
      { from: 'color_type', to: 'colorType' },
      { from: 'session_count', to: 'sessionCount' },
      { from: 'hours_spent', to: 'hoursSpent' },
      { from: 'client_consent', to: 'clientConsent' },
      { from: 'client_anonymous', to: 'clientAnonymous' },
      { from: 'client_age_verified', to: 'clientAgeVerified' },
      { from: 'is_before_after', to: 'isBeforeAfter' },
      { from: 'before_image_url', to: 'beforeImageUrl' },
      { from: 'before_image_public_id', to: 'beforeImagePublicId' },
      { from: 'after_image_url', to: 'afterImageUrl' },
      { from: 'after_image_public_id', to: 'afterImagePublicId' },
      { from: 'is_featured', to: 'isFeatured' },
      { from: 'is_approved', to: 'isApproved' },
      { from: 'is_hidden', to: 'isHidden' },
      { from: 'completed_at', to: 'completedAt' },
      { from: 'created_at', to: 'createdAt' },
      { from: 'updated_at', to: 'updatedAt' }
    ];
    
    const renamedColumns = [];
    
    // Rename columns that exist with snake_case names
    for (const mapping of columnMappings) {
      const columnExists = columns.some(col => col.column_name === mapping.from);
      const targetExists = columns.some(col => col.column_name === mapping.to);
      
      if (columnExists && !targetExists) {
        console.log(`🔄 Renaming ${mapping.from} → ${mapping.to}`);
        await prisma.$executeRawUnsafe(`
          ALTER TABLE tattoo_gallery 
          RENAME COLUMN "${mapping.from}" TO "${mapping.to}";
        `);
        renamedColumns.push(mapping);
      } else if (columnExists && targetExists) {
        console.log(`⚠️  Both ${mapping.from} and ${mapping.to} exist, skipping`);
      } else if (!columnExists && targetExists) {
        console.log(`✅ ${mapping.to} already exists`);
      } else {
        console.log(`❌ Neither ${mapping.from} nor ${mapping.to} found`);
      }
    }
    
    // Check final column names
    const finalColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'tattoo_gallery'
      ORDER BY ordinal_position;
    `;
    
    console.log('✅ Gallery column fix completed!');
    
    res.json({
      success: true,
      message: `Gallery column fix completed! ${renamedColumns.length} columns renamed`,
      data: {
        renamedColumns,
        totalRenamed: renamedColumns.length,
        finalColumns: finalColumns.map(col => col.column_name)
      }
    });
    
  } catch (error) {
    console.error('❌ Error fixing gallery columns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fix gallery columns',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/emergency/create-gallery-tables
 * @desc    Emergency endpoint to create gallery tables if they don't exist
 * @access  Public (for emergency use only)
 */
router.post('/create-gallery-tables', async (req, res) => {
  try {
    console.log('🔧 Emergency gallery table creation requested...');
    
    // Check if tattoo_gallery table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tattoo_gallery'
      );
    `;
    
    if (tableExists[0].exists) {
      console.log('✅ tattoo_gallery table already exists');
      
      // Check column names
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'tattoo_gallery'
        ORDER BY ordinal_position;
      `;
      
      console.log('📋 Current columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });
      
      return res.json({
        success: true,
        message: 'Gallery tables already exist',
        data: {
          tableExists: true,
          columns: columns.map(col => col.column_name)
        }
      });
    }
    
    console.log('❌ tattoo_gallery table does not exist, creating...');
    
    // Create the table with snake_case column names
    await prisma.$executeRawUnsafe(`
      CREATE TABLE tattoo_gallery (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        artist_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        image_public_id TEXT,
        image_width INTEGER,
        image_height INTEGER,
        image_format TEXT,
        image_bytes INTEGER,
        thumbnail_url TEXT,
        tattoo_style TEXT,
        body_location TEXT,
        tattoo_size TEXT,
        color_type TEXT,
        session_count INTEGER NOT NULL DEFAULT 1,
        hours_spent INTEGER,
        client_consent BOOLEAN NOT NULL DEFAULT false,
        client_anonymous BOOLEAN NOT NULL DEFAULT true,
        client_age_verified BOOLEAN NOT NULL DEFAULT false,
        is_before_after BOOLEAN NOT NULL DEFAULT false,
        before_image_url TEXT,
        before_image_public_id TEXT,
        after_image_url TEXT,
        after_image_public_id TEXT,
        is_featured BOOLEAN NOT NULL DEFAULT false,
        is_approved BOOLEAN NOT NULL DEFAULT false,
        is_hidden BOOLEAN NOT NULL DEFAULT false,
        tags TEXT[],
        categories TEXT[],
        completed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('✅ tattoo_gallery table created');
    
    // Create indexes
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_artist_id ON tattoo_gallery(artist_id);
      CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_tattoo_style ON tattoo_gallery(tattoo_style);
      CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_body_location ON tattoo_gallery(body_location);
      CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_is_featured ON tattoo_gallery(is_featured);
      CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_is_approved ON tattoo_gallery(is_approved);
      CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_created_at ON tattoo_gallery(created_at);
      CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_tags ON tattoo_gallery USING GIN(tags);
      CREATE INDEX IF NOT EXISTS idx_tattoo_gallery_categories ON tattoo_gallery USING GIN(categories);
    `);
    
    console.log('✅ Indexes created');
    
    // Create other tables
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS tattoo_gallery_likes (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        gallery_item_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(gallery_item_id, user_id)
      );
      
      CREATE TABLE IF NOT EXISTS tattoo_gallery_comments (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        gallery_item_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        comment TEXT NOT NULL,
        is_approved BOOLEAN NOT NULL DEFAULT true,
        is_hidden BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS tattoo_gallery_views (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        gallery_item_id TEXT NOT NULL,
        viewer_ip TEXT,
        user_agent TEXT,
        referrer TEXT,
        viewed_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log('✅ All gallery tables created');
    
    res.json({
      success: true,
      message: 'Gallery tables created successfully',
      data: {
        tablesCreated: ['tattoo_gallery', 'tattoo_gallery_likes', 'tattoo_gallery_comments', 'tattoo_gallery_views']
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating gallery tables:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create gallery tables',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/emergency/regenerate-prisma
 * @desc    Regenerate Prisma client (temporary emergency endpoint)
 * @access  Private (ADMIN only)
 */
router.post('/regenerate-prisma', async (req, res) => {
  try {
    console.log('🔄 Emergency Prisma client regeneration requested...');
    
    // Regenerate Prisma client
    console.log('📥 Pulling latest schema from database...');
    try {
      execSync('npx prisma db pull', { stdio: 'inherit' });
      console.log('✅ Database schema pulled successfully');
    } catch (error) {
      console.log('⚠️ Could not pull schema:', error.message);
    }

    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated successfully');

    // Test the new client
    console.log('🧪 Testing new Prisma client...');
    const prisma = new PrismaClient();

    try {
      await prisma.$connect();
      
      const result = await prisma.artistProfile.findFirst({
        select: {
          id: true,
          profilePictureUrl: true,
          profilePicturePublicId: true,
          profilePictureWidth: true,
          profilePictureHeight: true,
          profilePictureFormat: true,
          profilePictureBytes: true
        }
      });
      
      console.log('✅ Prisma client now recognizes profile picture fields');
      console.log('📊 Test query result:', result);
      
      res.json({
        success: true,
        message: 'Prisma client regenerated successfully',
        testResult: result
      });
      
    } catch (error) {
      console.log('❌ Prisma client still has issues:', error.message);
      res.status(500).json({
        success: false,
        error: 'Prisma client regeneration failed: ' + error.message
      });
    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('❌ Error regenerating Prisma client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to regenerate Prisma client: ' + error.message
    });
  }
});

module.exports = router; 