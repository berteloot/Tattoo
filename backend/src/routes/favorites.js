const express = require('express')
const { body, param, validationResult } = require('express-validator')
const { protect } = require('../middleware/auth')
const { prisma } = require('../utils/prisma')

const router = express.Router()

// Get user's favorite artists
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id
    console.log('🔍 Fetching favorites for user:', userId)

    // First check if the favorites table exists
    try {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'favorites'
        );
      `;
      
      if (!tableExists[0].exists) {
        console.log('❌ Favorites table does not exist, creating it...');
        
        // Create the favorites table
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "favorites" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "artistId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
          );
        `);
        
        // Add foreign key constraints
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "favorites" ADD CONSTRAINT IF NOT EXISTS "favorites_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
        `);
        
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "favorites" ADD CONSTRAINT IF NOT EXISTS "favorites_artistId_fkey" 
          FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE CASCADE;
        `);
        
        // Add unique constraint
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "favorites" ADD CONSTRAINT IF NOT EXISTS "unique_user_artist_favorite" 
          UNIQUE ("userId", "artistId");
        `);
        
        // Add indexes
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_favorites_user_id" ON "favorites"("userId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_favorites_artist_id" ON "favorites"("artistId");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_favorites_created_at" ON "favorites"("createdAt");`);
        
        console.log('✅ Favorites table created successfully');
      } else {
        console.log('✅ Favorites table exists');
      }
    } catch (tableError) {
      console.error('❌ Error checking/creating favorites table:', tableError);
      return res.status(500).json({
        success: false,
        error: 'Database schema error - please contact support'
      });
    }

    // Now fetch favorites
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: userId
      },
      include: {
        artist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            specialties: true,
            services: true,
            _count: {
              select: {
                flash: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`📊 Found ${favorites.length} favorites for user ${userId}`);

    // Calculate average rating and review count for each artist
    const favoritesWithRatings = await Promise.all(
      favorites.map(async (favorite) => {
        try {
          const reviews = await prisma.review.findMany({
            where: {
              recipientId: favorite.artist.userId
            }
          })

          const averageRating = reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : 0

          return {
            ...favorite,
            artist: {
              ...favorite.artist,
              averageRating: Math.round(averageRating * 10) / 10,
              reviewCount: reviews.length
            }
          }
        } catch (ratingError) {
          console.error('⚠️ Error calculating rating for artist:', favorite.artistId, ratingError);
          return {
            ...favorite,
            artist: {
              ...favorite.artist,
              averageRating: 0,
              reviewCount: 0
            }
          }
        }
      })
    )

    res.json({
      success: true,
      data: {
        favorites: favoritesWithRatings
      }
    })
  } catch (error) {
    console.error('❌ Error fetching favorites:', error)
    console.error('Stack trace:', error.stack)
    
    // Provide more specific error messages
    let errorMessage = 'Server error while fetching favorites'
    if (error.code === 'P2002') {
      errorMessage = 'Database constraint violation'
    } else if (error.code === 'P2003') {
      errorMessage = 'Database foreign key constraint failed'
    } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
      errorMessage = 'Database table missing - please contact support'
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Add artist to favorites
router.post('/', [
  protect,
  body('artistId').isString().notEmpty().withMessage('Artist ID is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  try {
    const userId = req.user.id
    const { artistId } = req.body

    // Check if user is a client
    if (req.user.role !== 'CLIENT') {
      return res.status(403).json({
        success: false,
        error: 'Only clients can favorite artists'
      })
    }

    // Check if artist exists
    const artist = await prisma.artistProfile.findUnique({
      where: { id: artistId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    if (!artist) {
      return res.status(404).json({
        success: false,
        error: 'Artist not found'
      })
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        artistId: artistId
      }
    })

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        error: 'Artist is already in your favorites'
      })
    }

    // Add to favorites
    const favorite = await prisma.favorite.create({
      data: {
        userId: userId,
        artistId: artistId
      },
      include: {
        artist: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            specialties: true,
            services: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      data: {
        favorite: favorite,
        message: `${artist.user.firstName} ${artist.user.lastName} added to favorites`
      }
    })
  } catch (error) {
    console.error('Error adding favorite:', error)
    res.status(500).json({
      success: false,
      error: 'Server error while adding favorite'
    });
  }
})

// Remove artist from favorites
router.delete('/:artistId', [
  protect,
  param('artistId').isString().notEmpty().withMessage('Artist ID is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  try {
    const userId = req.user.id
    const { artistId } = req.params

    // Check if user is a client
    if (req.user.role !== 'CLIENT') {
      return res.status(403).json({
        success: false,
        error: 'Only clients can manage favorites'
      })
    }

    // Find and delete the favorite
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        artistId: artistId
      },
      include: {
        artist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    if (!favorite) {
      return res.status(404).json({
        success: false,
        error: 'Artist is not in your favorites'
      })
    }

    await prisma.favorite.delete({
      where: {
        id: favorite.id
      }
    })

    res.json({
      success: true,
      data: {
        message: `${favorite.artist.user.firstName} ${favorite.artist.user.lastName} removed from favorites`
      }
    })
  } catch (error) {
    console.error('Error removing favorite:', error)
    res.status(500).json({
      success: false,
      error: 'Server error while removing favorite'
    })
  }
})

// Check if artist is favorited by current user
router.get('/check/:artistId', protect, async (req, res) => {
  try {
    const userId = req.user.id
    const { artistId } = req.params

    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: userId,
        artistId: artistId
      }
    })

    res.json({
      success: true,
      data: {
        isFavorited: !!favorite
      }
    })
  } catch (error) {
    console.error('Error checking favorite status:', error)
    res.status(500).json({
      success: false,
      error: 'Server error while checking favorite status'
    })
  }
})

// Health check endpoint for debugging
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 Favorites health check requested');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if favorites table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'favorites'
      );
    `;
    
    if (tableExists[0].exists) {
      // Get table structure
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'favorites'
        ORDER BY ordinal_position;
      `;
      
      // Get constraint information
      const constraints = await prisma.$queryRaw`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints 
        WHERE table_name = 'favorites';
      `;
      
      // Get index information
      const indexes = await prisma.$queryRaw`
        SELECT indexname, indexdef
        FROM pg_indexes 
        WHERE tablename = 'favorites';
      `;
      
      res.json({
        success: true,
        data: {
          status: 'healthy',
          database: 'connected',
          favoritesTable: {
            exists: true,
            columns: columns,
            constraints: constraints,
            indexes: indexes
          }
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          status: 'warning',
          database: 'connected',
          favoritesTable: {
            exists: false,
            message: 'Favorites table does not exist - will be created on first request'
          }
        }
      });
    }
  } catch (error) {
    console.error('❌ Health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

module.exports = router 