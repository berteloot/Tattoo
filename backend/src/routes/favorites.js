const express = require('express')
const { body, param, validationResult } = require('express-validator')
const { authenticateToken } = require('../middleware/auth')
const { PrismaClient } = require('@prisma/client')

const router = express.Router()
const prisma = new PrismaClient()

// Get user's favorite artists
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id

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

    // Calculate average rating and review count for each artist
    const favoritesWithRatings = await Promise.all(
      favorites.map(async (favorite) => {
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
      })
    )

    res.json({
      success: true,
      data: {
        favorites: favoritesWithRatings
      }
    })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    res.status(500).json({
      success: false,
      error: 'Server error while fetching favorites'
    })
  }
})

// Add artist to favorites
router.post('/', [
  authenticateToken,
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
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_artistId: {
          userId: userId,
          artistId: artistId
        }
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
    })
  }
})

// Remove artist from favorites
router.delete('/:artistId', [
  authenticateToken,
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
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_artistId: {
          userId: userId,
          artistId: artistId
        }
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
        userId_artistId: {
          userId: userId,
          artistId: artistId
        }
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
router.get('/check/:artistId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { artistId } = req.params

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_artistId: {
          userId: userId,
          artistId: artistId
        }
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

module.exports = router 